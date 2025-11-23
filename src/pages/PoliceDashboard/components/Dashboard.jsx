// ============================================
// DASHBOARD COMPONENT
// ============================================
// This is the main dashboard view for authenticated police officers
// It displays an overview of alerts, incidents, and analytics
// ============================================

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../../../firebase';

import IncidentsView from './IncidentsView';
import AnalyticsView from './AnalyticsView';
import SettingsView from './SettingsView';

/**
 * Dashboard Component
 * Main interface for police officers
 * 
 * Props:
 * @param {object} user - The authenticated user object
 * @param {function} onTriggerNotify - Function to manually trigger the urgent alert mode (for testing)
 */
export default function Dashboard({ user, onTriggerNotify }) {
  // State for the active sidebar view
  const [activeView, setActiveView] = useState('overview');

  // Real-time Data Fetching
  const [stats, setStats] = useState({
    activeAlerts: 0,
    todayIncidents: 0,
    pendingReviews: 0,
    responseTime: '--'
  });
  const [recentIncidents, setRecentIncidents] = useState([]);

  useEffect(() => {
    // Listen for stats updates
    const statsUnsub = onSnapshot(doc(db, 'stats', 'daily'), (doc) => {
      if (doc.exists()) {
        setStats(doc.data());
      }
    });

    // Listen for recent incidents
    const q = query(
      collection(db, 'incidents'),
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    const incidentsUnsub = onSnapshot(q, (snapshot) => {
      const incidents = snapshot.docs.map(doc => {
        const data = doc.data();
        let timestamp = new Date().toISOString();

        if (data.timestamp) {
          try {
            // Handle Firestore Timestamp
            if (data.timestamp && typeof data.timestamp.toDate === 'function') {
              timestamp = data.timestamp.toDate().toISOString();
            }
            // Handle String or Date object
            else if (data.timestamp) {
              timestamp = new Date(data.timestamp).toISOString();
            }
          } catch (e) {
            console.warn('Error parsing timestamp:', e);
            timestamp = new Date().toISOString();
          }
        }

        return {
          id: doc.id,
          ...data,
          timestamp
        };
      });
      setRecentIncidents(incidents);
    });

    return () => {
      statsUnsub();
      incidentsUnsub();
    };
  }, []);

  return (
    <div className="dashboard">
      {/* Sidebar Navigation */}
      <div className="dashboard-sidebar">
        <div className="sidebar-menu">
          <button
            className={`menu-item ${activeView === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveView('overview')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="7" height="7" strokeWidth="2" rx="1" />
              <rect x="14" y="3" width="7" height="7" strokeWidth="2" rx="1" />
              <rect x="14" y="14" width="7" height="7" strokeWidth="2" rx="1" />
              <rect x="3" y="14" width="7" height="7" strokeWidth="2" rx="1" />
            </svg>
            Overview
          </button>

          <button
            className={`menu-item ${activeView === 'incidents' ? 'active' : ''}`}
            onClick={() => setActiveView('incidents')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" />
            </svg>
            Incidents
          </button>

          <button
            className={`menu-item ${activeView === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveView('analytics')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeWidth="2" />
            </svg>
            Analytics
          </button>

          <button
            className={`menu-item ${activeView === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveView('settings')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeWidth="2" />
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2" />
            </svg>
            Settings
          </button>
        </div>

        {/* Test Alert Button (For Demo Purposes) */}
        <button className="test-alert-btn btn btn-danger w-full" onClick={onTriggerNotify}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Test Alert
        </button>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-content">
        {activeView === 'overview' && (
          <>
            {/* Stats Cards Grid */}
            <div className="stats-grid">
              <div className="stat-card glass-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeWidth="2" />
                  </svg>
                </div>
                <div className="stat-content">
                  <span className="stat-label">Active Alerts</span>
                  <span className="stat-value text-danger">{stats.activeAlerts}</span>
                </div>
              </div>

              <div className="stat-card glass-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2" />
                  </svg>
                </div>
                <div className="stat-content">
                  <span className="stat-label">Today's Incidents</span>
                  <span className="stat-value text-primary">{stats.todayIncidents}</span>
                </div>
              </div>

              <div className="stat-card glass-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" />
                  </svg>
                </div>
                <div className="stat-content">
                  <span className="stat-label">Pending Reviews</span>
                  <span className="stat-value text-warning">{stats.pendingReviews}</span>
                </div>
              </div>

              <div className="stat-card glass-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2" />
                  </svg>
                </div>
                <div className="stat-content">
                  <span className="stat-label">Avg Response Time</span>
                  <span className="stat-value text-success">{stats.responseTime}</span>
                </div>
              </div>
            </div>

            {/* Recent Incidents List */}
            <div className="incidents-section glass-card">
              <div className="section-header">
                <h3>Recent Incidents</h3>
                <button className="btn btn-ghost btn-sm">View All</button>
              </div>

              <div className="incidents-list">
                {recentIncidents.map(incident => (
                  <div key={incident.id} className="incident-item">
                    <div className="incident-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeWidth="2" />
                      </svg>
                    </div>
                    <div className="incident-details">
                      <div className="incident-header">
                        <span className="incident-type font-semibold">{incident.type}</span>
                        <span className={`badge badge-${incident.status === 'resolved' ? 'success' : incident.status === 'reviewing' ? 'warning' : 'primary'}`}>
                          {incident.status}
                        </span>
                      </div>
                      <div className="incident-meta">
                        <span>{incident.location}</span>
                        <span>•</span>
                        <span>{new Date(incident.timestamp).toLocaleTimeString()}</span>
                        <span>•</span>
                        <span className="text-muted">Delay: {incident.delay}</span>
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-sm">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeView === 'incidents' && <IncidentsView />}
        {activeView === 'analytics' && <AnalyticsView />}
        {activeView === 'settings' && <SettingsView user={user} />}
      </div>



      {/* Component-scoped styles */}
      <style>{`
        .dashboard {
          display: flex;
          gap: var(--space-xl);
          padding: var(--space-xl);
          max-width: 1600px;
          margin: 0 auto;
          min-height: calc(100vh - 80px);
        }

        .dashboard-sidebar {
          width: 250px;
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
          flex-shrink: 0;
        }

        .sidebar-menu {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md);
          background: var(--color-bg-glass);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          font-family: inherit;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-base);
          text-align: left;
        }

        .menu-item:hover {
          background: var(--color-bg-glass-light);
          color: var(--color-text-primary);
          border-color: var(--color-primary);
        }

        .menu-item.active {
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
          color: white;
          border-color: var(--color-primary);
          box-shadow: var(--glow-primary);
        }

        .test-alert-btn {
          margin-top: auto;
        }

        .dashboard-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-lg);
        }

        .stat-card {
          padding: var(--space-lg);
          display: flex;
          align-items: center;
          gap: var(--space-lg);
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--color-text-muted);
        }

        .stat-value {
          font-size: 1.875rem;
          font-weight: 700;
          line-height: 1;
        }

        .incidents-section {
          padding: var(--space-xl);
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-lg);
        }

        .incidents-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .incident-item {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md);
          background: var(--color-bg-glass-light);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          transition: all var(--transition-base);
        }

        .incident-item:hover {
          border-color: var(--color-primary);
          transform: translateX(4px);
        }

        .incident-icon {
          width: 40px;
          height: 40px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary);
          flex-shrink: 0;
        }

        .incident-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .incident-header {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .incident-type {
          color: var(--color-text-primary);
        }

        .incident-meta {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        @media (max-width: 1024px) {
          .dashboard {
            flex-direction: column;
          }

          .dashboard-sidebar {
            width: 100%;
          }

          .sidebar-menu {
            flex-direction: row;
            overflow-x: auto;
          }

          .menu-item {
            white-space: nowrap;
          }

          .test-alert-btn {
            margin-top: 0;
          }
        }
      `}</style>
    </div>
  );
}
