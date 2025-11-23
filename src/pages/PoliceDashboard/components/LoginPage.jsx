// ============================================
// LOGIN PAGE COMPONENT
// ============================================
// This is the entry point for the Police Dashboard
// It manages the authentication flow and mode selection (Passkey vs Face Scan)
// ============================================

import { useState } from 'react';
import PasskeyAuth from './PasskeyAuth';
import FaceScanAuth from './FaceScanAuth'; // Import FaceScanAuth component
const TEST_ADMIN = { id: 'admin', name: 'Test Admin' };


/**
 * LoginPage Component
 * Handles the login interface and method selection
 * 
 * Props:
 * @param {function} onLogin - Callback when user successfully logs in
 */
export default function LoginPage({ onLogin }) {
  // State for authentication mode: 'login' or 'signup'
  const [authMode, setAuthMode] = useState('login');

  // State for loading status
  const [isLoading, setIsLoading] = useState(false);

  // State for selected method: 'passkey' or 'facescan'
  const [method, setMethod] = useState('passkey');

  // Handle successful authentication from child components
  const handleAuthSuccess = (userData) => {
    setIsLoading(true);
    // Simulate network delay for smooth transition
    setTimeout(() => {
      onLogin(userData);
    }, 1000);
  };

  return (
    <div className="login-container">
      {/* Animated background effect */}
      <div className="login-background"></div>

      <div className="login-content animate-fadeIn">
        {/* Header Section */}
        <div className="login-header">
          <div className="logo-container">
            <div className="shield-icon">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 6V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V6L12 2Z"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 12L11 14L15 10"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {process.env.NODE_ENV === 'development' && (
                <button className="test-admin-btn" onClick={() => onLogin(TEST_ADMIN)} style={{ marginTop: '1rem', padding: '0.5rem 1rem', marginLeft: '-8rem' }}>
                  Login as Test Admin
                </button>
              )}
            </div>
          </div>
          <h1>CogniSecure Police</h1>
          <p className="text-muted">Secure Access Portal</p>
        </div>

        {/* Auth Mode Selector (Login vs Signup) */}
        <div className="auth-mode-selector">
          <button
            className={`auth-mode-btn ${authMode === 'login' ? 'active' : ''}`}
            onClick={() => setAuthMode('login')}
            disabled={isLoading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" strokeWidth="2" />
            </svg>
            Login
          </button>
          <button
            className={`auth-mode-btn ${authMode === 'signup' ? 'active' : ''}`}
            onClick={() => setAuthMode('signup')}
            disabled={isLoading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeWidth="2" />
              <circle cx="8.5" cy="7" r="4" strokeWidth="2" />
              <line x1="20" y1="8" x2="20" y2="14" strokeWidth="2" strokeLinecap="round" />
              <line x1="23" y1="11" x2="17" y2="11" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Sign Up
          </button>
        </div>

        {/* Method Selector (Passkey vs Face Scan) - Only for Login */}
        {authMode === 'login' && (
          <div className="method-selector">
            <button
              className={`method-btn ${method === 'passkey' ? 'active' : ''}`}
              onClick={() => setMethod('passkey')}
            >
              Passkey / ID
            </button>
            <button
              className={`method-btn ${method === 'facescan' ? 'active' : ''}`}
              onClick={() => setMethod('facescan')}
            >
              Face Scan
            </button>
          </div>
        )}

        {/* Main Authentication Container */}
        <div className="auth-container glass-card">
          {method === 'passkey' || authMode === 'signup' ? (
            <PasskeyAuth
              onSuccess={handleAuthSuccess}
              isLoading={isLoading}
              mode={authMode}
            />
          ) : (
            <FaceScanAuth
              onSuccess={handleAuthSuccess}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Security Notice Footer */}
        <div className="security-notice">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <line x1="12" y1="16" x2="12" y2="12" strokeWidth="2" />
            <line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="2" />
          </svg>
          <span>This is a secure portal. All access attempts are logged.</span>
        </div>
      </div>

      {/* Component-scoped styles */}
      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-lg);
          position: relative;
          overflow: hidden;
        }

        .login-background {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(236, 72, 153, 0.1) 0%, transparent 50%);
          animation: backgroundShift 20s ease-in-out infinite;
        }

        @keyframes backgroundShift {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.1) rotate(5deg); }
        }

        .login-content {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 450px;
        }

        .login-header {
          text-align: center;
          margin-bottom: var(--space-2xl);
        }

        .logo-container {
          display: flex;
          justify-content: center;
          margin-bottom: var(--space-lg);
        }

        .shield-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: var(--glow-primary);
          animation: pulse 3s ease-in-out infinite;
        }

        .login-header h1 {
          margin-bottom: var(--space-sm);
          background: linear-gradient(135deg, #fff, var(--color-text-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .auth-mode-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
        }

        .auth-mode-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
          padding: var(--space-md);
          background: var(--color-bg-glass);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          font-family: inherit;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .auth-mode-btn:hover {
          border-color: var(--color-primary);
          color: var(--color-text-primary);
        }

        .auth-mode-btn.active {
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
          border-color: var(--color-primary);
          color: white;
          box-shadow: var(--glow-primary);
        }

        .auth-mode-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .method-selector {
          display: flex;
          justify-content: center;
          gap: var(--space-md);
          margin-bottom: var(--space-md);
        }

        .method-btn {
          padding: var(--space-xs) var(--space-md);
          background: transparent;
          border: none;
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all var(--transition-base);
        }

        .method-btn.active {
          color: var(--color-primary);
          border-bottom-color: var(--color-primary);
        }

        .auth-container {
          padding: var(--space-xl);
        }

        .security-notice {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
          margin-top: var(--space-lg);
          padding: var(--space-md);
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid var(--color-warning);
          border-radius: var(--radius-md);
          color: var(--color-warning);
          font-size: 0.75rem;
          text-align: center;
        }

        .security-notice svg {
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
