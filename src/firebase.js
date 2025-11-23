// ============================================
// FIREBASE INITIALIZATION & CONFIGURATION
// ============================================
// This file initializes Firebase and exports all necessary services
// for use throughout the application (both Police and Citizen dashboards)
// ============================================

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';

// ============================================
// FIREBASE CONFIGURATION
// ============================================
// Configuration values are loaded from environment variables (.env file)
// All values should be prefixed with VITE_ to be accessible in the browser
// ============================================

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
};

// ============================================
// INITIALIZE FIREBASE APP
// ============================================
// This is the main Firebase app instance that all services use
// ============================================

const app = initializeApp(firebaseConfig);

// ============================================
// INITIALIZE FIREBASE SERVICES
// ============================================

// AUTHENTICATION SERVICE
// Used by Police Dashboard for officer login/logout
// Handles user sessions, tokens, and custom claims (roles)
export const auth = getAuth(app);

// REALTIME DATABASE
// Real-time JSON database for alerts, officers, citizen updates
// Used by both dashboards to read/write data
export const db = getDatabase(app);

// CLOUD FUNCTIONS
// Serverless backend functions for alert processing, AI agent, etc.
// Called via httpsCallable() from the dashboards
export const functions = getFunctions(app);

// STORAGE SERVICE
// File storage for alert photos and videos
// Used by Police Dashboard to display media from alerts
export const storage = getStorage(app);

// CLOUD MESSAGING (Push Notifications)
// Used by Police Dashboard to receive urgent alert notifications
// Initialized only if browser supports it
let messaging = null;
isSupported().then((supported) => {
    if (supported) {
        messaging = getMessaging(app);
    }
});
export { messaging };

// ============================================
// FIREBASE EMULATORS (Development Mode)
// ============================================
// If using emulators for local development, connect to them
// Set VITE_USE_FIREBASE_EMULATORS=true in .env to enable
// Run 'firebase emulators:start' before starting the dev server
// ============================================

const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';

if (useEmulators) {
    console.log('🔧 Connecting to Firebase Emulators...');

    // Connect to Auth Emulator (port 9099)
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });

    // Connect to Realtime Database Emulator (port 9000)
    connectDatabaseEmulator(db, 'localhost', 9000);

    // Connect to Functions Emulator (port 5001)
    connectFunctionsEmulator(functions, 'localhost', 5001);

    // Connect to Storage Emulator (port 9199)
    connectStorageEmulator(storage, 'localhost', 9199);

    console.log('✅ Connected to Firebase Emulators');
}

// ============================================
// EXPORT DEFAULT APP
// ============================================
// Export the initialized app for any additional Firebase services
// ============================================

export default app;
