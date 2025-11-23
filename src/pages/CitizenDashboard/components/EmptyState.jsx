// ============================================
// EMPTY STATE COMPONENT - CITIZEN DASHBOARD
// ============================================

import React from 'react';
import './EmptyState.css';

/**
 * EmptyState Component
 * Displays when no updates match the current filters
 * 
 * Props:
 * @param {string} message - Message to display
 */
const EmptyState = ({ message = "No updates found" }) => {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    <circle cx="40" cy="40" r="38" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M40 25V40M40 50H40.02" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
            </div>
            <h3 className="empty-state-title">{message}</h3>
            <p className="empty-state-description">
                Try adjusting your filters or search terms to find what you're looking for.
            </p>
        </div>
    );
};

export default EmptyState;
