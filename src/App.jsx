import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CitizenDashboard from './pages/CitizenDashboard/CitizenDashboard';
import PoliceDashboard from './pages/PoliceDashboard/PoliceDashboard';

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Route: Citizen Dashboard */}
                <Route path="/" element={<CitizenDashboard />} />

                {/* Secure Route: Police Dashboard */}
                <Route path="/police" element={<PoliceDashboard />} />
            </Routes>
        </Router>
    );
}

export default App;
