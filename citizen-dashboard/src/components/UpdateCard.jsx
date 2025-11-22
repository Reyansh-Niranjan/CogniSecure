import React from 'react';
import './UpdateCard.css';

const UpdateCard = ({ type, title, description, timestamp, priority = 'medium' }) => {
    const getCategoryConfig = (type) => {
        const configs = {
            crime: {
                label: 'Crime Alert',
                gradient: 'var(--gradient-danger)',
                color: 'var(--color-accent-danger)'
            },
            database: {
                label: 'Database Update',
                gradient: 'var(--gradient-primary)',
                color: 'var(--color-accent-primary)'
            },
            website: {
                label: 'Website Update',
                gradient: 'var(--gradient-success)',
                color: 'var(--color-accent-success)'
            }
        };
        return configs[type] || configs.database;
    };

    const config = getCategoryConfig(type);

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / 60000);

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className={`update-card priority-${priority}`}>
            <div className="card-header">
                <span className="category-badge" style={{
                    background: config.gradient,
                    boxShadow: `0 4px 12px ${config.color}40`
                }}>
                    {config.label}
                </span>
                <span className="timestamp">{formatTimestamp(timestamp)}</span>
            </div>

            <div className="card-content">
                <h3 className="card-title">{title}</h3>
                <p className="card-description">{description}</p>
            </div>

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
