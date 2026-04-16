import { useState, useEffect } from 'react';
import { getUsers, createUser } from '../api';

const ROLE_META = {
  PropertyManager:   { color: '#7c6ef5', label: 'Property Manager',   icon: '🏢' },
  Tenant:            { color: '#34d399', label: 'Tenant',             icon: '🏠' },
  ProspectiveRenter: { color: '#60a5fa', label: 'Prospective Renter', icon: '🔍' },
};
const USER_TYPES = ['ProspectiveRenter', 'Tenant', 'PropertyManager'];
const FIELD = { width: '100%', height: 42, fontSize: 14, padding: '0 12px' };
const DEFAULT_PASSWORD = '1234';

const pwKey  = (email) => `pw_${email.trim().toLowerCase()}`;
const savepw  = (email, pw) => localStorage.setItem(pwKey(email), pw);
const checkpw = (email, pw) => {
  const stored = localStorage.getItem(pwKey(email));
  return stored ? pw === stored : pw === DEFAULT_PASSWORD;
};

export default function Login({ onLogin }) {
  const [users, setUsers]       = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // login form
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loginErr, setLoginErr] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // register
  const [showReg, setShowReg]   = useState(false);
  const [reg, setReg] = useState({ first_name: '', last_name: '', email: '', password: '', user_type: 'ProspectiveRenter' });
  const [showRegPw, setShowRegPw] = useState(false);
  const [regErr, setRegErr]     = useState('');
  const [registering, setRegistering] = useState(false);

  const loadUsers = () =>
    getUsers().then(r => { setUsers(r.data.results ?? r.data); setStatsLoading(false); });

  useEffect(() => { loadUsers(); }, []);

  // counts
  const total   = users.length;
  const managers = users.filter(u => u.user_type === 'PropertyManager').length;
  const tenants  = users.filter(u => u.user_type === 'Tenant').length;
  const renters  = users.filter(u => u.user_type === 'ProspectiveRenter').length;

  /* ── Sign In ── always queries the API fresh so post-logout login works */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginErr('');
    setLoggingIn(true);
    try {
      const res = await getUsers({ search: email.trim() });
      const list = res.data.results ?? res.data;
      const found = list.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!found) {
        setLoginErr('No account found with that email address.');
        return;
      }
      if (!checkpw(found.email, password)) {
        setLoginErr('Incorrect password. Please try again.');
        return;
      }
      onLogin(found);
    } catch {
      setLoginErr('Connection error. Please try again.');
    } finally {
      setLoggingIn(false);
    }
  };

  /* ── Register ── */
  const setR = (k) => (e) => setReg(r => ({ ...r, [k]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegErr('');
    setRegistering(true);
    try {
      const { password: _pw, ...payload } = reg;   // don't send password to API (no auth backend)
      const res = await createUser(payload);
      savepw(reg.email, reg.password);             // store password in localStorage
      await loadUsers();
      setShowReg(false);
      setReg({ first_name: '', last_name: '', email: '', password: '', user_type: 'ProspectiveRenter' });
      onLogin(res.data);
    } catch (err) {
      const d = err.response?.data;
      setRegErr(d?.email?.[0] || d?.detail || 'Registration failed. Check your details and try again.');
    } finally { setRegistering(false); }
  };

  const meta = ROLE_META[reg.user_type];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 24,
    }}>

      {/* ── Brand ── */}
      <div className="fade-up" style={{ textAlign: 'center', marginBottom: 36 }}>
      <img
      src="/logo.png"
      alt="RentCA logo"
     style={{ width: 64, height: 64, objectFit: 'contain', marginBottom: 12 }}
      />
     <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>RentCA</h1>
      <p style={{ fontSize: 13, color: 'var(--txt2)' }}>Rent and lease with ease</p>
    </div>

      {/* ── Stats bar ── */}
      <div className="fade-up" style={{
        display: 'flex', gap: 0, marginBottom: 32,
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 12, overflow: 'hidden',
        fontSize: 12, color: 'var(--txt2)',
      }}>
        {statsLoading ? (
          <div style={{ padding: '10px 20px' }}>Loading…</div>
        ) : (
          <>
            <div style={{ padding: '10px 18px', borderRight: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--txt)', fontWeight: 700, fontSize: 15 }}>{total}</span>
              &nbsp;registered users
            </div>
            <div style={{ padding: '10px 18px', borderRight: '1px solid var(--border)' }}>
              <span style={{ color: '#7c6ef5', fontWeight: 700 }}>{managers}</span>
              &nbsp;🏢 Property Managers
            </div>
            <div style={{ padding: '10px 18px', borderRight: '1px solid var(--border)' }}>
              <span style={{ color: '#34d399', fontWeight: 700 }}>{tenants}</span>
              &nbsp;🏠 Tenants
            </div>
            <div style={{ padding: '10px 18px' }}>
              <span style={{ color: '#60a5fa', fontWeight: 700 }}>{renters}</span>
              &nbsp;🔍 Prospective Renters
            </div>
          </>
        )}
      </div>

      {/* ── Login card ── */}
      {!showReg ? (
        <div className="card fade-up" style={{ width: '100%', maxWidth: 380, margin: 0 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Sign In</div>
            <div style={{ fontSize: 12, color: 'var(--txt2)' }}>Enter your email and password to access your account.</div>
          </div>

          {loginErr && (
            <div style={{
              background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 16,
              color: 'var(--red)', fontSize: 13,
            }}>
              ⚠ {loginErr}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="text"
                value={email}
                onChange={e => { setEmail(e.target.value); setLoginErr(''); }}
                placeholder="your.email@example.ca"
                style={FIELD}
                autoComplete="email"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setLoginErr(''); }}
                  placeholder="••••••••"
                  style={{ ...FIELD, paddingRight: 44 }}
                  autoComplete="current-password"
                  required
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--txt2)', cursor: 'pointer', fontSize: 11, fontWeight: 600, letterSpacing: '0.3px', fontFamily: 'inherit' }}>
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loggingIn}
              style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: 4, fontSize: 14 }}
            >
              {loggingIn ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <div style={{ marginTop: 18, textAlign: 'center', fontSize: 13, color: 'var(--txt2)' }}>
            Don't have an account?&nbsp;
            <span
              style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => { setShowReg(true); setLoginErr(''); }}
            >
              Register
            </span>
          </div>
        </div>

      ) : (

        /* ── Register card ── */
        <div className="card fade-up" style={{ width: '100%', maxWidth: 420, margin: 0 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Create Account</div>
            <div style={{ fontSize: 12, color: 'var(--txt2)' }}>Fill in your details to register.</div>
          </div>

          {regErr && (
            <div style={{
              background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 16,
              color: 'var(--red)', fontSize: 13,
            }}>
              ⚠ {regErr}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input type="text" value={reg.first_name} onChange={setR('first_name')} placeholder="Jane" style={FIELD} required />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" value={reg.last_name} onChange={setR('last_name')} placeholder="Smith" style={FIELD} required />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="text" value={reg.email} onChange={setR('email')} placeholder="jane.smith@example.ca" style={FIELD} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showRegPw ? 'text' : 'password'} value={reg.password} onChange={setR('password')} placeholder="••••••••" style={{ ...FIELD, paddingRight: 44 }} required />
                <button type="button" onClick={() => setShowRegPw(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--txt2)', cursor: 'pointer', fontSize: 11, fontWeight: 600, letterSpacing: '0.3px', fontFamily: 'inherit' }}>
                  {showRegPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={reg.user_type} onChange={setR('user_type')} style={FIELD}>
                {USER_TYPES.map(t => (
                  <option key={t} value={t}>{ROLE_META[t].label}</option>
                ))}
              </select>
              <div style={{ marginTop: 8 }}>
                <span className="badge" style={{ background: `${meta.color}22`, color: meta.color }}>
                  {meta.icon} {meta.label}
                </span>
              </div>
            </div>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={registering}
              style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: 14 }}
            >
              {registering ? 'Creating account…' : '✓ Register & Sign In'}
            </button>
          </form>

          <div style={{ marginTop: 18, textAlign: 'center', fontSize: 13, color: 'var(--txt2)' }}>
            Already have an account?&nbsp;
            <span
              style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => { setShowReg(false); setRegErr(''); }}
            >
              Sign In
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
