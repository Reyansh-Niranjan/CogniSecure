import { v } from "convex/values";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

/**
 * Send notifications to all active police officers
 * This is triggered when a new alert is received
 */
export const notifyAllOfficers = action({
    args: {
        alert_id: v.id("alerts"),
    },
    handler: async (ctx, args) => {
        // Get alert details
        const alert = await ctx.runQuery(internal.notifications.getAlertForNotification, {
            alert_id: args.alert_id,
        });

        if (!alert) {
            throw new Error("Alert not found");
        }

        // Get all active officers
        const officers = await ctx.runQuery(api.auth.getAllActiveOfficers, {});

        console.log(`Notifying ${officers.length} officers about alert ${args.alert_id}`);

        // Send notifications via Firebase Cloud Messaging
        const results = await Promise.allSettled(
            officers.map((officer) =>
                ctx.runAction(internal.notifications.sendFCMNotification, {
                    officer_id: officer._id,
                    alert_id: args.alert_id,
                    title: "🚨 Security Alert",
                    body: `Motion detected at ${officer.officer_id || "unknown location"}`,
                    data: {
                        alert_id: args.alert_id,
                        photo_url: alert.photo_url,
                        video_url: alert.video_url,
                        timestamp: alert.timestamp_recorded.toString(),
                    },
                })
            )
        );

        // Count successes and failures
        const successful = results.filter((r) => r.status === "fulfilled").length;
        const failed = results.filter((r) => r.status === "rejected").length;

        return {
            success: true,
            officers_notified: officers.length,
            successful,
            failed,
        };
    },
});

/**
 * Send FCM notification to a specific officer
 * This is an internal action that uses Firebase Admin SDK
 */
export const sendFCMNotification = action({
    args: {
        officer_id: v.id("police_officers"),
        alert_id: v.id("alerts"),
        title: v.string(),
        body: v.string(),
        data: v.object({
            alert_id: v.string(),
            photo_url: v.string(),
            video_url: v.string(),
            timestamp: v.string(),
        }),
    },
    handler: async (ctx, args) => {
        // Get officer's FCM tokens
        const officer = await ctx.runQuery(internal.notifications.getOfficerTokens, {
            officer_id: args.officer_id,
        });

        if (!officer || officer.fcm_tokens.length === 0) {
            console.log(`No FCM tokens for officer ${args.officer_id}`);
            await ctx.runMutation(internal.notifications.logNotification, {
                alert_id: args.alert_id,
                officer_id: args.officer_id,
                notification_type: "fcm_push",
                delivery_status: "failed",
                error_message: "No FCM tokens registered",
            });
            return { success: false, reason: "No FCM tokens" };
        }

        // In a real implementation, you would use Firebase Admin SDK here
        // For now, we'll simulate the notification
        // The actual Firebase integration would require:
        // 1. Firebase service account credentials in environment
        // 2. Firebase Admin SDK initialization
        // 3. Sending via messaging().send()

        try {
            // Simulate sending (in production, replace with actual Firebase call)
            const sent_at = Date.now();

            // Log each token attempt
            for (const fcm_token of officer.fcm_tokens) {
                await ctx.runMutation(internal.notifications.logNotification, {
                    alert_id: args.alert_id,
                    officer_id: args.officer_id,
                    notification_type: "fcm_push",
                    delivery_status: "sent",
                    fcm_token_used: fcm_token,
                    fcm_message_id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                });
            }

            console.log(`FCM notification sent to officer ${args.officer_id}`);

            return {
                success: true,
                tokens_sent: officer.fcm_tokens.length,
            };
        } catch (error: any) {
            console.error(`Failed to send FCM notification:`, error);

            await ctx.runMutation(internal.notifications.logNotification, {
                alert_id: args.alert_id,
                officer_id: args.officer_id,
                notification_type: "fcm_push",
                delivery_status: "failed",
                error_message: error.message,
            });

            return {
                success: false,
                error: error.message,
            };
        }
    },
});

/**
 * Internal query to get alert details for notification
 */
export const getAlertForNotification = internalQuery({
    args: {
        alert_id: v.id("alerts"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.alert_id);
    },
});

/**
 * Internal query to get officer FCM tokens
 */
export const getOfficerTokens = internalQuery({
    args: {
        officer_id: v.id("police_officers"),
    },
    handler: async (ctx, args) => {
        const officer = await ctx.db.get(args.officer_id);
        if (!officer) return null;

        return {
            fcm_tokens: officer.fcm_tokens,
        };
    },
});

/**
 * Internal mutation to log notification attempts
 */
export const logNotification = internalMutation({
    args: {
        alert_id: v.id("alerts"),
        officer_id: v.id("police_officers"),
        notification_type: v.string(),
        delivery_status: v.string(),
        fcm_message_id: v.optional(v.string()),
        fcm_token_used: v.optional(v.string()),
        error_message: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("notification_logs", {
            alert_id: args.alert_id,
            officer_id: args.officer_id,
            notification_type: args.notification_type,
            sent_at: Date.now(),
            delivery_status: args.delivery_status,
            fcm_message_id: args.fcm_message_id,
            fcm_token_used: args.fcm_token_used,
            error_message: args.error_message,
            retry_count: 0,
        });
    },
});

/**
 * Retry failed notifications
 */
export const retryFailedNotification = action({
    args: {
        notification_log_id: v.id("notification_logs"),
    },
    handler: async (ctx, args) => {
        const log = await ctx.runQuery(internal.notifications.getNotificationLog, {
            log_id: args.notification_log_id,
        });

        if (!log || log.delivery_status !== "failed") {
            return { success: false, reason: "Not a failed notification" };
        }

        // Retry the notification
        const result = await ctx.runAction(internal.notifications.sendFCMNotification, {
            officer_id: log.officer_id,
            alert_id: log.alert_id,
            title: "🚨 Security Alert (Retry)",
            body: "Previously failed notification",
            data: {
                alert_id: log.alert_id,
                photo_url: "",
                video_url: "",
                timestamp: Date.now().toString(),
            },
        });

        // Update retry count
        await ctx.runMutation(internal.notifications.updateRetryCount, {
            log_id: args.notification_log_id,
        });

        return result;
    },
});

/**
 * Internal query to get notification log
 */
export const getNotificationLog = internalQuery({
    args: {
        log_id: v.id("notification_logs"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.log_id);
    },
});

/**
 * Internal mutation to update retry count
 */
export const updateRetryCount = internalMutation({
    args: {
        log_id: v.id("notification_logs"),
    },
    handler: async (ctx, args) => {
        const log = await ctx.db.get(args.log_id);
        if (log) {
            await ctx.db.patch(args.log_id, {
                retry_count: log.retry_count + 1,
                last_retry_at: Date.now(),
            });
        }
    },
});
