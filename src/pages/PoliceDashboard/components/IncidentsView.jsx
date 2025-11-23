// ============================================
// INCIDENTS VIEW COMPONENT
// ============================================
// Displays and manages all incidents with filtering and search
// ============================================

import { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { getIncidentsWithFallback } from '../utils/mockData';

/**
 * IncidentsView Component
 * Comprehensive incident management interface
 */
export default function IncidentsView() {
    const [incidents, setIncidents] = useState([]);
    const [filteredIncidents, setFilteredIncidents] = useState([]);
    const [isMockData, setIsMockData] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const loadIncidents = async () => {
        setIsLoading(true);
        const { data, isMock } = await getIncidentsWithFallback(db);
        setIncidents(data);
        setFilteredIncidents(data);
        setIsMockData(isMock);
        setIsLoading(false);
    };

    useEffect(() => {
        loadIncidents();
    }, []);

    // Filter and search logic
    useEffect(() => {
        let filtered = incidents;

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(inc => inc.status === filterStatus);
        }

        // Search by location or type
        if (searchQuery) {
            filtered = filtered.filter(inc =>
                inc.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                inc.type.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredIncidents(filtered);
    }, [filterStatus, searchQuery, incidents]);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#6b7280';
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'resolved': return 'badge-success';
            case 'reviewing': return 'badge-warning';
            case 'active': return 'badge-primary';
            default: return 'badge-secondary';
        }
    };

    return (
        <div className="incidents-view">
            {/* Header with Mock Data Indicator */}
            <div className="view-header">
                <div>
                    <h2>Incident Management</h2>
                    <p className="text-muted">Monitor and manage all reported incidents</p>
                </div>
                {isMockData && (
                    <div className="mock-indicator">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" strokeWidth="2" />
                            <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
                            <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
                        </svg>
                        Using Mock Data
                    </div>
                )}
            </div>

            {/* Filters and Search */}
            <div className="controls-bar glass-card">
                <div className="search-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="11" cy="11" r="8" strokeWidth="2" />
                        <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by location or type..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('all')}
                    >
                        All
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('active')}
                    >
                        Active
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'reviewing' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('reviewing')}
                    >
                        Reviewing
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'resolved' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('resolved')}
                    >
                        Resolved
                    </button>
                </div>
            </div>

            {/* Incidents Grid */}
            {isLoading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading incidents...</p>
                </div>
            ) : (
                <div className="incidents-grid">
                    {filteredIncidents.length === 0 ? (
                        <div className="empty-state glass-card">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
                                <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
                            </svg>
                            <h3>No incidents found</h3>
                            <p>Try adjusting your filters or search query</p>
                        </div>
                    ) : (
                        filteredIncidents.map(incident => (
                            <div key={incident.id} className="incident-card glass-card">
                                <div className="incident-card-header">
                                    <div className="incident-title">
                                        <div
                                            className="priority-indicator"
                                            style={{ backgroundColor: getPriorityColor(incident.priority) }}
                                        />
                                        <h4>{incident.type}</h4>
                                    </div>
                                    <span className={`badge ${getStatusBadgeClass(incident.status)}`}>
                                        {incident.status}
                                    </span>
                                </div>

                                <div className="incident-card-body">
                                    <div className="incident-info">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeWidth="2" />
                                            <circle cx="12" cy="10" r="3" strokeWidth="2" />
                                        </svg>
                                        <span>{incident.location}</span>
                                    </div>

                                    <div className="incident-info">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                            <polyline points="12 6 12 12 16 14" strokeWidth="2" />
                                        </svg>
                                        <span>{new Date(incident.timestamp).toLocaleString()}</span>
                                    </div>

                                    <div className="incident-info">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" />
                                            <circle cx="12" cy="7" r="4" strokeWidth="2" />
                                        </svg>
                                        <span>{incident.assignedOfficer}</span>
                                    </div>

                                    <p className="incident-description">{incident.description}</p>
                                </div>

                                <div className="incident-card-footer">
                                    <span className="delay-badge">Delay: {incident.delay}</span>
                                    <button className="btn btn-primary btn-sm">View Details</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Component Styles */}
            <style>{`
        .incidents-view {
          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
        }

        .view-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .view-header h2 {
          margin-bottom: var(--space-xs);
        }

        .mock-indicator {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md);
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid var(--color-warning);
          border-radius: var(--radius-md);
          color: var(--color-warning);
          font-size: 0.875rem;
        }

        .controls-bar {
          display: flex;
          gap: var(--space-lg);
          padding: var(--space-lg);
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          min-width: 300px;
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md);
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
        }

        .search-box input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--color-text-primary);
          font-family: inherit;
        }

        .filter-buttons {
          display: flex;
          gap: var(--space-sm);
        }

        .filter-btn {
          padding: var(--space-sm) var(--space-md);
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          font-family: inherit;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .filter-btn:hover {
          border-color: var(--color-primary);
          color: var(--color-text-primary);
        }

        .filter-btn.active {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: white;
        }

        .incidents-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: var(--space-lg);
        }

        .incident-card {
          padding: var(--space-lg);
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          transition: all var(--transition-base);
        }

        .incident-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        .incident-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .incident-title {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .priority-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .incident-title h4 {
          margin: 0;
          font-size: 1rem;
        }

        .incident-card-body {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .incident-info {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        .incident-description {
          margin-top: var(--space-sm);
          font-size: 0.875rem;
          color: var(--color-text-muted);
          line-height: 1.5;
        }

        .incident-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: var(--space-md);
          border-top: 1px solid var(--color-border);
        }

        .delay-badge {
          font-size: 0.75rem;
          padding: var(--space-xs) var(--space-sm);
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-sm);
          color: var(--color-text-muted);
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-3xl);
          gap: var(--space-lg);
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid var(--color-border);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-3xl);
          gap: var(--space-md);
          text-align: center;
        }

        .empty-state svg {
          color: var(--color-text-muted);
        }

        .empty-state h3 {
          margin: 0;
        }

        .empty-state p {
          color: var(--color-text-muted);
        }
      `}</style>
        </div>
    );
}
