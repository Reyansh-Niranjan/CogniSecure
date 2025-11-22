// ============================================
// CITIZEN DASHBOARD PAGE
// ============================================
// This is the main public-facing page of the application
// It displays real-time updates about crime, database changes, and announcements
// ============================================

import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';
import Header from './components/Header';
import UpdateCard from './components/UpdateCard';
import './CitizenDashboard.css';

/**
 * CitizenDashboard Page
 * 
 * Features:
 * - Real-time public safety updates
 * - Filtering by category (Crime, Database, Website)
 * - System status statistics
 * - Responsive grid layout
 * - Firebase Cloud Functions integration for fetching data
 */
const CitizenDashboard = () => {
    // State for storing updates list
    const [updates, setUpdates] = useState([]);

    // State for loading status
    const [loading, setLoading] = useState(true);

    // State for active filter category
    const [filter, setFilter] = useState('all');

    // State for dashboard statistics
    const [stats, setStats] = useState({
        activeAlerts: 0,
        resolvedToday: 0,
        systemUptime: '99.9%'
    });

    // ============================================
    // DATA FETCHING
    // ============================================

    useEffect(() => {
        // Fetch updates from Firebase Cloud Function
        const fetchUpdates = async () => {
            try {
                setLoading(true);

                // Call the 'getUpdates' Cloud Function
                // This function is public and doesn't require authentication
                const getUpdatesFn = httpsCallable(functions, 'getUpdates');
                const result = await getUpdatesFn({
                    limit: 20,
                    category: filter !== 'all' ? filter : undefined
                });

                if (result.data && result.data.updates) {
                    setUpdates(result.data.updates);
                }
            } catch (error) {
                console.error('Failed to fetch updates:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUpdates();
    }, [filter]); // Re-fetch when filter changes

    return (
        <div className="citizen-dashboard">
            <Header />

            <main className="main-content">
                <div className="container">
                    {/* Hero Section - Introduction and Key Stats */}
                    <section className="hero-section">
                        <div className="hero-content">
                            <h1 className="hero-title animate-fade-in">
                                Public Safety <span className="gradient-text">Updates</span>
                            </h1>
                            <p className="hero-description animate-fade-in">
                                Stay informed with real-time updates about crime alerts, database changes, and system announcements in your community.
                            </p>

                            {/* Statistics Cards */}
                            <div className="stats-grid animate-fade-in">
                                {/* Active Alerts Stat */}
                                <div className="stat-card">
                                    <div className="stat-icon danger">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                    <div className="stat-info">
                                        <div className="stat-value">{stats.activeAlerts}</div>
                                        <div className="stat-label">Active Alerts</div>
                                    </div>
                                </div>

                                {/* Resolved Today Stat */}
                                <div className="stat-card">
                                    <div className="stat-icon success">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <div className="stat-info">
                                        <div className="stat-value">{stats.resolvedToday}</div>
                                        <div className="stat-label">Resolved Today</div>
                                    </div>
                                </div>

                                {/* System Uptime Stat */}
                                <div className="stat-card">
                                    <div className="stat-icon primary">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <path d="M13 10V3L4 14H11V21L20 10H13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <div className="stat-info">
                                        <div className="stat-value">{stats.systemUptime}</div>
                                        <div className="stat-label">System Uptime</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Updates Feed Section */}
                    <section className="updates-section">
                        <div className="section-header">
                            <h2 className="section-title">Recent Updates</h2>

                            {/* Category Filters */}
                            <div className="filter-tabs">
                                <button
                                    className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                                    onClick={() => setFilter('all')}
                                >
                                    All Updates
                                </button>
                                <button
                                    className={`filter-tab ${filter === 'crime_alert' ? 'active' : ''}`}
                                    onClick={() => setFilter('crime_alert')}
                                >
                                    Crime Alerts
                                </button>
                                <button
                                    className={`filter-tab ${filter === 'database' ? 'active' : ''}`}
                                    onClick={() => setFilter('database')}
                                >
                                    Database
                                </button>
                                <button
                                    className={`filter-tab ${filter === 'website' ? 'active' : ''}`}
                                    onClick={() => setFilter('website')}
                                >
                                    Website
                                </button>
                            </div>
                        </div>

                        {/* Updates Grid */}
                        <div className="updates-grid">
                            {loading ? (
                                // Loading state placeholder
                                <div className="loading-state">Loading updates...</div>
                            ) : updates.length > 0 ? (
                                updates.map((update, index) => (
                                    <div
                                        key={update.id}
                                        style={{
                                            animationDelay: `${index * 0.1}s`
                                        }}
                                    >
                                        <UpdateCard {...update} />
                                    </div>
                                ))
                            ) : (
                                // Empty state
                                <div className="empty-state">No updates found for this category.</div>
                            )}
                        </div>
                    </section>
                </div>
            </main>

            {/* Footer Section */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-section">
                            <h4 className="footer-title">CogniSecure</h4>
                            <p className="footer-text">
                                Advanced AI-powered public safety monitoring system ensuring community security 24/7.
                            </p>
                        </div>

                        <div className="footer-section">
                            <h4 className="footer-title">About</h4>
                            <p className="footer-text">
                                This platform provides real-time updates to keep citizens informed about safety matters in their community.
                            </p>
                        </div>

                        <div className="footer-section">
                            <h4 className="footer-title">System Status</h4>
                            <div className="footer-status">
                                <div className="status-item">
                                    <span className="status-dot-small"></span>
                                    <span>All Systems Operational</span>
                                </div>
                                <div className="status-item">
                                    <span className="status-dot-small"></span>
                                    <span>Monitoring Active</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>&copy; 2025 CogniSecure. All rights reserved.</p>
                        <p className="footer-note">For emergencies, dial your local emergency services immediately.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default CitizenDashboard;
