import React, { useState } from 'react';
import './Login.css';
import { authAPI } from '../utils/api';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting login with username:', username);
      // Call backend API for authentication
      const response = await authAPI.login(username, password);
      console.log('Login response:', response);
      console.log('Token saved:', localStorage.getItem('authToken'));
      onLogin();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to connect to server. Make sure backend is running on https://carsale-backend-1.onrender.com/');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="car-animation">
          <div className="car">🚗</div>
        </div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="logo-circle">
            <span className="logo-icon">🚘</span>
          </div>
          <h1 className="login-title">Modern Car Sale</h1>
          <p className="login-subtitle">Advanced Accounting System</p>
          <p className="powered-text">Powered by NextWave Tech Labs</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username" className="form-label">
              <span className="label-icon">👤</span>
              Username
            </label>
            <input
              type="text"
              id="username"
              className="form-input"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <span className="label-icon">🔒</span>
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              <>
                <span>🔓</span>
                Sign In
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;


