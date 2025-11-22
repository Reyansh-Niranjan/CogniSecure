import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Alert/Incident data from RD (Raspberry Pi Device)
    alerts: defineTable({
        // Timestamps
        timestamp_recorded: v.number(), // When incident was recorded on RPI
        timestamp_sent: v.number(), // When RD sent the alert
        timestamp_received: v.number(), // When backend received the alert
        delay_ms: v.number(), // Calculated delay between sending and receiving

        // Media files (stored in Firebase)
        photo_url: v.string(), // Firebase Storage URL for photo
        video_url: v.string(), // Firebase Storage URL for 5-second video clip

        // Device info
        rpi_device_id: v.string(), // Identifier for the RPI device
        location: v.optional(v.string()), // Optional location of the device

        // Status tracking
        status: v.string(), // "active", "acknowledged", "resolved", "false_alarm"
        acknowledged_by: v.optional(v.id("police_officers")),
        acknowledged_at: v.optional(v.number()),
        resolved_by: v.optional(v.id("police_officers")),
        resolved_at: v.optional(v.number()),
        notes: v.optional(v.string()),
    })
        .index("by_status", ["status"])
        .index("by_timestamp_received", ["timestamp_received"])
        .index("by_device", ["rpi_device_id"]),

    // Police Officers Authentication & Contact
    police_officers: defineTable({
        officer_id: v.string(), // Unique officer ID (badge number, etc.)
        name: v.string(),
        email: v.string(),
        phone_number: v.string(), // For SMS/Push notifications

        // Authentication data
        passkey_credential_id: v.optional(v.string()), // WebAuthn credential ID
        passkey_public_key: v.optional(v.string()), // Public key for passkey
        face_scan_hash: v.optional(v.string()), // Hash/reference for face scan verification

        // FCM tokens for push notifications
        fcm_tokens: v.array(v.string()), // Multiple devices can be registered

        // Role and permissions
        role: v.string(), // "officer", "admin", "supervisor"
        is_active: v.boolean(),

        // Tracking
        created_at: v.number(),
        last_login: v.optional(v.number()),
    })
        .index("by_officer_id", ["officer_id"])
        .index("by_email", ["email"])
        .index("by_role", ["role"])
        .index("by_active", ["is_active"]),

    // Session management for officers
    sessions: defineTable({
        officer_id: v.id("police_officers"),
        token: v.string(), // Session token
        created_at: v.number(),
        expires_at: v.number(),
        ip_address: v.optional(v.string()),
        user_agent: v.optional(v.string()),
        is_valid: v.boolean(),
    })
        .index("by_token", ["token"])
        .index("by_officer", ["officer_id"])
        .index("by_valid", ["is_valid"]),

    // Citizen Updates (public announcements)
    citizen_updates: defineTable({
        title: v.string(),
        content: v.string(), // Can be HTML or markdown
        category: v.string(), // "safety_tip", "crime_alert", "announcement", "statistics"
        priority: v.string(), // "low", "medium", "high", "critical"

        // Media
        image_url: v.optional(v.string()),

        // Metadata
        created_by: v.id("police_officers"),
        created_at: v.number(),
        updated_at: v.optional(v.number()),
        is_published: v.boolean(),

        // Analytics
        view_count: v.number(),
    })
        .index("by_category", ["category"])
        .index("by_priority", ["priority"])
        .index("by_published", ["is_published"])
        .index("by_created_at", ["created_at"]),

    // AI Agent Query Logs (Audit Trail)
    ai_agent_logs: defineTable({
        officer_id: v.id("police_officers"),

        // Query details
        query: v.string(), // Officer's question/query
        response: v.string(), // AI's response
        context_used: v.array(v.string()), // IDs of alerts/data provided to AI

        // Security & tracking
        timestamp: v.number(),
        ip_address: v.optional(v.string()),
        session_id: v.id("sessions"),

        // Metadata
        model_used: v.string(), // e.g., "gpt-4", "claude-3"
        tokens_used: v.number(),
        response_time_ms: v.number(),

        // Flags
        was_blocked: v.boolean(), // If query was blocked by security rules
        block_reason: v.optional(v.string()),
    })
        .index("by_officer", ["officer_id"])
        .index("by_timestamp", ["timestamp"])
        .index("by_session", ["session_id"])
        .index("by_blocked", ["was_blocked"]),

    // Notification Logs
    notification_logs: defineTable({
        alert_id: v.id("alerts"),
        officer_id: v.id("police_officers"),

        // Notification details
        notification_type: v.string(), // "fcm_push", "sms", "email"
        sent_at: v.number(),
        delivery_status: v.string(), // "sent", "delivered", "failed", "read"

        // Firebase specific
        fcm_message_id: v.optional(v.string()),
        fcm_token_used: v.optional(v.string()),

        // Error tracking
        error_message: v.optional(v.string()),
        retry_count: v.number(),
        last_retry_at: v.optional(v.number()),
    })
        .index("by_alert", ["alert_id"])
        .index("by_officer", ["officer_id"])
        .index("by_status", ["delivery_status"])
        .index("by_sent_at", ["sent_at"]),

    // Rate Limiting for AI Agent
    rate_limits: defineTable({
        officer_id: v.id("police_officers"),
        hour_timestamp: v.number(), // Unix timestamp rounded to the hour
        query_count: v.number(),
    })
        .index("by_officer_hour", ["officer_id", "hour_timestamp"]),
});
