// ============================================
// NOTIFY MODE COMPONENT
// ============================================
// This component handles the full-screen urgent alert overlay
// It displays real-time incident footage, details, and quick actions
// ============================================

import { useState, useEffect } from 'react';

/**
 * NotifyMode Component
 * Full-screen urgent alert interface
 * 
 * Props:
 * @param {object} alert - The alert object containing incident details
 * @param {function} onDismiss - Function to dismiss the alert
 */
export default function NotifyMode({ alert, onDismiss }) {
  // State for tracking time elapsed since alert received
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format seconds into MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="notify-mode animate-fadeIn">
      {/* Dark overlay background */}
      <div className="notify-overlay"></div>

      <div className="notify-content">
        {/* Header with Alert Status */}
        <div className="notify-header">
          <div className="alert-badge">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="M12 8v4M12 16h.01" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="alert-title">
            <h1>URGENT ALERT</h1>
            <p>Immediate Response Required</p>
          </div>
          <button onClick={onDismiss} className="btn btn-ghost">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="notify-body">
          {/* Main Panel: Media & Details */}
          <div className="notify-main-panel">
            {/* Media Viewer (Video/Stream) */}
            <div className="media-section glass-card">
              <div className="media-header">
                <h3>Incident Footage</h3>
                <div className="live-indicator">
                  <span className="live-dot"></span>
                  LIVE
                </div>
              </div>

              <div className="media-viewer">
                <video
                  controls
                  autoPlay
                  className="incident-video"
                  poster={alert.thumbnailUrl}
                >
                  <source src={alert.videoUrl} type="video/mp4" />
                  Your browser does not support video playback.
                </video>

                <div className="video-overlay">
                  <span className="timestamp-overlay">{new Date(alert.timestamp).toLocaleString()}</span>
                </div>
              </div>

              <div className="media-actions">
                <button className="btn btn-primary">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" />
                  </svg>
                  View Snapshot
                </button>
                <button className="btn btn-ghost">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth="2" />
                  </svg>
                  Download
                </button>
              </div>
            </div>

            {/* Incident Details Grid */}
            <div className="incident-details glass-card">
              <h3>Incident Details</h3>

              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Location</span>
                  <span className="detail-value">{alert.location}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Type</span>
                  <span className="detail-value">{alert.type}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Recorded At</span>
                  <span className="detail-value">{new Date(alert.recordedAt).toLocaleTimeString()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Alert Received</span>
                  <span className="detail-value">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Transmission Delay</span>
                  <span className="detail-value text-warning">{alert.delay}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Time Elapsed</span>
                  <span className="detail-value text-primary">{formatTime(timeElapsed)}</span>
                </div>
              </div>

              <div className="detail-description">
                <span className="detail-label">Description</span>
                <p>{alert.description}</p>
              </div>
            </div>
          </div>

          {/* Right Panel: Actions & Status */}
          <div className="notify-actions-panel glass-card">
            <h3>Quick Actions</h3>

            <div className="action-buttons">
              <button className="action-btn dispatch-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" strokeWidth="2" />
                </svg>
                <span>Dispatch Unit</span>
              </button>

              <button className="action-btn investigate-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2" />
                </svg>
                <span>Mark Investigating</span>
              </button>

              <button className="action-btn escalate-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeWidth="2" />
                </svg>
                <span>Escalate Priority</span>
              </button>

              <button className="action-btn false-alarm-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" />
                </svg>
                <span>False Alarm</span>
              </button>
            </div>

            <div className="notification-status">
              <h4>Notification Status</h4>
              <div className="status-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-success">
                  <path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>Alert sent to 12 officers</span>
              </div>
              <div className="status-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-success">
                  <path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>8 officers acknowledged</span>
              </div>
              <div className="status-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-warning">
                  <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" />
                </svg>
                <span>4 officers pending response</span>
              </div>
            </div>

            <button className="btn btn-danger btn-lg w-full">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Acknowledge & Dismiss
            </button>
          </div>
        </div>
      </div>

      {/* Component-scoped styles */}
      <style>{`
        .notify-mode {
          position: fixed;
          inset: 0;
          z-index: var(--z-notify);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .notify-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(10px);
        }

        .notify-content {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: auto;
        }

        .notify-header {
          display: flex;
          align-items: center;
          gap: var(--space-lg);
          padding: var(--space-xl);
          background: linear-gradient(135deg, var(--color-alert), #cc0052);
          border-bottom: 2px solid var(--color-alert);
          box-shadow: var(--glow-alert);
          animation: alertPulse 2s ease-in-out infinite;
        }

        .alert-badge {
          width: 64px;
          height: 64px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .alert-title {
          flex: 1;
        }

        .alert-title h1 {
          font-size: 2rem;
          margin-bottom: var(--space-xs);
          color: white;
          letter-spacing: 0.05em;
        }

        .alert-title p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.125rem;
        }

        .notify-body {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: var(--space-xl);
          padding: var(--space-xl);
          max-width: 1800px;
          margin: 0 auto;
        }

        .notify-main-panel {
          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
        }

        .media-section {
          padding: var(--space-xl);
        }

        .media-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-lg);
        }

        .live-indicator {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md);
          background: var(--color-danger);
          border-radius: var(--radius-full);
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .live-dot {
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .media-viewer {
          position: relative;
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: var(--color-bg-secondary);
          margin-bottom: var(--space-lg);
        }

        .incident-video {
          width: 100%;
          aspect-ratio: 16/9;
          object-fit: cover;
        }

        .video-overlay {
          position: absolute;
          bottom: var(--space-md);
          left: var(--space-md);
        }

        .timestamp-overlay {
          padding: var(--space-sm) var(--space-md);
          background: rgba(0, 0, 0, 0.8);
          border-radius: var(--radius-md);
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          font-family: monospace;
        }

        .media-actions {
          display: flex;
          gap: var(--space-md);
        }

        .incident-details {
          padding: var(--space-xl);
        }

        .incident-details h3 {
          margin-bottom: var(--space-lg);
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-lg);
          margin-bottom: var(--space-xl);
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .detail-label {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        .detail-value {
          font-size: 1.125rem;
          color: var(--color-text-primary);
          font-weight: 600;
        }

        .detail-description {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
          padding: var(--space-lg);
          background: var(--color-bg-glass-light);
          border-radius: var(--radius-md);
        }

        .detail-description p {
          color: var(--color-text-secondary);
          line-height: 1.6;
        }

        .notify-actions-panel {
          padding: var(--space-xl);
          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-lg);
          background: var(--color-bg-glass-light);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-family: inherit;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .action-btn:hover {
          transform: translateX(4px);
        }

        .dispatch-btn:hover {
          border-color: var(--color-primary);
          background: rgba(59, 130, 246, 0.1);
        }

        .investigate-btn:hover {
          border-color: var(--color-warning);
          background: rgba(245, 158, 11, 0.1);
        }

        .escalate-btn:hover {
          border-color: var(--color-danger);
          background: rgba(239, 68, 68, 0.1);
        }

        .false-alarm-btn:hover {
          border-color: var(--color-text-muted);
          background: rgba(100, 116, 139, 0.1);
        }

        .notification-status {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          padding: var(--space-lg);
          background: var(--color-bg-glass-light);
          border-radius: var(--radius-md);
        }

        .notification-status h4 {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          margin-bottom: var(--space-sm);
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        @media (max-width: 1200px) {
          .notify-body {
            grid-template-columns: 1fr;
          }

          .notify-actions-panel {
            order: -1;
          }
        }
      `}</style>
    </div>
  );
}
