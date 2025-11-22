import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Receive an alert from RD (Raspberry Pi Device)
 * This is called when:
 * 1. Motion is detected
 * 2. Object has left the scene
 * 3. RPI has captured 5-second video and photo
 */
export const receiveAlert = mutation({
    args: {
        timestamp_recorded: v.number(), // When incident happened on RPI
        timestamp_sent: v.number(), // When RD sent this alert
        photo_url: v.string(), // Firebase Storage URL for photo
        video_url: v.string(), // Firebase Storage URL for video
        rpi_device_id: v.string(), // Device identifier
        location: v.optional(v.string()), // Optional location
    },
    handler: async (ctx, args) => {
        const timestamp_received = Date.now();
        const delay_ms = timestamp_received - args.timestamp_sent;

        // Store the alert
        const alertId = await ctx.db.insert("alerts", {
            timestamp_recorded: args.timestamp_recorded,
            timestamp_sent: args.timestamp_sent,
            timestamp_received,
            delay_ms,
            photo_url: args.photo_url,
            video_url: args.video_url,
            rpi_device_id: args.rpi_device_id,
            location: args.location,
            status: "active",
        });

        console.log(`Alert received: ${alertId}, delay: ${delay_ms}ms`);

        // Return the alert ID so RD can track it
        return {
            success: true,
            alert_id: alertId,
            delay_ms,
            message: "Alert received and will be sent to police officers",
        };
    },
});

/**
 * Get all active (unresolved) alerts
 */
export const getActiveAlerts = query({
    args: {},
    handler: async (ctx) => {
        const alerts = await ctx.db
            .query("alerts")
            .withIndex("by_status", (q) => q.eq("status", "active"))
            .order("desc")
            .collect();

        return alerts;
    },
});

/**
 * Get alert by ID
 */
export const getAlertById = query({
    args: {
        alert_id: v.id("alerts"),
    },
    handler: async (ctx, args) => {
        const alert = await ctx.db.get(args.alert_id);
        return alert;
    },
});

/**
 * Update alert status (acknowledge or resolve)
 */
export const updateAlertStatus = mutation({
    args: {
        alert_id: v.id("alerts"),
        status: v.string(), // "acknowledged", "resolved", "false_alarm"
        officer_id: v.id("police_officers"),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const alert = await ctx.db.get(args.alert_id);
        if (!alert) {
            throw new Error("Alert not found");
        }

        const updates: any = {
            status: args.status,
            notes: args.notes,
        };

        if (args.status === "acknowledged") {
            updates.acknowledged_by = args.officer_id;
            updates.acknowledged_at = Date.now();
        } else if (args.status === "resolved" || args.status === "false_alarm") {
            updates.resolved_by = args.officer_id;
            updates.resolved_at = Date.now();
        }

        await ctx.db.patch(args.alert_id, updates);

        return { success: true, message: `Alert ${args.status}` };
    },
});

/**
 * Get alert history with filtering
 */
export const getAlertHistory = query({
    args: {
        status: v.optional(v.string()),
        rpi_device_id: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        let query = ctx.db.query("alerts");

        if (args.status) {
            query = query.withIndex("by_status", (q) => q.eq("status", args.status));
        } else if (args.rpi_device_id) {
            query = query.withIndex("by_device", (q) =>
                q.eq("rpi_device_id", args.rpi_device_id)
            );
        } else {
            query = query.withIndex("by_timestamp_received");
        }

        const alerts = await query.order("desc").take(args.limit || 100);

        return alerts;
    },
});

/**
 * Get alert statistics
 */
export const getAlertStats = query({
    args: {
        timeframe_hours: v.optional(v.number()), // Default 24 hours
    },
    handler: async (ctx, args) => {
        const hours = args.timeframe_hours || 24;
        const cutoff = Date.now() - hours * 60 * 60 * 1000;

        const allAlerts = await ctx.db
            .query("alerts")
            .withIndex("by_timestamp_received")
            .filter((q) => q.gte(q.field("timestamp_received"), cutoff))
            .collect();

        const stats = {
            total: allAlerts.length,
            active: allAlerts.filter((a) => a.status === "active").length,
            acknowledged: allAlerts.filter((a) => a.status === "acknowledged").length,
            resolved: allAlerts.filter((a) => a.status === "resolved").length,
            false_alarms: allAlerts.filter((a) => a.status === "false_alarm").length,
            average_delay_ms:
                allAlerts.reduce((sum, a) => sum + a.delay_ms, 0) / allAlerts.length ||
                0,
            timeframe_hours: hours,
        };

        return stats;
    },
});
