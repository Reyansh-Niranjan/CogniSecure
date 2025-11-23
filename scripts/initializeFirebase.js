// ============================================
// FIREBASE DATABASE INITIALIZATION SCRIPT
// ============================================
// Run this script to populate Firebase with sample data
// Usage: node scripts/initializeFirebase.js
// ============================================

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from parent directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

console.log('🔥 Firebase initialized successfully!');
console.log(`📦 Project ID: ${firebaseConfig.projectId}`);
console.log(`🔗 Database URL: ${firebaseConfig.databaseURL}`);

// ============================================
// SAMPLE DATA
// ============================================

const sampleIncidents = {
    'inc-001': {
        type: 'Suspicious Activity',
        status: 'active',
        location: 'Downtown Plaza, Sector 7',
        timestamp: Date.now() - 1000 * 60 * 15,
        delay: '2 min',
        priority: 'high',
        description: 'Multiple individuals loitering near ATM machines',
        mediaUrl: null,
        assignedOfficer: 'Officer Martinez'
    },
    'inc-002': {
        type: 'Traffic Violation',
        status: 'reviewing',
        location: 'Highway 101, Exit 42',
        timestamp: Date.now() - 1000 * 60 * 45,
        delay: '5 min',
        priority: 'medium',
        description: 'Vehicle running red light at intersection',
        mediaUrl: null,
        assignedOfficer: 'Officer Chen'
    },
    'inc-003': {
        type: 'Theft Report',
        status: 'resolved',
        location: 'Riverside Mall, Parking Lot B',
        timestamp: Date.now() - 1000 * 60 * 120,
        delay: '1 min',
        priority: 'high',
        description: 'Vehicle break-in reported by security',
        mediaUrl: null,
        assignedOfficer: 'Officer Johnson'
    },
    'inc-004': {
        type: 'Public Disturbance',
        status: 'active',
        location: 'Central Park, North Entrance',
        timestamp: Date.now() - 1000 * 60 * 30,
        delay: '3 min',
        priority: 'medium',
        description: 'Loud noise complaint from nearby residents',
        mediaUrl: null,
        assignedOfficer: 'Officer Davis'
    },
    'inc-005': {
        type: 'Vandalism',
        status: 'reviewing',
        location: 'Metro Station, Platform 3',
        timestamp: Date.now() - 1000 * 60 * 90,
        delay: '4 min',
        priority: 'low',
        description: 'Graffiti detected on station walls',
        mediaUrl: null,
        assignedOfficer: 'Officer Williams'
    }
};

const analyticsData = {
    incidentTrends: [
        { date: '2025-11-16', count: 12 },
        { date: '2025-11-17', count: 15 },
        { date: '2025-11-18', count: 8 },
        { date: '2025-11-19', count: 18 },
        { date: '2025-11-20', count: 14 },
        { date: '2025-11-21', count: 10 },
        { date: '2025-11-22', count: 16 },
        { date: '2025-11-23', count: 7 }
    ],
    crimeTypeDistribution: [
        { type: 'Theft', count: 45, percentage: 30 },
        { type: 'Vandalism', count: 30, percentage: 20 },
        { type: 'Traffic Violation', count: 38, percentage: 25 },
        { type: 'Suspicious Activity', count: 22, percentage: 15 },
        { type: 'Public Disturbance', count: 15, percentage: 10 }
    ],
    responseTimeStats: {
        average: '4.2 min',
        fastest: '1.5 min',
        slowest: '8.7 min',
        median: '3.8 min'
    },
    geographicData: [
        { location: 'Downtown Plaza', incidents: 23 },
        { location: 'Riverside Mall', incidents: 18 },
        { location: 'Central Park', incidents: 12 },
        { location: 'Metro Station', incidents: 15 },
        { location: 'Highway 101', incidents: 10 }
    ],
    hourlyDistribution: [
        { hour: '00:00', count: 2 },
        { hour: '03:00', count: 1 },
        { hour: '06:00', count: 3 },
        { hour: '09:00', count: 8 },
        { hour: '12:00', count: 12 },
        { hour: '15:00', count: 15 },
        { hour: '18:00', count: 18 },
        { hour: '21:00', count: 10 }
    ]
};

const statsData = {
    activeAlerts: 3,
    todayIncidents: 7,
    pendingReviews: 2,
    responseTime: '4.2 min'
};

const adminSettings = {
    profile: {
        name: 'Test Admin',
        badgeNumber: 'ADMIN-001',
        department: 'Central Division',
        rank: 'Administrator',
        email: 'admin@cognisecure.local',
        phone: '+1 (555) 123-4567'
    },
    notifications: {
        urgentAlerts: true,
        emailNotifications: true,
        smsNotifications: false,
        desktopNotifications: true,
        soundEnabled: true
    },
    display: {
        theme: 'dark',
        language: 'en',
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h'
    },
    security: {
        twoFactorEnabled: true,
        biometricEnabled: true,
        sessionTimeout: 30,
        lastPasswordChange: '2025-10-15'
    }
};

// ============================================
// INITIALIZATION FUNCTIONS
// ============================================

async function initializeIncidents() {
    console.log('\n📋 Initializing incidents...');
    await set(ref(db, 'incidents'), sampleIncidents);
    console.log(`✅ Added ${Object.keys(sampleIncidents).length} incidents`);
}

async function initializeAnalytics() {
    console.log('\n📊 Initializing analytics...');
    await set(ref(db, 'analytics/summary'), analyticsData);
    console.log('✅ Analytics data initialized');
}

async function initializeStats() {
    console.log('\n📈 Initializing stats...');
    await set(ref(db, 'stats/daily'), statsData);
    console.log('✅ Daily stats initialized');
}

async function initializeOfficerSettings() {
    console.log('\n👮 Initializing officer settings...');
    await set(ref(db, 'officers/admin/settings/preferences'), adminSettings);
    console.log('✅ Admin officer settings initialized');
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
    try {
        console.log('\n🚀 Starting Firebase Realtime Database initialization...\n');
        console.log('='.repeat(50));

        await initializeIncidents();
        await initializeAnalytics();
        await initializeStats();
        await initializeOfficerSettings();

        console.log('\n' + '='.repeat(50));
        console.log('\n✨ Firebase database initialized successfully!');
        console.log('\n📝 Nodes created:');
        console.log('   - incidents (5 sample incidents)');
        console.log('   - analytics/summary (trends and statistics)');
        console.log('   - stats/daily (dashboard stats)');
        console.log('   - officers/admin/settings/preferences (admin settings)');
        console.log('\n🎉 You can now use the Police Dashboard with real Firebase data!');
        console.log('\n💡 Tip: Refresh your browser to see the data from Firebase');
        console.log('\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error initializing Firebase:', error);
        console.error('\nPlease check:');
        console.error('1. Your Firebase credentials in .env are correct');
        console.error('2. You have proper permissions in Firebase Console');
        console.error('3. Realtime Database is enabled in your Firebase project');
        console.error('4. Database security rules allow writes');
        process.exit(1);
    }
}

main();
