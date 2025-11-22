import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Create a new citizen update (admin only)
 */
export const createUpdate = mutation({
    args: {
        title: v.string(),
        content: v.string(),
        category: v.string(), // "safety_tip", "crime_alert", "announcement", "statistics"
        priority: v.string(), // "low", "medium", "high", "critical"
        created_by: v.id("police_officers"),
        image_url: v.optional(v.string()),
        is_published: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const updateId = await ctx.db.insert("citizen_updates", {
            title: args.title,
            content: args.content,
            category: args.category,
            priority: args.priority,
            created_by: args.created_by,
            image_url: args.image_url,
            created_at: Date.now(),
            is_published: args.is_published ?? true,
            view_count: 0,
        });

        return {
            success: true,
            update_id: updateId,
        };
    },
});

/**
 * Get recent updates for citizen dashboard
 * No authentication required
 */
export const getRecentUpdates = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const updates = await ctx.db
            .query("citizen_updates")
            .withIndex("by_published", (q) => q.eq("is_published", true))
            .order("desc")
            .take(args.limit || 20);

        return updates;
    },
});

/**
 * Get updates by category
 */
export const getUpdatesByCategory = query({
    args: {
        category: v.string(),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const updates = await ctx.db
            .query("citizen_updates")
            .withIndex("by_category", (q) => q.eq("category", args.category))
            .filter((q) => q.eq(q.field("is_published"), true))
            .order("desc")
            .take(args.limit || 20);

        return updates;
    },
});

/**
 * Get high priority updates
 */
export const getHighPriorityUpdates = query({
    args: {},
    handler: async (ctx) => {
        const updates = await ctx.db
            .query("citizen_updates")
            .withIndex("by_priority", (q) => q.eq("priority", "high"))
            .filter((q) => q.eq(q.field("is_published"), true))
            .order("desc")
            .take(10);

        const critical = await ctx.db
            .query("citizen_updates")
            .withIndex("by_priority", (q) => q.eq("priority", "critical"))
            .filter((q) => q.eq(q.field("is_published"), true))
            .order("desc")
            .take(5);

        return {
            high: updates,
            critical,
        };
    },
});

/**
 * Update an existing citizen update
 */
export const updateUpdate = mutation({
    args: {
        update_id: v.id("citizen_updates"),
        title: v.optional(v.string()),
        content: v.optional(v.string()),
        category: v.optional(v.string()),
        priority: v.optional(v.string()),
        image_url: v.optional(v.string()),
        is_published: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.update_id);
        if (!existing) {
            throw new Error("Update not found");
        }

        const updates: any = {
            updated_at: Date.now(),
        };

        if (args.title !== undefined) updates.title = args.title;
        if (args.content !== undefined) updates.content = args.content;
        if (args.category !== undefined) updates.category = args.category;
        if (args.priority !== undefined) updates.priority = args.priority;
        if (args.image_url !== undefined) updates.image_url = args.image_url;
        if (args.is_published !== undefined) updates.is_published = args.is_published;

        await ctx.db.patch(args.update_id, updates);

        return { success: true };
    },
});

/**
 * Delete a citizen update
 */
export const deleteUpdate = mutation({
    args: {
        update_id: v.id("citizen_updates"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.update_id);
        return { success: true };
    },
});

/**
 * Increment view count
 */
export const incrementViewCount = mutation({
    args: {
        update_id: v.id("citizen_updates"),
    },
    handler: async (ctx, args) => {
        const update = await ctx.db.get(args.update_id);
        if (update) {
            await ctx.db.patch(args.update_id, {
                view_count: update.view_count + 1,
            });
        }
    },
});
