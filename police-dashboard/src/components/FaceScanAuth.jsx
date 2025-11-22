import { useState, useRef, useEffect } from 'react';

export default function FaceScanAuth({ onSuccess, isLoading }) {
    const [scanning, setScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [cameraReady, setCameraReady] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        return () => {
            // Cleanup camera stream on unmount
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setCameraReady(true);
            }
        } catch (error) {
            console.error('Camera access denied:', error);
            alert('Camera access is required for face scan authentication. Please allow camera permissions.');
        }
    };

    const handleScan = () => {
        setScanning(true);
        setScanProgress(0);

        // Simulate face scanning progress
        const interval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    // Simulate successful face recognition
                    setTimeout(() => {
                        onSuccess({
                            id: '12345',
                            name: 'Officer Smith',
                            role: 'officer',
                            badge: 'PO-' + Math.floor(Math.random() * 10000),
                            authMethod: 'facescan'
                        });
                    }, 500);
                    return 100;
                }
                return prev + 10;
            });
        }, 200);
    };

    return (
        <div className="facescan-auth">
            {!cameraReady ? (
                <div className="camera-prompt">
                    <div className="camera-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" strokeWidth="2" />
                            <circle cx="12" cy="13" r="4" strokeWidth="2" />
                        </svg>
                    </div>
                    <h3>Enable Camera Access</h3>
                    <p className="text-muted">We need access to your camera for face recognition</p>

                    <button
                        onClick={startCamera}
                        className="btn btn-primary btn-lg w-full"
                        disabled={isLoading}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" strokeWidth="2" />
                            <circle cx="12" cy="13" r="4" strokeWidth="2" />
                        </svg>
                        Enable Camera
                    </button>

                    <div className="privacy-notice">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2" />
                        </svg>
                        <span>Your face data is processed locally and never stored</span>
                    </div>
                </div>
            ) : (
                <div className="camera-view">
                    <div className="video-container">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="face-video"
                        />

                        {scanning && (
                            <div className="face-overlay">
                                <div className="face-scan-frame" style={{ opacity: scanProgress / 100 }}>
                                    <div className="corner corner-tl"></div>
                                    <div className="corner corner-tr"></div>
                                    <div className="corner corner-bl"></div>
                                    <div className="corner corner-br"></div>
                                </div>
                                <div className="scan-line" style={{ top: `${scanProgress}%` }}></div>
                            </div>
                        )}
                    </div>

                    {scanning ? (
                        <div className="scan-progress">
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${scanProgress}%` }}></div>
                            </div>
                            <p className="text-center">Scanning... {scanProgress}%</p>
                        </div>
                    ) : (
                        <div className="scan-controls">
                            <p className="text-center text-muted">Position your face in the center</p>
                            <button
                                onClick={handleScan}
                                className="btn btn-success btn-lg w-full"
                                disabled={isLoading}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2" />
                                    <circle cx="12" cy="12" r="3" strokeWidth="2" />
                                </svg>
                                Start Face Scan
                            </button>
                        </div>
                    )}
                </div>
            )}

            <style>{`
        .facescan-auth {
          min-height: 400px;
        }

        .camera-prompt {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-lg);
          padding: var(--space-xl) 0;
          text-align: center;
        }

        .camera-icon {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary);
          border: 2px solid var(--color-border);
        }

        .privacy-notice {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md);
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: var(--radius-md);
          color: var(--color-success);
          font-size: 0.75rem;
        }

        .camera-view {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .video-container {
          position: relative;
          width: 100%;
          aspect-ratio: 4/3;
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: var(--color-bg-secondary);
        }

        .face-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .face-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .face-scan-frame {
          position: relative;
          width: 60%;
          aspect-ratio: 3/4;
          transition: opacity 0.3s;
        }

        .corner {
          position: absolute;
          width: 30px;
          height: 30px;
          border: 3px solid var(--color-success);
          box-shadow: var(--glow-success);
        }

        .corner-tl { top: 0; left: 0; border-right: none; border-bottom: none; }
        .corner-tr { top: 0; right: 0; border-left: none; border-bottom: none; }
        .corner-bl { bottom: 0; left: 0; border-right: none; border-top: none; }
        .corner-br { bottom: 0; right: 0; border-left: none; border-top: none; }

        .scan-line {
          position: absolute;
          left: 20%;
          right: 20%;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--color-success), transparent);
          box-shadow: var(--glow-success);
          transition: top 0.2s linear;
        }

        .scan-controls {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .scan-progress {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--color-success), var(--color-primary));
          border-radius: var(--radius-full);
          transition: width 0.2s linear;
          box-shadow: var(--glow-success);
        }
      `}</style>
        </div>
    );
}
