# Police Dashboard

The Police Dashboard is a secure, high-performance portal designed for law enforcement officers. It provides advanced tools for surveillance, incident management, and rapid response.

## Features

### 🔐 Advanced Authentication
- **Passkey Support**: Secure login using WebAuthn standards (simulated).
- **Face Scan Auth**: Biometric verification using the device camera.
- **Role-Based Access**: Ensures only authorized personnel can access sensitive data.

### 🚨 Notify Mode (Urgent Alerts)
- **Full-Screen Overlay**: Takes over the interface for critical alerts (e.g., Weapon Detected).
- **Live Media Feed**: Displays real-time video or snapshots of the incident.
- **Quick Actions**: One-click buttons to Dispatch Units, Mark as Investigating, or Escalate.

### 🤖 AI Assistant
- **Interactive Chat**: Officers can query the system using natural language.
- **Context Aware**: The AI understands the context of recent incidents.
- **Security Restrictions**: Simulates access control levels for sensitive information.

### 📊 Command Center
- **Real-time Analytics**: View active alerts, response times, and incident counts.
- **Incident List**: Filterable list of recent activities.
- **Sidebar Navigation**: Quick access to Overview, Incidents, Analytics, and Settings.

## Component Structure

- **`PoliceDashboard.jsx`**: Main secure container and layout manager.
- **`components/LoginPage.jsx`**: Handles authentication flows.
- **`components/PasskeyAuth.jsx`**: Passkey login simulation.
- **`components/FaceScanAuth.jsx`**: Camera-based biometric login.
- **`components/Dashboard.jsx`**: Main view with stats and lists.
- **`components/NotifyMode.jsx`**: Critical alert overlay.
- **`components/AIAssistant.jsx`**: Floating AI chat interface.
- **`components/Navbar.jsx`**: Top bar with user profile and status.

## Security & Privacy

- **Data Encryption**: All sensitive data is encrypted in transit and at rest via Firebase.
- **Audit Logging**: All officer actions (login, dispatch, query) are logged for accountability.
- **Local Processing**: Face scan data is processed locally in the browser (simulation) to ensure privacy.
