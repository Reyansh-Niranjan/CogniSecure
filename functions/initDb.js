const admin = require('firebase-admin');
const path = require('path');

// ============================================
// SAMPLE DATA
// ============================================

const sampleIncidents = [
    {
        type: 'Suspicious Activity',
        status: 'active',
        location: 'Downtown Plaza, Sector 7',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        delay: '2 min',
        priority: 'high',
        description: 'Multiple individuals loitering near ATM machines',
        mediaUrl: null,
        assignedOfficer: 'Officer Martinez'
    },
    {
        type: 'Traffic Violation',
        status: 'reviewing',
        location: 'Highway 101, Exit 42',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        delay: '5 min',
        priority: 'medium',
        description: 'Vehicle running red light at intersection',
        mediaUrl: null,
        assignedOfficer: 'Officer Chen'
    },
    {
        type: 'Theft Report',
        status: 'resolved',
        location: 'Riverside Mall, Parking Lot B',
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        delay: '1 min',
        priority: 'high',
        description: 'Vehicle break-in reported by security',
        mediaUrl: null,
        assignedOfficer: 'Officer Johnson'
    },
    {
        type: 'Public Disturbance',
        status: 'active',
        location: 'Central Park, North Entrance',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        delay: '3 min',
        priority: 'medium',
        description: 'Loud noise complaint from nearby residents',
        mediaUrl: null,
        assignedOfficer: 'Officer Davis'
    },
    {
        type: 'Vandalism',
        status: 'reviewing',
        location: 'Metro Station, Platform 3',
        timestamp: new Date(Date.now() - 1000 * 60 * 90),
        delay: '4 min',
        priority: 'low',
        description: 'Graffiti detected on station walls',
        mediaUrl: null,
        assignedOfficer: 'Officer Williams'
    }
];

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

async function initializeDatabase() {
    try {
        console.log('\n📋 Initializing incidents...');
        const batch = db.batch();

        sampleIncidents.forEach((incident, index) => {
            const docRef = db.collection('incidents').doc(`inc-00${index + 1}`);
            batch.set(docRef, incident);
        });

        await batch.commit();
        console.log(`✅ Added ${sampleIncidents.length} incidents`);

        console.log('\n📊 Initializing analytics...');
        await db.collection('analytics').doc('summary').set(analyticsData);
        console.log('✅ Analytics data initialized');

        console.log('\n📈 Initializing stats...');
        await db.collection('stats').doc('daily').set(statsData);
        console.log('✅ Daily stats initialized');

        console.log('\n👮 Initializing officer settings...');
        await db.collection('officers').doc('admin')
            .collection('settings').doc('preferences').set(adminSettings);
        console.log('✅ Admin settings initialized');

        console.log('\n✨ Database populated successfully!');
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        process.exit(1);
    }
}

initializeDatabase();
