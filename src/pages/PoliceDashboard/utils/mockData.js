// ============================================
// MOCK DATA UTILITIES
// ============================================
// Provides fallback data when Firebase is unavailable
// ============================================

// Mock Incidents Data
export const mockIncidents = [
    {
        id: 'inc-001',
        type: 'Suspicious Activity',
        status: 'active',
        location: 'Downtown Plaza, Sector 7',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min ago
        delay: '2 min',
        priority: 'high',
        description: 'Multiple individuals loitering near ATM machines',
        mediaUrl: null,
        assignedOfficer: 'Officer Martinez'
    },
    {
        id: 'inc-002',
        type: 'Traffic Violation',
        status: 'reviewing',
        location: 'Highway 101, Exit 42',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 min ago
        delay: '5 min',
        priority: 'medium',
        description: 'Vehicle running red light at intersection',
        mediaUrl: null,
        assignedOfficer: 'Officer Chen'
    },
    {
        id: 'inc-003',
        type: 'Theft Report',
        status: 'resolved',
        location: 'Riverside Mall, Parking Lot B',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
        delay: '1 min',
        priority: 'high',
        description: 'Vehicle break-in reported by security',
        mediaUrl: null,
        assignedOfficer: 'Officer Johnson'
    },
    {
        id: 'inc-004',
        type: 'Public Disturbance',
        status: 'active',
        location: 'Central Park, North Entrance',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
        delay: '3 min',
        priority: 'medium',
        description: 'Loud noise complaint from nearby residents',
        mediaUrl: null,
        assignedOfficer: 'Officer Davis'
    },
    {
        id: 'inc-005',
        type: 'Vandalism',
        status: 'reviewing',
        location: 'Metro Station, Platform 3',
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
        delay: '4 min',
        priority: 'low',
        description: 'Graffiti detected on station walls',
        mediaUrl: null,
        assignedOfficer: 'Officer Williams'
    }
];

// Mock Analytics Data
export const mockAnalytics = {
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

// Mock User Settings
export const mockUserSettings = {
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

// Helper function to check Firebase connection
export const checkFirebaseConnection = async (db) => {
    try {
        // Attempt a simple Firestore read
        const { getDoc, doc } = await import('firebase/firestore');
        await getDoc(doc(db, '_health', 'check'));
        return true;
    } catch (error) {
        console.warn('Firebase connection unavailable, using mock data:', error.message);
        return false;
    }
};

// Helper to get incidents with fallback
export const getIncidentsWithFallback = async (db) => {
    const isConnected = await checkFirebaseConnection(db);

    if (!isConnected) {
        return { data: mockIncidents, isMock: true };
    }

    try {
        const { collection, query, orderBy, getDocs } = await import('firebase/firestore');
        const q = query(collection(db, 'incidents'), orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { data: mockIncidents, isMock: true };
        }

        const incidents = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate().toISOString() || new Date().toISOString()
        }));

        console.log('🔥 FETCHED INCIDENTS FROM FIREBASE:', incidents.length, 'items');
        return { data: incidents, isMock: false };
    } catch (error) {
        console.error('Error fetching incidents:', error);
        return { data: mockIncidents, isMock: true };
    }
};

// Helper to get analytics with fallback
export const getAnalyticsWithFallback = async (db) => {
    const isConnected = await checkFirebaseConnection(db);

    if (!isConnected) {
        return { data: mockAnalytics, isMock: true };
    }

    try {
        const { doc, getDoc } = await import('firebase/firestore');
        const analyticsDoc = await getDoc(doc(db, 'analytics', 'summary'));

        if (!analyticsDoc.exists()) {
            return { data: mockAnalytics, isMock: true };
        }

        console.log('🔥 FETCHED ANALYTICS FROM FIREBASE');
        return { data: analyticsDoc.data(), isMock: false };
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return { data: mockAnalytics, isMock: true };
    }
};

// Helper to get user settings with fallback
export const getUserSettingsWithFallback = async (db, userId) => {
    const isConnected = await checkFirebaseConnection(db);

    if (!isConnected) {
        return { data: mockUserSettings, isMock: true };
    }

    try {
        const { doc, getDoc } = await import('firebase/firestore');
        const settingsDoc = await getDoc(doc(db, 'officers', userId, 'settings', 'preferences'));

        if (!settingsDoc.exists()) {
            return { data: mockUserSettings, isMock: true };
        }

        console.log('🔥 FETCHED USER SETTINGS FROM FIREBASE');
        return { data: settingsDoc.data(), isMock: false };
    } catch (error) {
        console.error('Error fetching user settings:', error);
        return { data: mockUserSettings, isMock: true };
    }
};
