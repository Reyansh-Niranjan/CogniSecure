# Citizen Dashboard

The Citizen Dashboard is the public-facing component of the CogniSecure platform. It provides citizens with real-time information about safety, crime updates, and community statistics.

## Features

### 📰 Live Updates Feed
- **Categorized Updates**: Filter updates by Crime, Database, or Website categories.
- **Priority Indicators**: Visual cues for High, Medium, and Low priority updates.
- **Real-time Data**: Fetches updates directly from the Firebase backend (simulated/cached for performance).

### 📊 Safety Statistics
- **Visual Metrics**: Displays key safety indicators like "Crimes Prevented", "Active Officers", and "Community Safety Score".
- **Interactive Cards**: Glassmorphism design for a modern, engaging user experience.

### 🔔 System Status
- **Live Status Indicator**: Shows the current operational status of the surveillance system.

## Component Structure

- **`CitizenDashboard.jsx`**: Main page component handling layout and state.
- **`components/Header.jsx`**: Top navigation and branding.
- **`components/UpdateCard.jsx`**: Reusable component for displaying individual updates.
- **`CitizenDashboard.css`**: Scoped styles for the dashboard.

## Integration Details

The dashboard connects to Firebase Firestore to retrieve the `updates` collection. It uses a real-time listener to ensure citizens always see the latest information without refreshing.

```javascript
// Example Data Structure
{
  id: "update_001",
  type: "crime",
  title: "Suspicious Activity Reported",
  description: "Reports of suspicious vehicle in Sector 7.",
  timestamp: "2023-10-27T10:30:00Z",
  priority: "high"
}
```
