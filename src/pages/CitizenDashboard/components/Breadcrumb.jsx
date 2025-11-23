// Breadcrumb Component
import './Breadcrumb.css';

/**
 * Breadcrumb navigation
 * @param {string[]} items - array of breadcrumb labels
 */
export const Breadcrumb = ({ items }) => (
    <nav className="breadcrumb">
        {items.map((item, idx) => (
            <span key={idx} className="breadcrumb-item">
                {item}
                {idx < items.length - 1 && <span className="separator">/</span>}
            </span>
        ))}
    </nav>
);
