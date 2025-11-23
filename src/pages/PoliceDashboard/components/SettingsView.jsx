// ============================================
// SETTINGS VIEW COMPONENT
// ============================================
// Officer profile and preferences management
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { db } from '../../../firebase';
import { getUserSettingsWithFallback } from '../utils/mockData';

/**
 * SettingsView Component
 * User settings and preferences interface
 */
export default function SettingsView({ user }) {
    const [settings, setSettings] = useState(null);
    const [isMockData, setIsMockData] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');

    const loadSettings = useCallback(async () => {
        setIsLoading(true);
        const userId = user?.id || 'admin';
        const { data, isMock } = await getUserSettingsWithFallback(db, userId);
        setSettings(data);
        setIsMockData(isMock);
        setIsLoading(false);
    }, [user, setSettings, setIsMockData, setIsLoading]);

    useEffect(() => {
        loadSettings();
    }, [user, loadSettings]);

    const handleToggle = (category, key) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: !prev[category][key]
            }
        }));
    };

    if (isLoading) {
        return (
            <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading settings...</p>
                <style>{`
          .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: var(--space-3xl);
            gap: var(--space-lg);
          }
          .spinner {
            width: 48px;
            height: 48px;
            border: 4px solid var(--color-border);
            border-top-color: var(--color-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        );
    }

    return (
        <div className="settings-view">
            {/* Header */}
            <div className="view-header">
                <div>
                    <h2>Settings</h2>
                    <p className="text-muted">Manage your profile and preferences</p>
                </div>
                {isMockData && (
                    <div className="mock-indicator">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" strokeWidth="2" />
                            <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
                            <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
                        </svg>
                        Using Mock Data
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="settings-tabs">
                <button
                    className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" />
                        <circle cx="12" cy="7" r="4" strokeWidth="2" />
                    </svg>
                    Profile
                </button>
                <button
                    className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notifications')}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeWidth="2" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeWidth="2" />
                    </svg>
                    Notifications
                </button>
                <button
                    className={`tab-btn ${activeTab === 'display' ? 'active' : ''}`}
                    onClick={() => setActiveTab('display')}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="2" />
                        <line x1="8" y1="21" x2="16" y2="21" strokeWidth="2" />
                        <line x1="12" y1="17" x2="12" y2="21" strokeWidth="2" />
                    </svg>
                    Display
                </button>
                <button
                    className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2" />
                    </svg>
                    Security
                </button>
            </div>

            {/* Tab Content */}
            <div className="settings-content">
                {activeTab === 'profile' && (
                    <div className="settings-section glass-card">
                        <h3>Profile Information</h3>
                        <div className="settings-grid">
                            <div className="setting-item">
                                <label>Full Name</label>
                                <input type="text" value={settings.profile.name} readOnly />
                            </div>
                            <div className="setting-item">
                                <label>Badge Number</label>
                                <input type="text" value={settings.profile.badgeNumber} readOnly />
                            </div>
                            <div className="setting-item">
                                <label>Department</label>
                                <input type="text" value={settings.profile.department} readOnly />
                            </div>
                            <div className="setting-item">
                                <label>Rank</label>
                                <input type="text" value={settings.profile.rank} readOnly />
                            </div>
                            <div className="setting-item">
                                <label>Email</label>
                                <input type="email" value={settings.profile.email} readOnly />
                            </div>
                            <div className="setting-item">
                                <label>Phone</label>
                                <input type="tel" value={settings.profile.phone} readOnly />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="settings-section glass-card">
                        <h3>Notification Preferences</h3>
                        <div className="toggle-list">
                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <div className="toggle-title">Urgent Alerts</div>
                                    <div className="toggle-description">Receive immediate notifications for high-priority incidents</div>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.notifications.urgentAlerts}
                                        onChange={() => handleToggle('notifications', 'urgentAlerts')}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <div className="toggle-title">Email Notifications</div>
                                    <div className="toggle-description">Get incident updates via email</div>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.notifications.emailNotifications}
                                        onChange={() => handleToggle('notifications', 'emailNotifications')}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <div className="toggle-title">SMS Notifications</div>
                                    <div className="toggle-description">Receive text messages for critical alerts</div>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.notifications.smsNotifications}
                                        onChange={() => handleToggle('notifications', 'smsNotifications')}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <div className="toggle-title">Desktop Notifications</div>
                                    <div className="toggle-description">Show browser notifications</div>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.notifications.desktopNotifications}
                                        onChange={() => handleToggle('notifications', 'desktopNotifications')}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <div className="toggle-title">Sound Effects</div>
                                    <div className="toggle-description">Play sound for new alerts</div>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.notifications.soundEnabled}
                                        onChange={() => handleToggle('notifications', 'soundEnabled')}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'display' && (
                    <div className="settings-section glass-card">
                        <h3>Display Settings</h3>
                        <div className="settings-grid">
                            <div className="setting-item">
                                <label>Theme</label>
                                <select value={settings.display.theme} disabled>
                                    <option value="dark">Dark</option>
                                    <option value="light">Light</option>
                                </select>
                            </div>
                            <div className="setting-item">
                                <label>Language</label>
                                <select value={settings.display.language} disabled>
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                </select>
                            </div>
                            <div className="setting-item">
                                <label>Timezone</label>
                                <select value={settings.display.timezone} disabled>
                                    <option value="America/New_York">Eastern Time</option>
                                    <option value="America/Chicago">Central Time</option>
                                    <option value="America/Denver">Mountain Time</option>
                                    <option value="America/Los_Angeles">Pacific Time</option>
                                </select>
                            </div>
                            <div className="setting-item">
                                <label>Date Format</label>
                                <select value={settings.display.dateFormat} disabled>
                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                </select>
                            </div>
                            <div className="setting-item">
                                <label>Time Format</label>
                                <select value={settings.display.timeFormat} disabled>
                                    <option value="12h">12-hour</option>
                                    <option value="24h">24-hour</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="settings-section glass-card">
                        <h3>Security Settings</h3>
                        <div className="toggle-list">
                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <div className="toggle-title">Two-Factor Authentication</div>
                                    <div className="toggle-description">Add an extra layer of security to your account</div>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.security.twoFactorEnabled}
                                        onChange={() => handleToggle('security', 'twoFactorEnabled')}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <div className="toggle-title">Biometric Login</div>
                                    <div className="toggle-description">Use face scan or fingerprint for authentication</div>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.security.biometricEnabled}
                                        onChange={() => handleToggle('security', 'biometricEnabled')}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        <div className="security-info">
                            <div className="info-item">
                                <span className="info-label">Session Timeout</span>
                                <span className="info-value">{settings.security.sessionTimeout} minutes</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Last Password Change</span>
                                <span className="info-value">{new Date(settings.security.lastPasswordChange).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <button className="btn btn-primary">Change Password</button>
                    </div>
                )}
            </div>

            {/* Save Button */}
            <div className="settings-footer">
                <button className="btn btn-ghost">Reset to Defaults</button>
                <button className="btn btn-primary">Save Changes</button>
            </div>

            {/* Component Styles */}
            <style>{`
        .settings-view {
          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
        }

        .view-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .view-header h2 {
          margin-bottom: var(--space-xs);
        }

        .mock-indicator {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md);
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid var(--color-warning);
          border-radius: var(--radius-md);
          color: var(--color-warning);
          font-size: 0.875rem;
        }

        .settings-tabs {
          display: flex;
          gap: var(--space-sm);
          border-bottom: 2px solid var(--color-border);
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md) var(--space-lg);
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--color-text-secondary);
          font-family: inherit;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-base);
          margin-bottom: -2px;
        }

        .tab-btn:hover {
          color: var(--color-text-primary);
        }

        .tab-btn.active {
          color: var(--color-primary);
          border-bottom-color: var(--color-primary);
        }

        .settings-content {
          min-height: 400px;
        }

        .settings-section {
          padding: var(--space-xl);
        }

        .settings-section h3 {
          margin-bottom: var(--space-lg);
          font-size: 1.125rem;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-lg);
        }

        .setting-item {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .setting-item label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-secondary);
        }

        .setting-item input,
        .setting-item select {
          padding: var(--space-sm) var(--space-md);
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-family: inherit;
          font-size: 0.875rem;
        }

        .setting-item input:focus,
        .setting-item select:focus {
          outline: none;
          border-color: var(--color-primary);
        }

        .toggle-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .toggle-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-md);
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
        }

        .toggle-info {
          flex: 1;
        }

        .toggle-title {
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: var(--space-xs);
        }

        .toggle-description {
          font-size: 0.875rem;
          color: var(--color-text-muted);
        }

        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 24px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--color-bg-tertiary);
          border: 2px solid var(--color-border);
          transition: var(--transition-base);
          border-radius: 24px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          transition: var(--transition-base);
          border-radius: 50%;
        }

        input:checked + .toggle-slider {
          background-color: var(--color-primary);
          border-color: var(--color-primary);
        }

        input:checked + .toggle-slider:before {
          transform: translateX(24px);
        }

        .security-info {
          margin-top: var(--space-xl);
          padding: var(--space-lg);
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .info-label {
          font-weight: 600;
          color: var(--color-text-secondary);
        }

        .info-value {
          color: var(--color-text-primary);
        }

        .settings-footer {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-md);
          padding-top: var(--space-lg);
          border-top: 1px solid var(--color-border);
        }

        @media (max-width: 768px) {
          .settings-tabs {
            overflow-x: auto;
          }

          .tab-btn {
            white-space: nowrap;
          }

          .settings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
}
