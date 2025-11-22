import { v } from "convex/values";
import { action, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Query the AI agent with strict security restrictions
 * 
 * Security Restrictions:
 * 1. Only authenticated officers can query
 * 2. Rate limited to 50 queries/hour per officer
 * 3. AI can ONLY access data provided in context (no external queries)
 * 4. All queries are logged for audit
 * 5. Query content is sanitized
 */
export const queryAIAgent = action({
    args: {
        session_token: v.string(),
        query: v.string(),
        include_alert_ids: v.optional(v.array(v.id("alerts"))), // Specific alerts to include in context
    },
    handler: async (ctx, args) => {
        const startTime = Date.now();

        // 1. Validate session
        const session = await ctx.runQuery(internal.aiAgent.validateOfficerSession, {
            token: args.session_token,
        });

        if (!session.valid) {
            return {
                success: false,
                error: "Invalid or expired session",
                blocked: true,
            };
        }

        const officer_id = session.officer_id!;
        const session_id = session.session_id!;

        // 2. Check rate limiting
        const rateLimitCheck = await ctx.runMutation(internal.aiAgent.checkRateLimit, {
            officer_id,
        });

        if (!rateLimitCheck.allowed) {
            await ctx.runMutation(internal.aiAgent.logBlockedQuery, {
                officer_id,
                session_id,
                query: args.query,
                block_reason: `Rate limit exceeded (${rateLimitCheck.current_count}/50 queries this hour)`,
            });

            return {
                success: false,
                error: `Rate limit exceeded. You can make ${50 - rateLimitCheck.current_count} more queries this hour.`,
                blocked: true,
            };
        }

        // 3. Sanitize query (remove potential injection attempts)
        const sanitizedQuery = sanitizeQuery(args.query);

        // 4. Build context from provided data only
        const context = await ctx.runQuery(internal.aiAgent.buildRestrictedContext, {
            alert_ids: args.include_alert_ids || [],
        });

        // 5. Call OpenRouter API
        try {
            const response = await callOpenRouter(sanitizedQuery, context);

            // 6. Log successful query
            await ctx.runMutation(internal.aiAgent.logQuery, {
                officer_id,
                session_id,
                query: sanitizedQuery,
                response: response.answer,
                context_used: context.alert_ids,
                model_used: response.model,
                tokens_used: response.tokens,
                response_time_ms: Date.now() - startTime,
                was_blocked: false,
            });

            return {
                success: true,
                answer: response.answer,
                model: response.model,
                tokens: response.tokens,
            };
        } catch (error: any) {
            console.error("AI query error:", error);

            await ctx.runMutation(internal.aiAgent.logQuery, {
                officer_id,
                session_id,
                query: sanitizedQuery,
                response: `Error: ${error.message}`,
                context_used: [],
                model_used: "unknown",
                tokens_used: 0,
                response_time_ms: Date.now() - startTime,
                was_blocked: true,
                block_reason: error.message,
            });

            return {
                success: false,
                error: "Failed to process query. Please try again.",
                blocked: false,
            };
        }
    },
});

/**
 * Validate officer session (internal)
 */
export const validateOfficerSession = internalQuery({
    args: {
        token: v.string(),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db
            .query("sessions")
            .withIndex("by_token", (q) => q.eq("token", args.token))
            .unique();

        if (!session) {
            return { valid: false };
        }

        if (!session.is_valid || Date.now() > session.expires_at) {
            return { valid: false };
        }

        const officer = await ctx.db.get(session.officer_id);
        if (!officer || !officer.is_active) {
            return { valid: false };
        }

        return {
            valid: true,
            officer_id: session.officer_id,
            session_id: session._id,
        };
    },
});

/**
 * Check and update rate limit (internal)
 */
export const checkRateLimit = internalMutation({
    args: {
        officer_id: v.id("police_officers"),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const currentHour = Math.floor(now / (60 * 60 * 1000)) * (60 * 60 * 1000);
        const MAX_QUERIES_PER_HOUR = 50;

        // Find or create rate limit record for this hour
        const existing = await ctx.db
            .query("rate_limits")
            .withIndex("by_officer_hour", (q) =>
                q.eq("officer_id", args.officer_id).eq("hour_timestamp", currentHour)
            )
            .unique();

        if (existing) {
            if (existing.query_count >= MAX_QUERIES_PER_HOUR) {
                return {
                    allowed: false,
                    current_count: existing.query_count,
                };
            }

            // Increment count
            await ctx.db.patch(existing._id, {
                query_count: existing.query_count + 1,
            });

            return {
                allowed: true,
                current_count: existing.query_count + 1,
            };
        } else {
            // Create new record
            await ctx.db.insert("rate_limits", {
                officer_id: args.officer_id,
                hour_timestamp: currentHour,
                query_count: 1,
            });

            return {
                allowed: true,
                current_count: 1,
            };
        }
    },
});

/**
 * Build restricted context from only provided alert IDs (internal)
 * AI can ONLY access this data, nothing else
 */
export const buildRestrictedContext = internalQuery({
    args: {
        alert_ids: v.array(v.id("alerts")),
    },
    handler: async (ctx, args) => {
        if (args.alert_ids.length === 0) {
            return {
                context_text: "No specific alerts provided. I can only answer questions about the alerts you provide.",
                alert_ids: [],
            };
        }

        // Fetch only the specified alerts
        const alerts = await Promise.all(
            args.alert_ids.map((id) => ctx.db.get(id))
        );

        const validAlerts = alerts.filter((a) => a !== null);

        // Build context string
        const contextText = validAlerts
            .map((alert, idx) => {
                return `
Alert ${idx + 1}:
- Alert ID: ${alert!._id}
- Recorded: ${new Date(alert!.timestamp_recorded).toISOString()}
- Received: ${new Date(alert!.timestamp_received).toISOString()}
- Delay: ${alert!.delay_ms}ms
- Device: ${alert!.rpi_device_id}
- Location: ${alert!.location || "Unknown"}
- Status: ${alert!.status}
- Photo: ${alert!.photo_url}
- Video: ${alert!.video_url}
${alert!.notes ? `- Notes: ${alert!.notes}` : ""}
        `.trim();
            })
            .join("\n\n");

        return {
            context_text: contextText,
            alert_ids: validAlerts.map((a) => a!._id),
        };
    },
});

/**
 * Log AI query (internal)
 */
export const logQuery = internalMutation({
    args: {
        officer_id: v.id("police_officers"),
        session_id: v.id("sessions"),
        query: v.string(),
        response: v.string(),
        context_used: v.array(v.string()),
        model_used: v.string(),
        tokens_used: v.number(),
        response_time_ms: v.number(),
        was_blocked: v.boolean(),
        block_reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("ai_agent_logs", {
            officer_id: args.officer_id,
            session_id: args.session_id,
            query: args.query,
            response: args.response,
            context_used: args.context_used,
            model_used: args.model_used,
            tokens_used: args.tokens_used,
            response_time_ms: args.response_time_ms,
            timestamp: Date.now(),
            was_blocked: args.was_blocked,
            block_reason: args.block_reason,
        });
    },
});

/**
 * Log blocked query (internal)
 */
export const logBlockedQuery = internalMutation({
    args: {
        officer_id: v.id("police_officers"),
        session_id: v.id("sessions"),
        query: v.string(),
        block_reason: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("ai_agent_logs", {
            officer_id: args.officer_id,
            session_id: args.session_id,
            query: args.query,
            response: "Query blocked",
            context_used: [],
            model_used: "none",
            tokens_used: 0,
            response_time_ms: 0,
            timestamp: Date.now(),
            was_blocked: true,
            block_reason: args.block_reason,
        });
    },
});

/**
 * Sanitize query to prevent injection
 */
function sanitizeQuery(query: string): string {
    // Remove potential code injection attempts
    let sanitized = query
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+=/gi, "");

    // Limit length
    if (sanitized.length > 1000) {
        sanitized = sanitized.substring(0, 1000);
    }

    return sanitized.trim();
}

/**
 * Call OpenRouter API
 * This is a placeholder - actual implementation needs OpenRouter API key
 */
async function callOpenRouter(
    query: string,
    context: { context_text: string; alert_ids: string[] }
): Promise<{ answer: string; model: string; tokens: number }> {
    // In production, this would use the actual OpenRouter API
    // Example with OpenAI SDK (which works with OpenRouter):
    /*
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });
  
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are a security assistant for police officers. You can ONLY answer questions based on the provided alert data. Do not make assumptions or provide information not in the context.
  
  Context:
  ${context.context_text}
  
  If the user asks about anything not in this context, politely inform them you can only analyze the provided alerts.`,
        },
        {
          role: "user",
          content: query,
        },
      ],
    });
  
    return {
      answer: response.choices[0].message.content || "No response",
      model: response.model,
      tokens: response.usage?.total_tokens || 0,
    };
    */

    // Placeholder response for now
    return {
        answer: `This is a placeholder response. In production, I would analyze the provided alerts: ${context.alert_ids.join(", ")}. Your query was: "${query}"`,
        model: "gpt-4-turbo",
        tokens: 150,
    };
}
