import { action } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * This is an HTTP action that triggers alert notification
 * Can be called via webhook when alert is received
 */
export const triggerAlertNotification = action({
    handler: async (ctx, request: Request) => {
        // This would be called by your alert reception system
        // to trigger notifications to all officers

        const { alert_id } = await request.json();

        if (!alert_id) {
            return new Response(JSON.stringify({ error: "Missing alert_id" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Trigger notifications
        const result = await ctx.runAction(internal.notifications.notifyAllOfficers, {
            alert_id,
        });

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    },
});
