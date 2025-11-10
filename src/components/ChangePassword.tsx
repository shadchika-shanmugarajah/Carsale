import React, { useState } from 'react';
import { authAPI } from '../utils/api';
import './ChangePassword.css';

interface ChangePasswordProps {
  onBack: () => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ onBack }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Validation
    if (newPassword.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.changePassword(currentPassword, newPassword);
      setMessage(response.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Auto redirect after 2 seconds
      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="change-password-container">
      <div className="change-password-card">
        <div className="card-header">
          <button className="back-button" onClick={onBack}>
            ← Back
          </button>
          <h2 className="card-title">
            <span className="title-icon">🔑</span>
            Change Password
          </h2>
          <p className="card-subtitle">Update your account password</p>
        </div>

        <form onSubmit={handleSubmit} className="password-form">
          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              {error}
            </div>
          )}

          {message && (
            <div className="alert alert-success">
              <span className="alert-icon">✅</span>
              {message}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="current-password" className="form-label">
              <span className="label-icon">🔒</span>
              Current Password
            </label>
            <input
              type="password"
              id="current-password"
              className="form-input"
              placeholder="Enter your current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="new-password" className="form-label">
              <span className="label-icon">🔐</span>
              New Password
            </label>
            <input
              type="password"
              id="new-password"
              className="form-input"
              placeholder="Enter your new password (min 4 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password" className="form-label">
              <span className="label-icon">✅</span>
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirm-password"
              className="form-input"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={4}
            />
          </div>

          <div className="button-group">
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Changing...
                </>
              ) : (
                <>
                  <span>🔄</span>
                  Change Password
                </>
              )}
            </button>

            <button
              type="button"
              className="cancel-button"
              onClick={onBack}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="password-tips">
          <h4>Password Tips:</h4>
          <ul>
            <li>Use at least 4 characters (minimum)</li>
            <li>Mix letters, numbers, and symbols for better security</li>
            <li>Don't use personal information</li>
            <li>Don't reuse old passwords</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;



