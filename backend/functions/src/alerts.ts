import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * HTTP endpoint to receive alerts from RD (Raspberry Pi Device)
 * Called when motion detected and object has left
 */
export const receiveAlert = functions.https.onRequest(async (req, res) => {
    // CORS headers
    res.set('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    try {
        const {
            timestamp_recorded,
            timestamp_sent,
            photo_url,
            video_url,
            rpi_device_id,
            location,
        } = req.body;

        // Validation
        if (!timestamp_recorded || !timestamp_sent || !photo_url || !video_url || !rpi_device_id) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields',
            });
            return;
        }

        const timestamp_received = Date.now();
        const delay_ms = timestamp_received - timestamp_sent;

        // Store alert in Firestore
        const alertRef = await db.collection('alerts').add({
            timestamp_recorded,
            timestamp_sent,
            timestamp_received,
            delay_ms,
            photo_url,
            video_url,
            rpi_device_id,
            location: location || null,
            status: 'active',
            created_at: admin.firestore.FieldValue.serverTimestamp(),
        });

        functions.logger.info('Alert received', {
            alert_id: alertRef.id,
            device: rpi_device_id,
            delay_ms,
        });

        res.status(200).json({
            success: true,
            alert_id: alertRef.id,
            delay_ms,
            message: 'Alert received and will be sent to police officers',
        });
    } catch (error: any) {
        functions.logger.error('Error receiving alert', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

/**
 * Callable function to get alerts for dashboard
 */
export const getAlerts = functions.https.onCall(async (data, context) => {
    // Authentication check
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    // Role check
    const role = context.auth.token.role;
    if (!['officer', 'admin', 'supervisor'].includes(role)) {
        throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
    }

    const { status, limit = 50, rpi_device_id } = data;

    try {
        let query = db.collection('alerts') as any;

        if (status) {
            query = query.where('status', '==', status);
        }

        if (rpi_device_id) {
            query = query.where('rpi_device_id', '==', rpi_device_id);
        }

        query = query.orderBy('timestamp_received', 'desc').limit(limit);

        const snapshot = await query.get();
        const alerts = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return { success: true, alerts };
    } catch (error: any) {
        functions.logger.error('Error getting alerts', error);
        throw new functions.https.HttpsError('internal', 'Failed to fetch alerts');
    }
});

/**
 * Callable function to update alert status
 */
export const updateAlertStatus = functions.https.onCall(async (data, context) => {
    // Authentication check
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const role = context.auth.token.role;
    if (!['officer', 'admin', 'supervisor'].includes(role)) {
        throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
    }

    const { alert_id, status, notes } = data;

    if (!alert_id || !status) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing alert_id or status');
    }

    try {
        const alertRef = db.collection('alerts').doc(alert_id);
        const updateData: any = {
            status,
            notes: notes || null,
        };

        if (status === 'acknowledged') {
            updateData.acknowledged_by = context.auth.uid;
            updateData.acknowledged_at = admin.firestore.FieldValue.serverTimestamp();
        } else if (status === 'resolved' || status === 'false_alarm') {
            updateData.resolved_by = context.auth.uid;
            updateData.resolved_at = admin.firestore.FieldValue.serverTimestamp();
        }

        await alertRef.update(updateData);

        return {
            success: true,
            message: `Alert ${status}`,
        };
    } catch (error: any) {
        functions.logger.error('Error updating alert', error);
        throw new functions.https.HttpsError('internal', 'Failed to update alert');
    }
});

/**
 * Get alert statistics
 */
export const getAlertStats = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const { timeframe_hours = 24 } = data;
    const cutoff = Date.now() - timeframe_hours * 60 * 60 * 1000;

    try {
        const snapshot = await db
            .collection('alerts')
            .where('timestamp_received', '>=', cutoff)
            .get();

        const alerts = snapshot.docs.map(doc => doc.data());

        const stats = {
            total: alerts.length,
            active: alerts.filter(a => a.status === 'active').length,
            acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
            resolved: alerts.filter(a => a.status === 'resolved').length,
            false_alarms: alerts.filter(a => a.status === 'false_alarm').length,
            average_delay_ms: alerts.length > 0
                ? alerts.reduce((sum, a) => sum + a.delay_ms, 0) / alerts.length
                : 0,
            timeframe_hours,
        };

        return { success: true, stats };
    } catch (error: any) {
        functions.logger.error('Error getting stats', error);
        throw new functions.https.HttpsError('internal', 'Failed to fetch statistics');
    }
});
