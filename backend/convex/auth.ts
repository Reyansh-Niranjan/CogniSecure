import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api, internal } from "./_generated/api";

/**
 * Register a new police officer
 */
export const registerOfficer = mutation({
    args: {
        officer_id: v.string(), // Badge number or unique ID
        name: v.string(),
        email: v.string(),
        phone_number: v.string(),
        role: v.string(), // "officer", "admin", "supervisor"
    },
    handler: async (ctx, args) => {
        // Check if officer already exists
        const existing = await ctx.db
            .query("police_officers")
            .withIndex("by_officer_id", (q) => q.eq("officer_id", args.officer_id))
            .unique();

        if (existing) {
            throw new Error("Officer with this ID already exists");
        }

        // Check email uniqueness
        const existingEmail = await ctx.db
            .query("police_officers")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .unique();

        if (existingEmail) {
            throw new Error("Officer with this email already exists");
        }

        const officerId = await ctx.db.insert("police_officers", {
            officer_id: args.officer_id,
            name: args.name,
            email: args.email,
            phone_number: args.phone_number,
            role: args.role,
            is_active: true,
            fcm_tokens: [],
            created_at: Date.now(),
        });

        return {
            success: true,
            officer_db_id: officerId,
            message: "Officer registered successfully",
        };
    },
});

/**
 * Create a session for an officer (used after passkey/face scan auth)
 */
export const createSession = mutation({
    args: {
        officer_id: v.id("police_officers"),
        ip_address: v.optional(v.string()),
        user_agent: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Generate a random session token
        const token = crypto.randomUUID();
        const created_at = Date.now();
        const expires_at = created_at + 24 * 60 * 60 * 1000; // 24 hours

        const sessionId = await ctx.db.insert("sessions", {
            officer_id: args.officer_id,
            token,
            created_at,
            expires_at,
            ip_address: args.ip_address,
            user_agent: args.user_agent,
            is_valid: true,
        });

        // Update last login
        await ctx.db.patch(args.officer_id, {
            last_login: created_at,
        });

        return {
            success: true,
            session_id: sessionId,
            token,
            expires_at,
        };
    },
});

/**
 * Validate a session token
 */
export const validateSession = query({
    args: {
        token: v.string(),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db
            .query("sessions")
            .withIndex("by_token", (q) => q.eq("token", args.token))
            .unique();

        if (!session) {
            return { valid: false, reason: "Session not found" };
        }

        if (!session.is_valid) {
            return { valid: false, reason: "Session invalidated" };
        }

        if (Date.now() > session.expires_at) {
            return { valid: false, reason: "Session expired" };
        }

        // Get officer details
        const officer = await ctx.db.get(session.officer_id);
        if (!officer || !officer.is_active) {
            return { valid: false, reason: "Officer not active" };
        }

        return {
            valid: true,
            session_id: session._id,
            officer_id: session.officer_id,
            officer,
        };
    },
});

/**
 * Invalidate a session (logout)
 */
export const invalidateSession = mutation({
    args: {
        token: v.string(),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db
            .query("sessions")
            .withIndex("by_token", (q) => q.eq("token", args.token))
            .unique();

        if (session) {
            await ctx.db.patch(session._id, { is_valid: false });
        }

        return { success: true, message: "Session invalidated" };
    },
});

/**
 * Store passkey credential for an officer
 */
export const storePasskey = mutation({
    args: {
        officer_id: v.id("police_officers"),
        credential_id: v.string(),
        public_key: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.officer_id, {
            passkey_credential_id: args.credential_id,
            passkey_public_key: args.public_key,
        });

        return { success: true, message: "Passkey stored" };
    },
});

/**
 * Store face scan reference for an officer
 */
export const storeFaceScan = mutation({
    args: {
        officer_id: v.id("police_officers"),
        face_scan_hash: v.string(), // Hash or reference to face biometric data
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.officer_id, {
            face_scan_hash: args.face_scan_hash,
        });

        return { success: true, message: "Face scan data stored" };
    },
});

/**
 * Register FCM token for push notifications
 */
export const registerFCMToken = mutation({
    args: {
        officer_id: v.id("police_officers"),
        fcm_token: v.string(),
    },
    handler: async (ctx, args) => {
        const officer = await ctx.db.get(args.officer_id);
        if (!officer) {
            throw new Error("Officer not found");
        }

        // Add token if not already present
        if (!officer.fcm_tokens.includes(args.fcm_token)) {
            const updatedTokens = [...officer.fcm_tokens, args.fcm_token];
            await ctx.db.patch(args.officer_id, {
                fcm_tokens: updatedTokens,
            });
        }

        return { success: true, message: "FCM token registered" };
    },
});

/**
 * Get officer profile
 */
export const getOfficerProfile = query({
    args: {
        officer_id: v.id("police_officers"),
    },
    handler: async (ctx, args) => {
        const officer = await ctx.db.get(args.officer_id);
        if (!officer) {
            return null;
        }

        // Don't return sensitive data
        return {
            _id: officer._id,
            officer_id: officer.officer_id,
            name: officer.name,
            email: officer.email,
            phone_number: officer.phone_number,
            role: officer.role,
            is_active: officer.is_active,
            created_at: officer.created_at,
            last_login: officer.last_login,
        };
    },
});

/**
 * Get all active officers (for notifications)
 */
export const getAllActiveOfficers = query({
    args: {},
    handler: async (ctx) => {
        const officers = await ctx.db
            .query("police_officers")
            .withIndex("by_active", (q) => q.eq("is_active", true))
            .collect();

        return officers;
    },
});
