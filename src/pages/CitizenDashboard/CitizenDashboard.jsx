// ============================================
// CITIZEN DASHBOARD PAGE - REDESIGNED
// ============================================

import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';
import { Header } from './components/Header';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';
import UpdateCard from './components/UpdateCard';
import EmptyState from './components/EmptyState';
import './CitizenDashboard.css';

/**
 * CitizenDashboard Page
 * Modern two-column layout with sidebar navigation
 */
const CitizenDashboard = () => {
    // State management
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [stats, setStats] = useState({
        activeAlerts: 0,
        resolvedToday: 0,
        systemUptime: '99.9%'
    });

    // Fetch updates from Firebase
    useEffect(() => {
        const fetchUpdates = async () => {
            try {
                setLoading(true);
                const getUpdatesFn = httpsCallable(functions, 'getUpdates');
                const result = await getUpdatesFn({
                    limit: 20,
                    category: filter !== 'all' ? filter : undefined
                });

                if (result.data && result.data.updates) {
                    setUpdates(result.data.updates);

                    // Calculate stats
                    const active = result.data.updates.filter(u => u.priority === 'high').length;
                    setStats(prev => ({ ...prev, activeAlerts: active }));
                }
            } catch (error) {
                console.error('Failed to fetch updates:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUpdates();
    }, [filter]);

    // Filter updates based on search query
    const filteredUpdates = updates.filter(update => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            update.title?.toLowerCase().includes(query) ||
            update.description?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="citizen-dashboard-layout">
            {/* Sidebar Navigation */}
            <Sidebar
                activeFilter={filter}
                onFilterChange={setFilter}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main Content Area */}
            <div className="main-wrapper">
                {/* Header */}
                <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                {/* Content */}
                <main className="dashboard-content">
                    <div className="content-container">
                        {/* Summary Bar */}
                        <section className="summary-bar">
                            <div className="summary-card">
                                <div className="summary-icon danger">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <div className="summary-info">
                                    <div className="summary-value">{stats.activeAlerts}</div>
                                    <div className="summary-label">Active Alerts</div>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className="summary-icon success">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className="summary-info">
                                    <div className="summary-value">{stats.resolvedToday}</div>
                                    <div className="summary-label">Resolved Today</div>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className="summary-icon primary">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M13 10V3L4 14H11V21L20 10H13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className="summary-info">
                                    <div className="summary-value">{stats.systemUptime}</div>
                                    <div className="summary-label">System Uptime</div>
                                </div>
                            </div>
                        </section>

                        {/* Search and Filters */}
                        <section className="controls-section">
                            <SearchBar value={searchQuery} onChange={setSearchQuery} />
                        </section>

                        {/* Updates Grid */}
                        <section className="updates-section">
                            <h2 className="section-title">Recent Updates</h2>

                            {loading ? (
                                <div className="loading-state">
                                    <div className="loading-spinner"></div>
                                    <p>Loading updates...</p>
                                </div>
                            ) : filteredUpdates.length > 0 ? (
                                <div className="updates-grid">
                                    {filteredUpdates.map((update, index) => (
                                        <div
                                            key={update.id || index}
                                            style={{ animationDelay: `${index * 0.05}s` }}
                                            className="update-item"
                                        >
                                            <UpdateCard {...update} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState message={searchQuery ? "No updates match your search" : "No updates found"} />
                            )}
                        </section>
                    </div>
                </main>

                {/* Footer */}
                <footer className="dashboard-footer">
                    <div className="footer-container">
                        <div className="footer-grid">
                            <div className="footer-column">
                                <h4 className="footer-heading">CogniSecure</h4>
                                <p className="footer-text">
                                    Advanced AI-powered public safety monitoring system ensuring community security 24/7.
                                </p>
                            </div>

                            <div className="footer-column">
                                <h4 className="footer-heading">Emergency Contact</h4>
                                <p className="footer-text">
                                    For emergencies, dial your local emergency services immediately.
                                </p>
                                <p className="footer-emergency">Emergency: 911</p>
                            </div>

                            <div className="footer-column">
                                <h4 className="footer-heading">Provider</h4>
                                <p className="footer-text">
                                    Powered by CogniSecure Technologies
                                </p>
                                <p className="footer-text">
                                    Serving communities with cutting-edge safety solutions
                                </p>
                            </div>
                        </div>

                        <div className="footer-bottom">
                            <p>&copy; 2025 CogniSecure. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default CitizenDashboard;
