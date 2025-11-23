import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.database();

/**
 * Register a new police officer
 * Creates Firebase Auth user AND Firestore profile
 */
export const registerOfficer = functions.https.onCall(async (data, context) => {
    // Only admins can register new officers
    if (!context.auth || context.auth.token.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can register officers');
    }

    const { officer_id, name, email, password, phone_number, role = 'officer' } = data;

    if (!officer_id || !name || !email || !password || !phone_number) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }

    try {
        // Create Firebase Auth user
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: name,
            disabled: false,
        });

        // Set custom claims for role
        await admin.auth().setCustomUserClaims(userRecord.uid, {
            role,
        });

        // Create Realtime Database profile
        await db.ref(`officers/${userRecord.uid}`).set({
            officer_id,
            name,
            email,
            phone_number,
            role,
            is_active: true,
            fcm_tokens: {},
            created_at: admin.database.ServerValue.TIMESTAMP,
        });

        functions.logger.info('Officer registered', {
            uid: userRecord.uid,
            officer_id,
            email,
        });

        return {
            success: true,
            uid: userRecord.uid,
            message: 'Officer registered successfully',
        };
    } catch (error: any) {
        functions.logger.error('Error registering officer', error);

        if (error.code === 'auth/email-already-exists') {
            throw new functions.https.HttpsError('already-exists', 'Email already in use');
        }

        throw new functions.https.HttpsError('internal', 'Failed to register officer');
    }
});

/**
 * Set or update officer role (admin only)
 */
export const setOfficerRole = functions.https.onCall(async (data, context) => {
    if (!context.auth || context.auth.token.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can set roles');
    }

    const { uid, role } = data;

    if (!uid || !role) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing uid or role');
    }

    if (!['officer', 'admin', 'supervisor'].includes(role)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid role');
    }

    try {
        // Update custom claims
        await admin.auth().setCustomUserClaims(uid, { role });

        // Update Realtime Database
        await db.ref(`officers/${uid}`).update({
            role,
        });

        return {
            success: true,
            message: `Role updated to ${role}`,
        };
    } catch (error: any) {
        functions.logger.error('Error setting role', error);
        throw new functions.https.HttpsError('internal', 'Failed to set role');
    }
});

/**
 * Get officer profile
 */
export const getOfficerProfile = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const { uid } = data;
    const requestedUid = uid || context.auth.uid;

    // Can only view own profile unless admin
    if (requestedUid !== context.auth.uid && context.auth.token.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Cannot view other profiles');
    }

    try {
        const officerSnapshot = await db.ref(`officers/${requestedUid}`).once('value');

        if (!officerSnapshot.exists()) {
            throw new functions.https.HttpsError('not-found', 'Officer not found');
        }

        const officer = officerSnapshot.val();

        // Don't return sensitive data to non-admins
        if (context.auth.token.role !== 'admin') {
            delete officer.fcm_tokens;
        }

        return {
            success: true,
            officer: {
                uid: requestedUid,
                ...officer,
            },
        };
    } catch (error: any) {
        functions.logger.error('Error getting profile', error);
        throw new functions.https.HttpsError('internal', 'Failed to fetch profile');
    }
});

/**
 * Update last login timestamp
 */
export const updateLastLogin = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    try {
        await db.ref(`officers/${context.auth.uid}`).update({
            last_login: admin.database.ServerValue.TIMESTAMP,
        });

        return { success: true };
    } catch (error: any) {
        functions.logger.error('Error updating last login', error);
        throw new functions.https.HttpsError('internal', 'Failed to update');
    }
});

/**
 * Deactivate officer (admin only)
 */
export const deactivateOfficer = functions.https.onCall(async (data, context) => {
    if (!context.auth || context.auth.token.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can deactivate');
    }

    const { uid } = data;

    if (!uid) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing uid');
    }

    try {
        // Disable Firebase Auth
        await admin.auth().updateUser(uid, { disabled: true });

        // Update Realtime Database
        await db.ref(`officers/${uid}`).update({
            is_active: false,
        });

        return {
            success: true,
            message: 'Officer deactivated',
        };
    } catch (error: any) {
        functions.logger.error('Error deactivating officer', error);
        throw new functions.https.HttpsError('internal', 'Failed to deactivate');
    }
});
