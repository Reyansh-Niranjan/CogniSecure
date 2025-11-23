// ============================================
// HEADER COMPONENT - CITIZEN DASHBOARD
// ============================================
// Top header bar with title and system status
// ============================================

import React from 'react';
import ThemeToggle from './ThemeToggle';
import './Header.css';

/**
 * Header Component
 * Top navigation bar with title and mobile menu toggle
 * 
 * Props:
 * @param {function} onMenuToggle - Callback to toggle mobile sidebar
 */
export const Header = ({ onMenuToggle }) => {
    return (
        <header className="header">
            <div className="header-container">
                {/* Mobile Menu Toggle */}
                <button className="menu-toggle" onClick={onMenuToggle} aria-label="Toggle menu">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>

                {/* Page Title */}
                <h1 className="header-title">Citizens Dashboard</h1>

                {/* Right Side Controls */}
                <div className="header-controls">
                    <ThemeToggle />

                    {/* System Status Indicator */}
                    <div className="header-status">
                        <div className="status-dot-header" />
                        <span className="status-text-header">System Active</span>
                    </div>
                </div>
            </div>
        </header>
    );
};
