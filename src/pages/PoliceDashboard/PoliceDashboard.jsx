// ============================================
// POLICE DASHBOARD PAGE
// ============================================
// This is the main container for the Police Dashboard route
// It handles authentication state, layout, and global alerts
// ============================================

import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import LoginPage from './components/LoginPage';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import NotifyMode from './components/NotifyMode';
import AIAssistant from './components/AIAssistant';
import './PoliceDashboard.css';

// Firebase imports (commented out until fully configured)
// import { auth } from '../../firebase';
// import { onAuthStateChanged, signOut } from 'firebase/auth';

/**
 * PoliceDashboard Page Component
 * Manages the overall state of the police portal
 */
const PoliceDashboard = () => {
    // Authentication State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Alert State
    const [notifyMode, setNotifyMode] = useState(false);
    const [currentAlert, setCurrentAlert] = useState(null);

    // Effect to check authentication status
    useEffect(() => {
        // TODO: Replace with actual Firebase Auth listener
        // const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        //     if (currentUser) {
        //         setUser({
        //             name: currentUser.displayName || 'Officer',
        //             email: currentUser.email,
        //             badge: 'PO-1234' // Fetch from Firestore profile
        //         });
        //         setIsAuthenticated(true);
        //     } else {
        //         setUser(null);
        //         setIsAuthenticated(false);
        //     }
        //     setLoading(false);
        // });
        // return () => unsubscribe();

        // Simulate loading check
        setTimeout(() => setLoading(false), 500);
    }, []);
    // Effect to listen for URGENT ALERTS
    useEffect(() => {
        if (!isAuthenticated) return;

        // Listen for active high-priority incidents
        // Note: Simplified query to avoid needing a composite index during development
        const q = query(
            collection(db, 'incidents'),
            where('priority', '==', 'high'),
            where('status', '==', 'active')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                // Manually sort by timestamp desc to get the latest
                const alerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                const alertData = alerts[0];

                // Only trigger if it's a new alert (or we haven't seen it yet)
                if (!currentAlert || currentAlert.id !== alertData.id) {
                    setCurrentAlert(alertData);
                    setNotifyMode(true);
                }
            }
        });

        return () => unsubscribe();
    }, [isAuthenticated, currentAlert]);

    // Handle Login Success
    const handleLogin = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
    };

    // Handle Logout
    const handleLogout = async () => {
        // await signOut(auth);
        setIsAuthenticated(false);
        setUser(null);
    };

    // AI Assistant State
    const [aiOpen, setAiOpen] = useState(false);
    const [aiContext, setAiContext] = useState(null);

    // Handle AI Actions from NotifyMode
    const handleAIAction = (action) => {
        if (currentAlert) {
            setAiContext({
                action,
                data: currentAlert
            });
            setAiOpen(true);
        }
    };

    // Handle Triggering Urgent Alert (Writes to DB)
    const handleTriggerNotify = async () => {
        try {
            await addDoc(collection(db, 'incidents'), {
                type: 'Weapon Detected',
                status: 'active',
                priority: 'high',
                location: 'Sector 4, Main Entrance',
                timestamp: new Date().toISOString(), // Use ISO string for consistency
                recordedAt: new Date().toISOString(),
                description: 'AI surveillance system detected a potential weapon in the main entrance area. Immediate verification required.',
                delay: '0.5s',
                mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                snapshotUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80'
            });
            console.log('Test alert triggered in database');
        } catch (error) {
            console.error('Error triggering test alert:', error);
            alert('Failed to trigger test alert. Check console.');
        }
    };

    // Handle Dismissing Alert
    const handleDismissNotify = () => {
        setNotifyMode(false);
        // Optional: Update alert status to 'reviewing' in DB
        // await updateDoc(doc(db, 'incidents', currentAlert.id), { status: 'reviewing' });
        setCurrentAlert(null);
    };

    if (loading) {
        return (
            <div className="police-dashboard-app">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="police-dashboard-app">
            {!isAuthenticated ? (
                <LoginPage onLogin={handleLogin} />
            ) : (
                <>
                    <Navbar
                        user={user}
                        onLogout={handleLogout}
                        hasAlert={notifyMode}
                    />

                    <Dashboard
                        user={user}
                        onTriggerNotify={handleTriggerNotify}
                    />

                    {notifyMode && currentAlert && (
                        <NotifyMode
                            alert={currentAlert}
                            onDismiss={handleDismissNotify}
                            onAIAction={handleAIAction}
                        />
                    )}

                    <AIAssistant
                        isOpen={aiOpen}
                        onClose={() => setAiOpen(false)}
                        context={aiContext}
                    />
                </>
            )}
        </div>
    );
};

export default PoliceDashboard;
