import React from 'react';
import './Header.css';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const username = localStorage.getItem('username') || 'Admin';

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-section">
          <h1 className="company-name">Modern Car Sale</h1>
          <p className="company-subtitle">Advanced Accounting System</p>
          <p className="powered-by">Powered by NextWave Tech Labs</p>
        </div>
        
        <nav className="nav-menu">
          <button 
            className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => onTabChange('overview')}
          >
            Dashboard
          </button>
          <button 
            className={`nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => onTabChange('orders')}
          >
            Vehicle Orders
          </button>
          <button 
            className={`nav-btn ${activeTab === 'customer_bookings' ? 'active' : ''}`}
            onClick={() => onTabChange('customer_bookings')}
          >
            Customer Bookings
          </button>
          <button 
            className={`nav-btn ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => onTabChange('inventory')}
          >
            Inventory
          </button>
          <button 
            className={`nav-btn ${activeTab === 'billing' ? 'active' : ''}`}
            onClick={() => onTabChange('billing')}
          >
            Billing & POS
          </button>
          <button 
            className={`nav-btn ${activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => onTabChange('expenses')}
          >
            Expenses
          </button>
      <button 
        className={`nav-btn ${activeTab === 'reports' ? 'active' : ''}`}
        onClick={() => onTabChange('reports')}
      >
        Reports
      </button>
        </nav>
        
        <div className="header-actions">
          <div className="user-menu-container">
            <div 
              className="user-info" 
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{ cursor: 'pointer' }}
            >
              <span className="user-name">{username}</span>
              <div className="user-avatar">{username.charAt(0).toUpperCase()}</div>
              <span className="dropdown-arrow">{showUserMenu ? '▲' : '▼'}</span>
            </div>
            
            {showUserMenu && onLogout && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-user-avatar">{username.charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="dropdown-username">{username}</div>
                    <div className="dropdown-role">Administrator</div>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={() => {
                  setShowUserMenu(false);
                  onTabChange('profile');
                }}>
                  <span className="dropdown-icon">👤</span>
                  Profile
                </button>
                <button className="dropdown-item" onClick={() => {
                  setShowUserMenu(false);
                  onTabChange('settings');
                }}>
                  <span className="dropdown-icon">⚙️</span>
                  Settings
                </button>
                <button className="dropdown-item" onClick={() => {
                  setShowUserMenu(false);
                  onTabChange('change-password');
                }}>
                  <span className="dropdown-icon">🔑</span>
                  Change Password
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout-item" onClick={() => {
                  setShowUserMenu(false);
                  if (onLogout) onLogout();
                }}>
                  <span className="dropdown-icon">🚪</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
