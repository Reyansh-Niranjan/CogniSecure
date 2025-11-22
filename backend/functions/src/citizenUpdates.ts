import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Create a new citizen update (admin only)
 */
export const createUpdate = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    if (context.auth.token.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can create updates');
    }

    const { title, content, category, priority, image_url } = data;

    if (!title || !content || !category || !priority) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }

    try {
        const updateRef = await db.collection('citizenUpdates').add({
            title,
            content,
            category, // "safety_tip", "crime_alert", "announcement", "statistics"
            priority, // "low", "medium", "high", "critical"
            image_url: image_url || null,
            created_by: context.auth.uid,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            is_published: true,
            view_count: 0,
        });

        return {
            success: true,
            update_id: updateRef.id,
        };
    } catch (error: any) {
        functions.logger.error('Error creating update', error);
        throw new functions.https.HttpsError('internal', 'Failed to create update');
    }
});

/**
 * Get recent updates for citizen dashboard (no auth required)
 */
export const getUpdates = functions.https.onCall(async (data, context) => {
    const { category, priority, limit = 20 } = data;

    try {
        let query = db.collection('citizenUpdates').where('is_published', '==', true) as any;

        if (category) {
            query = query.where('category', '==', category);
        }

        if (priority) {
            query = query.where('priority', '==', priority);
        }

        query = query.orderBy('created_at', 'desc').limit(limit);

        const snapshot = await query.get();
        const updates = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return { success: true, updates };
    } catch (error: any) {
        functions.logger.error('Error getting updates', error);
        throw new functions.https.HttpsError('internal', 'Failed to fetch updates');
    }
});

/**
 * Update existing citizen update
 */
export const updateUpdate = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    if (context.auth.token.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can update');
    }

    const { update_id, ...updateFields } = data;

    if (!update_id) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing update_id');
    }

    try {
        const updateRef = db.collection('citizenUpdates').doc(update_id);
        const updateDoc = await updateRef.get();

        if (!updateDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Update not found');
        }

        await updateRef.update({
            ...updateFields,
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
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
export const deleteUpdate = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    if (context.auth.token.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can delete');
    }

    const { update_id } = data;

    if (!update_id) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing update_id');
    }

    try {
        await db.collection('citizenUpdates').doc(update_id).delete();
        return { success: true };
    } catch (error: any) {
        functions.logger.error('Error deleting update', error);
        throw new functions.https.HttpsError('internal', 'Failed to delete');
    }
});

/**
 * Increment view count
 */
export const incrementViewCount = functions.https.onCall(async (data, context) => {
    const { update_id } = data;

    if (!update_id) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing update_id');
    }

    try {
        const updateRef = db.collection('citizenUpdates').doc(update_id);
        await updateRef.update({
            view_count: admin.firestore.FieldValue.increment(1),
        });

        return { success: true };
    } catch (error: any) {
        functions.logger.error('Error incrementing view count', error);
        throw new functions.https.HttpsError('internal', 'Failed to increment');
    }
});
