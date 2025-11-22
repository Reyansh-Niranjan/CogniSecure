import { useState } from 'react';

export default function PasskeyAuth({ onSuccess, isLoading }) {
    const [username, setUsername] = useState('');
    const [authStep, setAuthStep] = useState('username'); // 'username' or 'authenticating'

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username.trim()) return;

        setAuthStep('authenticating');

        // Simulate WebAuthn passkey authentication
        // In production, this would use navigator.credentials.get()
        setTimeout(() => {
            onSuccess({
                id: '12345',
                name: username,
                role: 'officer',
                badge: 'PO-' + Math.floor(Math.random() * 10000)
            });
        }, 1500);
    };

    return (
        <div className="passkey-auth">
            {authStep === 'username' ? (
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="username">Officer ID or Username</label>
                        <input
                            id="username"
                            type="text"
                            className="input"
                            placeholder="Enter your ID"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={isLoading}
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg w-full"
                        disabled={!username.trim() || isLoading}
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
                        <span>You'll be prompted to use your registered passkey (fingerprint, face ID, or security key)</span>
                    </div>
                </form>
            ) : (
                <div className="authenticating-state">
                    <div className="auth-spinner">
                        <div className="spinner"></div>
                    </div>
                    <h3>Authenticating...</h3>
                    <p className="text-muted">Please use your passkey to authenticate</p>

                    <div className="passkey-prompt glass-card">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-primary">
                            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p>Touch your fingerprint sensor or insert your security key</p>
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
        }

        .passkey-prompt svg {
          margin: 0 auto var(--space-md);
          animation: pulse 2s ease-in-out infinite;
        }

        .passkey-prompt p {
          color: var(--color-text-secondary);
          font-size: 0.875rem;
        }
      `}</style>
        </div>
    );
}
