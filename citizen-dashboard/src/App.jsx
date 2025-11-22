import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import UpdateCard from './components/UpdateCard';
import './App.css';

const App = () => {
  const [updates, setUpdates] = useState([
    {
      id: 1,
      type: 'crime',
      title: 'Suspicious Activity Detected in Downtown Area',
      description: 'Motion detected and object removal confirmed. Alert sent to local authorities. Investigation in progress.',
      timestamp: new Date(Date.now() - 5 * 60000), // 5 minutes ago
      priority: 'high'
    },
    {
      id: 2,
      type: 'database',
      title: 'Database Synchronized Successfully',
      description: 'All crime logs and incident reports have been successfully synchronized with the central database.',
      timestamp: new Date(Date.now() - 25 * 60000), // 25 minutes ago
      priority: 'medium'
    },
    {
      id: 3,
      type: 'website',
      title: 'System Maintenance Scheduled',
      description: 'Routine system maintenance will be performed on November 25th from 2:00 AM to 4:00 AM. No disruption to monitoring services expected.',
      timestamp: new Date(Date.now() - 120 * 60000), // 2 hours ago
      priority: 'low'
    },
    {
      id: 4,
      type: 'crime',
      title: 'Alert Resolved: Park District Incident',
      description: 'The previously reported incident in the park district has been resolved. Officers have secured the area.',
      timestamp: new Date(Date.now() - 180 * 60000), // 3 hours ago
      priority: 'medium'
    },
    {
      id: 5,
      type: 'database',
      title: 'New Crime Pattern Analysis Available',
      description: 'AI analysis has identified new crime patterns in the northeastern sector. Report available for authorized personnel.',
      timestamp: new Date(Date.now() - 300 * 60000), // 5 hours ago
      priority: 'medium'
    },
    {
      id: 6,
      type: 'website',
      title: 'Mobile App Update Released',
      description: 'Version 2.1 of the CogniSecure mobile app is now available with improved notification features and faster response times.',
      timestamp: new Date(Date.now() - 24 * 60 * 60000), // 1 day ago
      priority: 'low'
    }
  ]);

  const [stats, setStats] = useState({
    activeAlerts: 1,
    resolvedToday: 8,
    systemUptime: '99.8%'
  });

  return (
    <div className="app">
      <Header />

      <main className="main-content">
        <div className="container">
          {/* Hero Section */}
          <section className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title animate-fade-in">
                Public Safety <span className="gradient-text">Updates</span>
              </h1>
              <p className="hero-description animate-fade-in">
                Stay informed with real-time updates about crime alerts, database changes, and system announcements in your community.
              </p>

              <div className="stats-grid animate-fade-in">
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

          {/* Updates Feed */}
          <section className="updates-section">
            <div className="section-header">
              <h2 className="section-title">Recent Updates</h2>
              <div className="filter-tabs">
                <button className="filter-tab active">All Updates</button>
                <button className="filter-tab">Crime Alerts</button>
                <button className="filter-tab">Database</button>
                <button className="filter-tab">Website</button>
              </div>
            </div>

            <div className="updates-grid">
              {updates.map((update, index) => (
                <div
                  key={update.id}
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <UpdateCard {...update} />
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
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

export default App;
