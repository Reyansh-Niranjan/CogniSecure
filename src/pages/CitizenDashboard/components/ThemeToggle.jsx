// ============================================
// THEME TOGGLE COMPONENT
// ============================================

import { useState } from 'react';
import './ThemeToggle.css';

/**
 * ThemeToggle Component
 * Toggle between light and dark mode
 */
const ThemeToggle = () => {
    const [theme, setTheme] = useState(() => {
        // Check for saved theme preference or default to 'light'
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        return savedTheme;
    });

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return (
        <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 3V1M10 19V17M17 10H19M1 10H3M15.657 4.343L17.071 2.929M2.929 17.071L4.343 15.657M15.657 15.657L17.071 17.071M2.929 2.929L4.343 4.343M14 10C14 12.2091 12.2091 14 10 14C7.79086 14 6 12.2091 6 10C6 7.79086 7.79086 6 10 6C12.2091 6 14 7.79086 14 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M17 10.5C16.8 14.5 13.5 17.8 9.5 18C5.5 18.2 2 15 2 11C2 7.5 4.5 4.5 8 3.5C8.5 3.5 8.5 4 8 4.5C6.5 6 6 8 6.5 10C7 12.5 9 14.5 11.5 15C13.5 15.5 15.5 15 17 13.5C17.5 13 18 13 18 13.5C18 14 17.5 14.5 17 14.5V10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )}
        </button>
    );
};

export default ThemeToggle;
