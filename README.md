# CogniSecure - Advanced Surveillance System

CogniSecure is a unified platform designed to bridge the gap between citizen safety and police surveillance. It integrates a public-facing Citizen Dashboard with a secure Police Portal, powered by a robust Firebase backend.

## Project Structure

This project is a monorepo-style unified application built with Vite + React.

- **`/src/pages/CitizenDashboard`**: Public dashboard for citizens to view crime updates and statistics.
- **`/src/pages/PoliceDashboard`**: Secure portal for officers to monitor incidents, view live feeds, and manage alerts.
- **`/functions`**: Firebase Cloud Functions for serverless backend logic.
- **`/src/firebase.js`**: Firebase configuration and initialization.

## Features

### 🛡️ Citizen Dashboard
- **Real-time Updates**: Live feed of crime reports and safety announcements.
- **Interactive Stats**: Visual representation of safety metrics.
- **Public Resources**: Access to database information and website updates.
- [Read more about Citizen Dashboard](./CITIZEN_DASHBOARD.md)

### 👮 Police Dashboard
- **Secure Authentication**: Multi-factor authentication using Passkeys and Face Scan simulation.
- **Live Surveillance**: Real-time monitoring of incidents.
- **Urgent Alerts**: Full-screen "Notify Mode" for critical situations.
- **AI Assistant**: Interactive AI chat for incident analysis and data retrieval.
- [Read more about Police Dashboard](./POLICE_DASHBOARD.md)

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cognisecure
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env` file (ensure it has your Firebase credentials).
   - See `.env` for required variables.

### Running the Application

1. **Start the Development Server**
   ```bash
   npm run dev
   ```
   - Access Citizen Dashboard at `http://localhost:5173/`
   - Access Police Dashboard at `http://localhost:5173/police`

2. **Start Firebase Emulators (Optional)**
   If you want to test backend functions locally:
   ```bash
   npm run emulators
   ```

## Deployment

The application is configured for deployment on Firebase Hosting.

```bash
npm run build
firebase deploy
```

## License

[MIT License](LICENSE)
