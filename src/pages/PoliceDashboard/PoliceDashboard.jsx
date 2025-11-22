// ============================================
// POLICE DASHBOARD PAGE
// ============================================
// This is the main container for the Police Dashboard route
// It handles authentication state, layout, and global alerts
// ============================================

import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import NotifyMode from './components/NotifyMode';
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

    // Handle Triggering Urgent Alert (Demo/Real-time)
    const handleTriggerNotify = () => {
        setCurrentAlert({
            id: 'alert-' + Date.now(),
            type: 'Weapon Detected',
            location: 'Sector 4, Main Entrance',
            timestamp: new Date().toISOString(),
            recordedAt: new Date().toISOString(),
            description: 'AI surveillance system detected a potential weapon in the main entrance area. Immediate verification required.',
            delay: '0.5s'
        });
        setNotifyMode(true);
    };

    // Handle Dismissing Alert
    const handleDismissNotify = () => {
        setNotifyMode(false);
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
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default PoliceDashboard;
