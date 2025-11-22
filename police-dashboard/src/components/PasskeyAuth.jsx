import { useState } from 'react';

export default function PasskeyAuth({ onSuccess, isLoading, mode = 'login' }) {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    badgeNumber: '',
    department: ''
  });
  const [authStep, setAuthStep] = useState('form'); // 'form' or 'authenticating'

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === 'login' && !formData.username.trim()) return;
    if (mode === 'signup' && (!formData.username.trim() || !formData.fullName.trim() || !formData.badgeNumber.trim())) return;

    setAuthStep('authenticating');

    // Simulate WebAuthn passkey authentication/registration
    // In production, this would use navigator.credentials.get() for login
    // and navigator.credentials.create() for signup
    setTimeout(() => {
      onSuccess({
        id: '12345',
        name: mode === 'signup' ? formData.fullName : formData.username,
        role: 'officer',
        badge: mode === 'signup' ? formData.badgeNumber : 'PO-' + Math.floor(Math.random() * 10000),
        department: formData.department || 'Metropolitan Police'
      });
    }, 1500);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="passkey-auth">
      {authStep === 'form' ? (
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' ? (
            <>
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  id="fullName"
                  type="text"
                  className="input"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="badgeNumber">Badge Number *</label>
                <input
                  id="badgeNumber"
                  type="text"
                  className="input"
                  placeholder="PO-XXXX"
                  value={formData.badgeNumber}
                  onChange={(e) => handleInputChange('badgeNumber', e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="department">Department</label>
                <input
                  id="department"
                  type="text"
                  className="input"
                  placeholder="e.g., Metropolitan Police"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="username">Username *</label>
                <input
                  id="username"
                  type="text"
                  className="input"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg w-full"
                disabled={!formData.username.trim() || !formData.fullName.trim() || !formData.badgeNumber.trim() || isLoading}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Register Passkey
              </button>

              <div className="auth-info">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <line x1="12" y1="16" x2="12" y2="12" strokeWidth="2" />
                  <line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="2" />
                </svg>
                <span>You'll register a passkey using your fingerprint, face ID, YubiKey, or other security key</span>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="username">Officer ID or Username</label>
                <input
                  id="username"
                  type="text"
                  className="input"
                  placeholder="Enter your ID"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg w-full"
                disabled={!formData.username.trim() || isLoading}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Continue with Passkey
              </button>

              <div className="auth-info">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <line x1="12" y1="16" x2="12" y2="12" strokeWidth="2" />
                  <line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="2" />
                </svg>
                <span>You'll authenticate using your fingerprint, face ID, YubiKey, or other registered passkey</span>
              </div>
            </>
          )}
        </form>
      ) : (
        <div className="authenticating-state">
          <div className="auth-spinner">
            <div className="spinner"></div>
          </div>
          <h3>{mode === 'signup' ? 'Registering Passkey...' : 'Authenticating...'}</h3>
          <p className="text-muted">
            {mode === 'signup'
              ? 'Please use your security key to complete registration'
              : 'Please use your passkey to authenticate'}
          </p>

          <div className="passkey-prompt glass-card">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-primary">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="passkey-options">
              <div className="passkey-option">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" strokeWidth="2" />
                </svg>
                <span>Fingerprint</span>
              </div>
              <div className="passkey-option">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 2a5 5 0 00-5 5c0 1.5.5 2.5 1 3l-1 7h10l-1-7c.5-.5 1-1.5 1-3a5 5 0 00-5-5z" strokeWidth="2" />
                </svg>
                <span>YubiKey</span>
              </div>
              <div className="passkey-option">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" strokeWidth="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>Phone</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .passkey-auth {
          min-height: 300px;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .form-group label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-secondary);
        }

        .auth-info {
          display: flex;
          align-items: flex-start;
          gap: var(--space-sm);
          padding: var(--space-md);
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: var(--radius-md);
          color: var(--color-primary);
          font-size: 0.75rem;
          line-height: 1.5;
        }

        .auth-info svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .authenticating-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-lg);
          padding: var(--space-xl) 0;
          text-align: center;
        }

        .auth-spinner {
          position: relative;
        }

        .passkey-prompt {
          padding: var(--space-xl);
          text-align: center;
          margin-top: var(--space-lg);
          width: 100%;
        }

        .passkey-prompt > svg {
          margin: 0 auto var(--space-lg);
          animation: pulse 2s ease-in-out infinite;
        }

        .passkey-options {
          display: flex;
          justify-content: center;
          gap: var(--space-lg);
          margin-top: var(--space-lg);
        }

        .passkey-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md);
          background: var(--color-bg-glass-light);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          transition: all var(--transition-base);
        }

        .passkey-option:hover {
          border-color: var(--color-primary);
          transform: translateY(-2px);
        }

        .passkey-option svg {
          color: var(--color-primary);
        }

        .passkey-option span {
          font-size: 0.75rem;
          color: var(--color-text-secondary);
        }
      `}</style>
    </div>
  );
}
