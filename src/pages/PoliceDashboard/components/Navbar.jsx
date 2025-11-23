// ============================================
// NAVBAR COMPONENT
// ============================================
// This component renders the top navigation bar for the Police Dashboard
// It displays the branding, user profile, and alert status
// ============================================


/**
 * Navbar Component
 * Top navigation bar for authenticated officers
 * 
 * Props:
 * @param {object} user - The authenticated user object (name, badge, etc.)
 * @param {function} onLogout - Function to handle user logout
 * @param {boolean} hasAlert - Whether there is an active urgent alert
 */
export default function Navbar({ user, onLogout, hasAlert }) {
    return (
        <nav className="navbar">
            <div className="navbar-content">
                {/* Branding Section */}
                <div className="navbar-brand">
                    <div className="brand-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M12 2L3 6V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V6L12 2Z" strokeWidth="2" />
                            <path d="M9 12L11 14L15 10" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div className="brand-text">
                        <h2>CogniSecure</h2>
                        <span className="badge badge-primary">Police Portal</span>
                    </div>
                </div>

                {/* Actions Section (Alerts, Profile, Logout) */}
                <div className="navbar-actions">
                    {/* Active Alert Indicator */}
                    {hasAlert && (
                        <div className="alert-indicator animate-pulse" title="Active Urgent Alert">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                                <path d="M12 8v4M12 16h.01" stroke="white" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                    )}

                    {/* User Profile Display */}
                    <div className="user-profile">
                        <div className="user-avatar">
                            {user?.name?.charAt(0) || 'O'}
                        </div>
                        <div className="user-info">
                            <span className="user-name">{user?.name || 'Officer'}</span>
                            <span className="user-badge">{user?.badge || 'Unknown'}</span>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button onClick={onLogout} className="btn btn-ghost btn-sm">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Logout
                    </button>
                </div>
            </div>

            {/* Component-scoped styles */}
            <style>{`
        .navbar {
          background: var(--color-bg-glass);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--color-border);
          position: sticky;
          top: 0;
          z-index: var(--z-dropdown);
        }

        .navbar-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-md) var(--space-xl);
          max-width: 1600px;
          margin: 0 auto;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .brand-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: var(--glow-primary);
        }

        .brand-text h2 {
          font-size: 1.25rem;
          margin-bottom: var(--space-xs);
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: var(--space-lg);
        }

        .alert-indicator {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--color-alert), #cc0052);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: var(--glow-alert);
          animation: alertPulse 2s ease-in-out infinite;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-sm) var(--space-md);
          background: var(--color-bg-glass-light);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.125rem;
          color: white;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .user-badge {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        @media (max-width: 768px) {
          .navbar-content {
            padding: var(--space-md);
          }

          .brand-text h2 {
            font-size: 1rem;
          }

          .user-info {
            display: none;
          }
        }
      `}</style>
        </nav>
    );
}
