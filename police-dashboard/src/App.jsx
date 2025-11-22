import { useState } from 'react';
import LoginPage from './components/LoginPage';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import NotifyMode from './components/NotifyMode';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [notifyMode, setNotifyMode] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setNotifyMode(false);
    setCurrentAlert(null);
  };

  const handleTriggerNotify = () => {
    // Mock alert data
    const mockAlert = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      recordedAt: new Date(Date.now() - 2000).toISOString(),
      location: 'Sector 5, Main Boulevard',
      type: 'Suspicious Activity Detected',
      status: 'urgent',
      delay: '2.0s',
      description: 'Motion detected with unidentified individual. Object left behind in restricted area. Immediate investigation recommended.',
      videoUrl: '#',
      photoUrl: '#'
    };

    setCurrentAlert(mockAlert);
    setNotifyMode(true);
  };

  const handleDismissNotify = () => {
    setNotifyMode(false);
    setCurrentAlert(null);
  };

  return (
    <div className="app">
      {!isAuthenticated ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <>
          <Navbar
            user={user}
            onLogout={handleLogout}
            hasAlert={notifyMode}
          />
          <Dashboard
            user={user}
            onTriggerNotify={handleTriggerNotify}
          />
          {notifyMode && currentAlert && (
            <NotifyMode
              alert={currentAlert}
              onDismiss={handleDismissNotify}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
