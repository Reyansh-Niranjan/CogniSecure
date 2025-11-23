import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.database();

/**
 * Create a new citizen update (admin only)
 */
export const createUpdate = functions.https.onCall(async (data, _context) => {
    if (!_context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    if (_context.auth.token.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can create updates');
    }

    const { title, content, category, priority, image_url } = data;

    if (!title || !content || !category || !priority) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }

    try {
        const updateRef = db.ref('citizenUpdates').push();
        await updateRef.set({
            title,
            content,
            category, // "safety_tip", "crime_alert", "announcement", "statistics"
            priority, // "low", "medium", "high", "critical"
            image_url: image_url || null,
            created_by: _context.auth.uid,
            created_at: admin.database.ServerValue.TIMESTAMP,
            is_published: true,
            view_count: 0,
        });

        return {
            success: true,
            update_id: updateRef.key,
        };
    } catch (error: any) {
        functions.logger.error('Error creating update', error);
        throw new functions.https.HttpsError('internal', 'Failed to create update');
    }
});

/**
 * Get recent updates for citizen dashboard (no auth required)
 */
export const getUpdates = functions.https.onCall(async (data, _context) => {
    const { category, priority, limit = 20 } = data;

    try {
        const snapshot = await db.ref('citizenUpdates')
            .orderByChild('created_at')
            .once('value');

        if (!snapshot.exists()) {
            return { success: true, updates: [] };
        }

        const data = snapshot.val();
        let updates = Object.keys(data)
            .map(key => ({ id: key, ...data[key] }))
            .filter(update => update.is_published === true);

        // Client-side filtering
        if (category) {
            updates = updates.filter(update => update.category === category);
        }

        if (priority) {
            updates = updates.filter(update => update.priority === priority);
        }

        // Sort descending and limit
        updates = updates
            .sort((a, b) => b.created_at - a.created_at)
            .slice(0, limit);

        return { success: true, updates };
    } catch (error: any) {
        functions.logger.error('Error getting updates', error);
        throw new functions.https.HttpsError('internal', 'Failed to fetch updates');
    }
});

/**
 * Update existing citizen update
 */
export const updateUpdate = functions.https.onCall(async (data, _context) => {
    if (!_context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    if (_context.auth.token.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can update');
    }

    const { update_id, ...updateFields } = data;

    if (!update_id) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing update_id');
    }

    try {
        const updateRef = db.ref(`citizenUpdates/${update_id}`);
        const snapshot = await updateRef.once('value');

        if (!snapshot.exists()) {
            throw new functions.https.HttpsError('not-found', 'Update not found');
        }

        await updateRef.update({
            ...updateFields,
            updated_at: admin.database.ServerValue.TIMESTAMP,
        });

        return { success: true };
    } catch (error: any) {
        functions.logger.error('Error updating update', error);
        throw new functions.https.HttpsError('internal', 'Failed to update');
    }
});

/**
 * Delete citizen update
 */
export const deleteUpdate = functions.https.onCall(async (data, _context) => {
    if (!_context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    if (_context.auth.token.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can delete');
    }

    const { update_id } = data;

    if (!update_id) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing update_id');
    }

    try {
        await db.ref(`citizenUpdates/${update_id}`).remove();
        return { success: true };
    } catch (error: any) {
        functions.logger.error('Error deleting update', error);
        throw new functions.https.HttpsError('internal', 'Failed to delete');
    }
});

/**
 * Increment view count
 */
export const incrementViewCount = functions.https.onCall(async (data, _context) => {
    const { update_id } = data;

    if (!update_id) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing update_id');
    }

    try {
        const updateRef = db.ref(`citizenUpdates/${update_id}`);
        const snapshot = await updateRef.child('view_count').once('value');
        const currentCount = snapshot.val() || 0;
        await updateRef.update({
            view_count: currentCount + 1,
        });

        return { success: true };
    } catch (error: any) {
        functions.logger.error('Error incrementing view count', error);
        throw new functions.https.HttpsError('internal', 'Failed to increment');
    }
});
