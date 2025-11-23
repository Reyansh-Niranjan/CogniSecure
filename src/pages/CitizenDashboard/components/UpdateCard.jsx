// ============================================
// UPDATE CARD COMPONENT - CITIZEN DASHBOARD
// ============================================

import './UpdateCard.css';

/**
 * UpdateCard Component
 * Renders an individual update card with category-specific styling
 * 
 * Props:
 * @param {string} type - Category of update ('crime_alert', 'database', 'website')
 * @param {string} title - Headline of the update
 * @param {string} description - Full text content of the update
 * @param {Date|string} timestamp - When the update was posted
 * @param {string} priority - Importance level ('low', 'medium', 'high')
 */
const UpdateCard = ({ type, title, description, timestamp, priority = 'medium' }) => {

    // Helper function to get category configuration
    const getCategoryConfig = (type) => {
        const configs = {
            crime_alert: {
                label: 'Crime Alert',
                className: 'crime'
            },
            database: {
                label: 'Database Update',
                className: 'database'
            },
            website: {
                label: 'Website Update',
                className: 'website'
            }
        };
        return configs[type] || configs.database;
    };

    const config = getCategoryConfig(type);

    // Format timestamp to relative time
    const formatTimestamp = (timestamp) => {
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
            {/* Card Header */}
            <div className="card-header">
                <span className={`category-badge ${config.className}`}>
                    {config.label}
                </span>
                <span className="timestamp">{formatTimestamp(timestamp)}</span>
            </div>

            {/* Card Body */}
            <div className="card-content">
                <h3 className="card-title">{title}</h3>
                <p className="card-description">{description}</p>
            </div>

            {/* High Priority Indicator */}
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
