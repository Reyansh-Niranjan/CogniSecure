// ============================================
// UPDATE CARD COMPONENT - CITIZEN DASHBOARD
// ============================================
// This component displays a single update/alert card in the feed
// It handles different types of updates (crime, database, website) with distinct styling
// ============================================

import React from 'react';
import './UpdateCard.css';

/**
 * UpdateCard Component
 * Renders an individual update card with category-specific styling
 * 
 * Props:
 * @param {string} type - Category of update ('crime', 'database', 'website')
 * @param {string} title - Headline of the update
 * @param {string} description - Full text content of the update
 * @param {Date|string} timestamp - When the update was posted
 * @param {string} priority - Importance level ('low', 'medium', 'high')
 */
const UpdateCard = ({ type, title, description, timestamp, priority = 'medium' }) => {

    // Helper function to get styling configuration based on update type
    const getCategoryConfig = (type) => {
        const configs = {
            // Crime alerts - Red/Danger theme
            crime: {
                label: 'Crime Alert',
                gradient: 'var(--gradient-danger)',
                color: 'var(--color-accent-danger)'
            },
            // Database updates - Blue/Primary theme
            database: {
                label: 'Database Update',
                gradient: 'var(--gradient-primary)',
                color: 'var(--color-accent-primary)'
            },
            // Website announcements - Green/Success theme
            website: {
                label: 'Website Update',
                gradient: 'var(--gradient-success)',
                color: 'var(--color-accent-success)'
            }
        };
        // Default to database theme if type is unknown
        return configs[type] || configs.database;
    };

    const config = getCategoryConfig(type);

    // Format timestamp to relative time (e.g., "5m ago") or date string
    const formatTimestamp = (timestamp) => {
        // Handle both Date objects and Firestore timestamps
        const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / 60000);

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className={`update-card priority-${priority}`}>
            {/* Card Header: Category Badge and Timestamp */}
            <div className="card-header">
                <span className="category-badge" style={{
                    background: config.gradient,
                    boxShadow: `0 4px 12px ${config.color}40`
                }}>
                    {config.label}
                </span>
                <span className="timestamp">{formatTimestamp(timestamp)}</span>
            </div>

            {/* Card Body: Title and Description */}
            <div className="card-content">
                <h3 className="card-title">{title}</h3>
                <p className="card-description">{description}</p>
            </div>

            {/* High Priority Indicator - Only shown for urgent updates */}
            {priority === 'high' && (
                <div className="priority-indicator">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 2L8 10M8 13L8 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span>High Priority</span>
                </div>
            )}
        </div>
    );
};

export default UpdateCard;
