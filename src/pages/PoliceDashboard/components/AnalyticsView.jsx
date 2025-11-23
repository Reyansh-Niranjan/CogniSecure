// ============================================
// ANALYTICS VIEW COMPONENT
// ============================================
// Displays crime analytics, trends, and statistics
// ============================================

import { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { getAnalyticsWithFallback } from '../utils/mockData';

/**
 * AnalyticsView Component
 * Comprehensive analytics dashboard
 */
export default function AnalyticsView() {
    const [analytics, setAnalytics] = useState(null);
    const [isMockData, setIsMockData] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        setIsLoading(true);
        const { data, isMock } = await getAnalyticsWithFallback(db);
        setAnalytics(data);
        setIsMockData(isMock);
        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading analytics...</p>
                <style>{`
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
        `}</style>
            </div>
        );
    }

    return (
        <div className="analytics-view">
            {/* Header */}
            <div className="view-header">
                <div>
                    <h2>Analytics Dashboard</h2>
                    <p className="text-muted">Insights and trends from incident data</p>
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

            {/* Response Time Stats */}
            <div className="stats-row">
                <div className="stat-box glass-card">
                    <div className="stat-label">Average Response</div>
                    <div className="stat-value text-primary">{analytics.responseTimeStats.average}</div>
                </div>
                <div className="stat-box glass-card">
                    <div className="stat-label">Fastest Response</div>
                    <div className="stat-value text-success">{analytics.responseTimeStats.fastest}</div>
                </div>
                <div className="stat-box glass-card">
                    <div className="stat-label">Median Response</div>
                    <div className="stat-value text-warning">{analytics.responseTimeStats.median}</div>
                </div>
                <div className="stat-box glass-card">
                    <div className="stat-label">Slowest Response</div>
                    <div className="stat-value text-danger">{analytics.responseTimeStats.slowest}</div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="charts-grid">
                {/* Incident Trends */}
                <div className="chart-card glass-card">
                    <h3>Incident Trends (Last 7 Days)</h3>
                    <div className="bar-chart">
                        {analytics.incidentTrends.map((day, index) => {
                            const maxCount = Math.max(...analytics.incidentTrends.map(d => d.count));
                            const height = (day.count / maxCount) * 100;
                            return (
                                <div key={index} className="bar-container">
                                    <div className="bar" style={{ height: `${height}%` }}>
                                        <span className="bar-value">{day.count}</span>
                                    </div>
                                    <span className="bar-label">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Crime Type Distribution */}
                <div className="chart-card glass-card">
                    <h3>Crime Type Distribution</h3>
                    <div className="distribution-list">
                        {analytics.crimeTypeDistribution.map((crime, index) => (
                            <div key={index} className="distribution-item">
                                <div className="distribution-header">
                                    <span className="crime-type">{crime.type}</span>
                                    <span className="crime-count">{crime.count} incidents</span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${crime.percentage}%`,
                                            background: `hsl(${220 - index * 30}, 70%, 55%)`
                                        }}
                                    />
                                </div>
                                <span className="percentage-label">{crime.percentage}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Geographic Data */}
                <div className="chart-card glass-card">
                    <h3>Top Locations by Incidents</h3>
                    <div className="location-list">
                        {analytics.geographicData.map((location, index) => (
                            <div key={index} className="location-item">
                                <div className="location-rank">{index + 1}</div>
                                <div className="location-details">
                                    <div className="location-name">{location.location}</div>
                                    <div className="location-bar">
                                        <div
                                            className="location-fill"
                                            style={{
                                                width: `${(location.incidents / Math.max(...analytics.geographicData.map(l => l.incidents))) * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="location-count">{location.incidents}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hourly Distribution */}
                <div className="chart-card glass-card">
                    <h3>Hourly Distribution</h3>
                    <div className="hourly-chart">
                        {analytics.hourlyDistribution.map((hour, index) => {
                            const maxCount = Math.max(...analytics.hourlyDistribution.map(h => h.count));
                            const height = (hour.count / maxCount) * 100;
                            return (
                                <div key={index} className="hour-bar">
                                    <div className="hour-fill" style={{ height: `${height}%` }}>
                                        <span className="hour-value">{hour.count}</span>
                                    </div>
                                    <span className="hour-label">{hour.hour}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Component Styles */}
            <style>{`
        .analytics-view {
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

        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-lg);
        }

        .stat-box {
          padding: var(--space-lg);
          text-align: center;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          margin-bottom: var(--space-sm);
        }

        .stat-value {
          font-size: 1.875rem;
          font-weight: 700;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: var(--space-xl);
        }

        .chart-card {
          padding: var(--space-xl);
        }

        .chart-card h3 {
          margin-bottom: var(--space-lg);
          font-size: 1.125rem;
        }

        /* Bar Chart Styles */
        .bar-chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 200px;
          gap: var(--space-sm);
        }

        .bar-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-sm);
        }

        .bar {
          width: 100%;
          background: linear-gradient(180deg, var(--color-primary), var(--color-primary-hover));
          border-radius: var(--radius-sm) var(--radius-sm) 0 0;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: var(--space-xs);
          min-height: 30px;
          transition: all var(--transition-base);
        }

        .bar:hover {
          opacity: 0.8;
        }

        .bar-value {
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
        }

        .bar-label {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        /* Distribution List Styles */
        .distribution-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .distribution-item {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .distribution-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .crime-type {
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .crime-count {
          font-size: 0.875rem;
          color: var(--color-text-muted);
        }

        .progress-bar {
          height: 8px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-sm);
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          transition: width var(--transition-base);
        }

        .percentage-label {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        /* Location List Styles */
        .location-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .location-item {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .location-rank {
          width: 32px;
          height: 32px;
          background: var(--color-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
        }

        .location-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .location-name {
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .location-bar {
          height: 6px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-sm);
          overflow: hidden;
        }

        .location-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--color-primary), var(--color-primary-hover));
          transition: width var(--transition-base);
        }

        .location-count {
          font-weight: 700;
          color: var(--color-text-primary);
          min-width: 40px;
          text-align: right;
        }

        /* Hourly Chart Styles */
        .hourly-chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 180px;
          gap: 4px;
        }

        .hour-bar {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-xs);
        }

        .hour-fill {
          width: 100%;
          background: linear-gradient(180deg, var(--color-success), var(--color-success-hover));
          border-radius: var(--radius-sm) var(--radius-sm) 0 0;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 4px;
          min-height: 20px;
          transition: all var(--transition-base);
        }

        .hour-fill:hover {
          opacity: 0.8;
        }

        .hour-value {
          font-size: 0.625rem;
          font-weight: 600;
          color: white;
        }

        .hour-label {
          font-size: 0.625rem;
          color: var(--color-text-muted);
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }

        @media (max-width: 768px) {
          .charts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
}
