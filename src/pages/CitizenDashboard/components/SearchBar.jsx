// ============================================
// SEARCH BAR COMPONENT - CITIZEN DASHBOARD
// ============================================

import './SearchBar.css';

/**
 * SearchBar Component
 * Search input for filtering updates
 * 
 * Props:
 * @param {string} value - Current search value
 * @param {function} onChange - Callback when search value changes
 */
const SearchBar = ({ value, onChange }) => {
    return (
        <div className="search-bar">
            <div className="search-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z" stroke="currentColor" strokeWidth="2" />
                    <path d="M19 19L14.65 14.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </div>
            <input
                type="text"
                className="search-input"
                placeholder="Search updates..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            {value && (
                <button
                    className="search-clear"
                    onClick={() => onChange('')}
                    aria-label="Clear search"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default SearchBar;
