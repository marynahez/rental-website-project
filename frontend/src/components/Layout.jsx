import { useState, useEffect } from 'react';
import { getUsers } from '../api';
import Dashboard from './Dashboard';
import Properties from './Properties';
import Listings from './Listings';
import Appointments from './Appointments';
import Leases from './Leases';
import Payments from './Payments';
import Requests from './Requests';

const NAV = {
  PropertyManager: [
    { key: 'dashboard',    label: 'Dashboard',    icon: '📊' },
    { key: 'properties',   label: 'Properties',   icon: '🏘️' },
    { key: 'listings',     label: 'Listings',     icon: '📋' },
    { key: 'appointments', label: 'Appointments', icon: '📅' },
    { key: 'leases',       label: 'Leases',       icon: '📝' },
    { key: 'payments',     label: 'Payments',     icon: '💳' },
    { key: 'requests',     label: 'Requests',     icon: '🔧' },
  ],
  Tenant: [
    { key: 'dashboard', label: 'Dashboard',   icon: '📊' },
    { key: 'leases',    label: 'My Lease',    icon: '📝' },
    { key: 'payments',  label: 'Payments',    icon: '💳' },
    { key: 'requests',  label: 'My Requests', icon: '🔧' },
  ],
  ProspectiveRenter: [
    { key: 'dashboard',    label: 'Dashboard',       icon: '📊' },
    { key: 'listings',     label: 'Browse Listings', icon: '🔍' },
    { key: 'appointments', label: 'My Appointments', icon: '📅' },
  ],
};

const ROLE_COLORS = {
  PropertyManager: '#7c6ef5',
  Tenant: '#34d399',
  ProspectiveRenter: '#60a5fa',
};

const ROLE_LABELS = {
  PropertyManager: 'Property Manager',
  Tenant: 'Tenant',
  ProspectiveRenter: 'Prospective Renter',
};

const ROLE_ICONS = {
  PropertyManager: '🏢',
  Tenant: '🏠',
  ProspectiveRenter: '🔍',
};

export default function Layout({ user, onLogout }) {
  const [page, setPage] = useState('dashboard');
  const [allUsers, setAllUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  useEffect(() => {
    getUsers()
      .then(r => {
        setAllUsers(r.data.results ?? r.data);
      })
      .catch(() => {
        setAllUsers([]);
      });
  }, []);

  const matchedUsers = allUsers.filter(
    u =>
      u.first_name?.trim().toLowerCase() === currentUser.first_name?.trim().toLowerCase() &&
      u.last_name?.trim().toLowerCase() === currentUser.last_name?.trim().toLowerCase()
  );

  const availableRoles = [...new Set(matchedUsers.map(u => u.user_type))];

  const activeRole = currentUser.user_type;
  const color = ROLE_COLORS[activeRole] || '#7c6ef5';
  const navItems = NAV[activeRole] || [];

  const switchRole = (role) => {
    const matched = matchedUsers.find(u => u.user_type === role);
    if (!matched) return;
    setCurrentUser(matched);
    setPage('dashboard');
  };

  const effectiveUser = currentUser;

  const renderPage = () => {
    const props = { user: effectiveUser, navigate: setPage };

    switch (page) {
      case 'dashboard':    return <Dashboard {...props} />;
      case 'properties':   return <Properties {...props} />;
      case 'listings':     return <Listings {...props} />;
      case 'appointments': return <Appointments {...props} />;
      case 'leases':       return <Leases {...props} />;
      case 'payments':     return <Payments {...props} />;
      case 'requests':     return <Requests {...props} />;
      default:             return <Dashboard {...props} />;
    }
  };

  return (
    <div className="app">
      <nav className="sidebar">
        <div className="sidebar-logo">
          <h1>RentCA</h1>
          <p>Rent and lease with ease</p>
        </div>

        <div className="sidebar-user">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                flexShrink: 0,
                transition: 'background 0.2s',
              }}
            >
              {effectiveUser.first_name[0]}{effectiveUser.last_name[0]}
            </div>

            <div>
              <div className="name">
                {effectiveUser.first_name} {effectiveUser.last_name}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color,
                  fontWeight: 600,
                  marginTop: 1,
                  transition: 'color 0.2s',
                }}
              >
                {ROLE_ICONS[activeRole]} {ROLE_LABELS[activeRole]}
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: 10,
              color: 'var(--txt2)',
              paddingTop: 6,
              borderTop: '1px solid var(--border)',
            }}
          >
            <div>{user.email}</div>
            <div style={{ marginTop: 4, opacity: 0.7 }}>
              ID: {effectiveUser.user_id}
            </div>
          </div>
        </div>

        <div style={{ padding: '0 12px', marginBottom: 6 }}>
          <div className="nav-label">Active Role</div>

          {availableRoles.map(role => {
            const c = ROLE_COLORS[role];
            const isActive = role === activeRole;

            return (
              <div
                key={role}
                onClick={() => switchRole(role)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 10px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  marginBottom: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  border: `1px solid ${isActive ? c : 'transparent'}`,
                  background: isActive ? `${c}18` : 'transparent',
                  color: isActive ? c : 'var(--txt2)',
                  transition: 'all 0.15s',
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: isActive ? c : 'var(--border)',
                    flexShrink: 0,
                    transition: 'background 0.15s',
                  }}
                />
                {ROLE_ICONS[role]} {ROLE_LABELS[role]}
                {isActive && (
                  <span style={{ marginLeft: 'auto', fontSize: 10, opacity: 0.7 }}>
                    active
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="nav-section">
          <div className="nav-label">Navigation</div>
          {navItems.map(item => (
            <div
              key={item.key}
              className={`nav-item${page === item.key ? ' active' : ''}`}
              onClick={() => setPage(item.key)}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>

        <button className="logout-btn" onClick={onLogout}>
          ← Sign Out
        </button>
      </nav>

      <main className="main fade-up" key={`${effectiveUser.user_id}-${page}`}>
        {renderPage()}
      </main>
    </div>
  );
}