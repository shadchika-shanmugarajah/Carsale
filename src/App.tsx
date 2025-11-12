import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import Login from './components/Login';
import ChangePassword from './components/ChangePassword';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showSplash, setShowSplash] = useState(true);
  // Check if user has a valid auth token
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Update browser tab title and handle splash screen
  useEffect(() => {
    document.title = 'Modern Car Sale - Advanced Accounting System';
    
    // Show splash screen for 3 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const isLogged = localStorage.getItem('isLoggedIn');
      
      console.log('Checking auth - Token exists:', !!token, 'isLoggedIn:', isLogged);
      
      if (token && isLogged === 'true') {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
      setIsCheckingAuth(false);
    };
    
    checkAuth();
  }, []);

  const handleLogin = () => {
    console.log('Login successful, setting isLoggedIn to true');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    setActiveTab('overview');
  };

  if (showSplash || isCheckingAuth) {
    return (
      <div className="splash-screen">
        <div className="splash-content">
          <div className="splash-logo">
            <div className="nextwave-logo">
              <span className="sw-text">SW</span>
              <div className="tech-circuits">
                <div className="circuit-line"></div>
                <div className="circuit-line"></div>
                <div className="circuit-line"></div>
              </div>
            </div>
            <h1 className="splash-company-name">NextWave Tech Labs</h1>
            <p className="splash-tagline">Innovative Software Solutions</p>
          </div>
          <div className="splash-loading">
            <div className="loading-bar">
              <div className="loading-progress"></div>
            </div>
            <p>Initializing Modern Car Sale System...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  // Show change password screen
  if (activeTab === 'change-password') {
    return <ChangePassword onBack={() => setActiveTab('overview')} />;
  }

  return (
    <div className="app">
      <Header activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />
      <main className="main-content">
        <Dashboard activeTab={activeTab} onTabChange={setActiveTab} />
      </main>
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-left">
            <p>&copy; 2024 Modern Car Sale. All rights reserved.</p>
          </div>
          <div className="footer-right">
            <p className="developed-by">
              Developed by <span className="company-name">NextWave Tech Labs</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
