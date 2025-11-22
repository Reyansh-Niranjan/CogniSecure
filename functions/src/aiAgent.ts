import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import OpenAI from 'openai';

const db = admin.firestore();

// Initialize OpenRouter client
const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
});

/**
 * Query AI agent with strict security restrictions
 * 
 * Security:
 * - Must be authenticated officer
 * - Rate limited to 50 queries/hour
 * - AI can ONLY access alerts provided in alert_ids
 * - All queries logged for audit
 */
export const queryAI = functions.https.onCall(async (data, context) => {
    const startTime = Date.now();

    // 1. Authentication check
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const role = context.auth.token.role;
    if (!['officer', 'admin', 'supervisor'].includes(role)) {
        throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
    }

    const { query, alert_ids = [] } = data;

    if (!query || typeof query !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'Missing or invalid query');
    }

    const officerId = context.auth.uid;

    try {
        // 2. Check rate limit
        const currentHour = Math.floor(Date.now() / (60 * 60 * 1000)) * (60 * 60 * 1000);
        const rateLimitQuery = await db
            .collection('rateLimits')
            .where('officer_id', '==', officerId)
            .where('hour_timestamp', '==', currentHour)
            .get();

        let currentCount = 0;
        const MAX_QUERIES = 50;

        if (!rateLimitQuery.empty) {
            const rateLimitDoc = rateLimitQuery.docs[0];
            currentCount = rateLimitDoc.data().query_count;

            if (currentCount >= MAX_QUERIES) {
                // Log blocked query
                await db.collection('aiAgentLogs').add({
                    officer_id: officerId,
                    query: sanitizeQuery(query),
                    response: 'Query blocked',
                    context_used: [],
                    model_used: 'none',
                    tokens_used: 0,
                    response_time_ms: 0,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                    was_blocked: true,
                    block_reason: `Rate limit exceeded (${currentCount}/${MAX_QUERIES} queries this hour)`,
                });

                throw new functions.https.HttpsError(
                    'resource-exhausted',
                    `Rate limit exceeded. You can make ${MAX_QUERIES - currentCount} more queries this hour.`
                );
            }

            // Increment count
            await rateLimitDoc.ref.update({
                query_count: admin.firestore.FieldValue.increment(1),
            });
        } else {
            // Create new rate limit record
            await db.collection('rateLimits').add({
                officer_id: officerId,
                hour_timestamp: currentHour,
                query_count: 1,
            });
        }

        // 3. Sanitize query
        const sanitizedQuery = sanitizeQuery(query);

        // 4. Build context from ONLY provided alerts
        const context = await buildRestrictedContext(alert_ids);

        // 5. Call OpenRouter
        const systemPrompt = `You are a security assistant for police officers. You can ONLY answer questions based on the provided alert data. Do not make assumptions or provide information not in the context.

Context:
${context.contextText}

If the user asks about anything not in this context, politely inform them you can only analyze the provided alerts.`;

        const completion = await openai.chat.completions.create({
            model: 'openai/gpt-4-turbo',
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                {
                    role: 'user',
                    content: sanitizedQuery,
                },
            ],
            max_tokens: 1000,
        });

        const answer = completion.choices[0].message.content || 'No response';
        const tokensUsed = completion.usage?.total_tokens || 0;

        // 6. Log query
        await db.collection('aiAgentLogs').add({
            officer_id: officerId,
            query: sanitizedQuery,
            response: answer,
            context_used: context.alertIds,
            model_used: completion.model,
            tokens_used: tokensUsed,
            response_time_ms: Date.now() - startTime,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            was_blocked: false,
        });

        return {
            success: true,
            answer,
            model: completion.model,
            tokens: tokensUsed,
        };
    } catch (error: any) {
        functions.logger.error('AI query error', error);

        // Log error
        await db.collection('aiAgentLogs').add({
            officer_id: officerId,
            query: sanitizeQuery(query),
            response: `Error: ${error.message}`,
            context_used: [],
            model_used: 'unknown',
            tokens_used: 0,
            response_time_ms: Date.now() - startTime,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            was_blocked: true,
            block_reason: error.message,
        });

        if (error.code) {
            throw error; // Re-throw HttpsError
        }

        throw new functions.https.HttpsError('internal', 'Failed to process query');
    }
});

/**
 * Build restricted context from only provided alert IDs
 */
async function buildRestrictedContext(alertIds: string[]): Promise<{
    contextText: string;
    alertIds: string[];
}> {
    if (alertIds.length === 0) {
        return {
            contextText: 'No specific alerts provided. I can only answer questions about the alerts you provide.',
            alertIds: [],
        };
    }

    // Fetch only specified alerts
    const alertPromises = alertIds.map((id) => db.collection('alerts').doc(id).get());
    const alertDocs = await Promise.all(alertPromises);

    const alerts = alertDocs
        .filter((doc) => doc.exists)
        .map((doc) => ({ id: doc.id, ...doc.data() }));

    if (alerts.length === 0) {
        return {
            contextText: 'None of the provided alert IDs were found.',
            alertIds: [],
        };
    }

    // Build context string
    const contextText = alerts
        .map((alert, idx) => {
            return `
Alert ${idx + 1}:
- Alert ID: ${alert.id}
- Recorded: ${new Date(alert.timestamp_recorded).toISOString()}
- Received: ${new Date(alert.timestamp_received).toISOString()}
- Delay: ${alert.delay_ms}ms
- Device: ${alert.rpi_device_id}
- Location: ${alert.location || 'Unknown'}
- Status: ${alert.status}
- Photo: ${alert.photo_url}
- Video: ${alert.video_url}
${alert.notes ? `- Notes: ${alert.notes}` : ''}
      `.trim();
        })
        .join('\n\n');

    return {
        contextText,
        alertIds: alerts.map((a) => a.id),
    };
}

/**
 * Sanitize query to prevent injection
 */
function sanitizeQuery(query: string): string {
    let sanitized = query
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '');

    // Limit length
    if (sanitized.length > 1000) {
        sanitized = sanitized.substring(0, 1000);
    }

    return sanitized.trim();
}

/**
 * Get AI query logs for an officer
 */
export const getAILogs = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const { limit = 50 } = data;
    const officerId = context.auth.uid;
    const isAdmin = context.auth.token.role === 'admin';

    try {
        let query = db.collection('aiAgentLogs') as any;

        // Officers can only see their own logs, admins can see all
        if (!isAdmin) {
            query = query.where('officer_id', '==', officerId);
        }

        query = query.orderBy('timestamp', 'desc').limit(limit);

        const snapshot = await query.get();
        const logs = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return { success: true, logs };
    } catch (error: any) {
        functions.logger.error('Error getting AI logs', error);
        throw new functions.https.HttpsError('internal', 'Failed to fetch logs');
    }
});
