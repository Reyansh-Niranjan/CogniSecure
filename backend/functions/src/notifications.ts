import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Firestore trigger: Send notifications when new alert is created
 */
export const sendAlertNotifications = functions.firestore
    .document('alerts/{alertId}')
    .onCreate(async (snapshot, context) => {
        const alert = snapshot.data();
        const alertId = context.params.alertId;

        functions.logger.info('New alert detected, sending notifications', { alertId });

        try {
            // Get all active officers
            const officersSnapshot = await db
                .collection('officers')
                .where('is_active', '==', true)
                .get();

            if (officersSnapshot.empty) {
                functions.logger.warn('No active officers found');
                return;
            }

            // Collect all FCM tokens
            const tokens: string[] = [];
            const officerTokenMap = new Map<string, string[]>(); // officer_id -> tokens

            officersSnapshot.forEach((doc) => {
                const officer = doc.data();
                if (officer.fcm_tokens && officer.fcm_tokens.length > 0) {
                    officerTokenMap.set(doc.id, officer.fcm_tokens);
                    tokens.push(...officer.fcm_tokens);
                }
            });

            if (tokens.length === 0) {
                functions.logger.warn('No FCM tokens registered');
                return;
            }

            // Create notification payload
            const message = {
                notification: {
                    title: '🚨 Security Alert',
                    body: `Motion detected at ${alert.location || 'unknown location'}`,
                },
                data: {
                    alert_id: alertId,
                    photo_url: alert.photo_url,
                    video_url: alert.video_url,
                    timestamp: alert.timestamp_recorded.toString(),
                    type: 'security_alert',
                },
            };

            // Send to all tokens
            const sendPromises = tokens.map(async (token) => {
                try {
                    const response = await admin.messaging().send({
                        ...message,
                        token,
                    });

                    // Find which officer this token belongs to
                    let officerId = '';
                    for (const [oid, otokens] of officerTokenMap.entries()) {
                        if (otokens.includes(token)) {
                            officerId = oid;
                            break;
                        }
                    }

                    // Log successful notification
                    await db.collection('notificationLogs').add({
                        alert_id: alertId,
                        officer_id: officerId,
                        notification_type: 'fcm_push',
                        sent_at: admin.firestore.FieldValue.serverTimestamp(),
                        delivery_status: 'sent',
                        fcm_message_id: response,
                        fcm_token_used: token,
                        retry_count: 0,
                    });

                    return { success: true, token };
                } catch (error: any) {
                    functions.logger.error('Failed to send to token', { token, error: error.message });

                    // Find officer for this token
                    let officerId = '';
                    for (const [oid, otokens] of officerTokenMap.entries()) {
                        if (otokens.includes(token)) {
                            officerId = oid;
                            break;
                        }
                    }

                    // Log failed notification
                    await db.collection('notificationLogs').add({
                        alert_id: alertId,
                        officer_id: officerId,
                        notification_type: 'fcm_push',
                        sent_at: admin.firestore.FieldValue.serverTimestamp(),
                        delivery_status: 'failed',
                        fcm_token_used: token,
                        error_message: error.message,
                        retry_count: 0,
                    });

                    return { success: false, token, error: error.message };
                }
            });

            const results = await Promise.allSettled(sendPromises);
            const successful = results.filter((r) => r.status === 'fulfilled').length;
            const failed = results.filter((r) => r.status === 'rejected').length;

            functions.logger.info('Notifications sent', {
                alertId,
                total: tokens.length,
                successful,
                failed,
            });
        } catch (error: any) {
            functions.logger.error('Error in sendAlertNotifications', error);
        }
    });

/**
 * Register FCM token for an officer
 */
export const registerDeviceToken = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const { fcm_token } = data;

    if (!fcm_token) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing fcm_token');
    }

    try {
        const officerRef = db.collection('officers').doc(context.auth.uid);
        const officerDoc = await officerRef.get();

        if (!officerDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Officer profile not found');
        }

        const officer = officerDoc.data()!;
        const currentTokens = officer.fcm_tokens || [];

        // Add token if not already present
        if (!currentTokens.includes(fcm_token)) {
            await officerRef.update({
                fcm_tokens: admin.firestore.FieldValue.arrayUnion(fcm_token),
            });
        }

        return {
            success: true,
            message: 'FCM token registered',
        };
    } catch (error: any) {
        functions.logger.error('Error registering FCM token', error);
        throw new functions.https.HttpsError('internal', 'Failed to register token');
    }
});

/**
 * Remove FCM token (on logout/uninstall)
 */
export const removeDeviceToken = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const { fcm_token } = data;

    if (!fcm_token) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing fcm_token');
    }

    try {
        const officerRef = db.collection('officers').doc(context.auth.uid);

        await officerRef.update({
            fcm_tokens: admin.firestore.FieldValue.arrayRemove(fcm_token),
        });

        return {
            success: true,
            message: 'FCM token removed',
        };
    } catch (error: any) {
        functions.logger.error('Error removing FCM token', error);
        throw new functions.https.HttpsError('internal', 'Failed to remove token');
    }
});
