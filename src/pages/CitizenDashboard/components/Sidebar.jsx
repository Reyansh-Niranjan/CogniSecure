// ============================================
// SIDEBAR COMPONENT - CITIZEN DASHBOARD
// ============================================
// Navigation sidebar with category filters and branding
// ============================================

import './Sidebar.css';

/**
 * Sidebar Component
 * Left navigation panel with category filters
 * 
 * Props:
 * @param {string} activeFilter - Currently active filter category
 * @param {function} onFilterChange - Callback when filter is changed
 * @param {boolean} isOpen - Mobile sidebar open state
 * @param {function} onClose - Callback to close mobile sidebar
 */
const Sidebar = ({ activeFilter, onFilterChange, isOpen, onClose }) => {
    const navItems = [
        {
            id: 'all',
            label: 'All Updates',
            icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3 4H17M3 10H17M3 16H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            )
        },
        {
            id: 'crime_alert',
            label: 'Crime Alerts',
            icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2L10 10M10 14L10 15M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            )
        },
        {
            id: 'database',
            label: 'Database',
            icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2C14.4183 2 18 3.34315 18 5V15C18 16.6569 14.4183 18 10 18C5.58172 18 2 16.6569 2 15V5C2 3.34315 5.58172 2 10 2Z" stroke="currentColor" strokeWidth="2" />
                    <path d="M18 10C18 11.6569 14.4183 13 10 13C5.58172 13 2 11.6569 2 10" stroke="currentColor" strokeWidth="2" />
                </svg>
            )
        },
        {
            id: 'website',
            label: 'Website',
            icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" strokeWidth="2" />
                    <path d="M2 10H18M10 2C12 4 13 7 13 10C13 13 12 16 10 18C8 16 7 13 7 10C7 7 8 4 10 2Z" stroke="currentColor" strokeWidth="2" />
                </svg>
            )
        }
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

            {/* Sidebar */}
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                {/* Logo & Branding */}
                <div className="sidebar-header">
                    <div className="logo-section">
                        <div className="logo-icon-wrapper">
                            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                                <circle cx="18" cy="18" r="16" stroke="url(#logoGradient)" strokeWidth="2" />
                                <path d="M18 6V18L26 26" stroke="url(#logoGradient)" strokeWidth="2" strokeLinecap="round" />
                                <circle cx="18" cy="18" r="2.5" fill="url(#logoGradient)" />
                                <defs>
                                    <linearGradient id="logoGradient" x1="0" y1="0" x2="36" y2="36">
                                        <stop stopColor="#0057b8" />
                                        <stop offset="1" stopColor="#004494" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <div className="logo-text-section">
                            <h2 className="logo-title">CogniSecure</h2>
                            <p className="logo-tagline">AI-powered safety, 24/7</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    <p className="nav-label">Categories</p>
                    <ul className="nav-list">
                        {navItems.map((item) => (
                            <li key={item.id}>
                                <button
                                    className={`nav-item ${activeFilter === item.id ? 'active' : ''}`}
                                    onClick={() => {
                                        onFilterChange(item.id);
                                        if (window.innerWidth < 768) {
                                            onClose();
                                        }
                                    }}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    <span className="nav-label-text">{item.label}</span>
                                    {activeFilter === item.id && <span className="active-indicator" />}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* System Status Widget */}
                <div className="sidebar-footer">
                    <div className="status-widget">
                        <div className="status-header">
                            <div className="status-dot-pulse" />
                            <span className="status-title">System Status</span>
                        </div>
                        <div className="status-items">
                            <div className="status-row">
                                <span className="status-label">Monitoring</span>
                                <span className="status-value active">Active</span>
                            </div>
                            <div className="status-row">
                                <span className="status-label">Uptime</span>
                                <span className="status-value">99.9%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
