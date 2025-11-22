// ============================================
// HEADER COMPONENT - CITIZEN DASHBOARD
// ============================================
// This component displays the header/navigation bar for the Citizen Dashboard
// It shows the CogniSecure branding and system status indicator
// ============================================

import React from 'react';
import './Header.css';

/**
 * Header Component
 * Displays the top navigation bar with branding and status
 * 
 * Features:
 * - Animated logo with gradient effect
 * - System status indicator with real-time pulse animation
 * - Sticky positioning for persistent visibility
 * - Responsive design for mobile devices
 */
const Header = () => {
    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    {/* Left side - Branding */}
                    <div className="branding">
                        <div className="logo-container">
                            {/* Animated logo icon with gradient */}
                            <div className="logo-icon">
                                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="20" cy="20" r="18" stroke="url(#gradient1)" strokeWidth="2.5" />
                                    <path d="M20 8L20 20L28 28" stroke="url(#gradient1)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <circle cx="20" cy="20" r="3" fill="url(#gradient1)" />
                                    <defs>
                                        <linearGradient id="gradient1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#4299E1" />
                                            <stop offset="1" stopColor="#9333EA" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>

                            {/* Application title and subtitle */}
                            <div className="logo-text">
                                <h1 className="site-title">CogniSecure</h1>
                                <p className="site-subtitle">Citizens Dashboard</p>
                            </div>
                        </div>
                    </div>

                    {/* Right side - System status indicator */}
                    <div className="status-indicator">
                        {/* Pulsing dot indicates system is active */}
                        <div className="status-dot"></div>
                        <span className="status-text">System Active</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
