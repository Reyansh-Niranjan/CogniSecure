import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Initialize Firebase Admin
admin.initializeApp();

// Export all functions
export * from './alerts';
export * from './notifications';
export * from './aiAgent';
export * from './citizenUpdates';
export * from './auth';
