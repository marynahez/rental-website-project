import { useState, useEffect } from 'react';
import { getLeases, createLease, deleteLease, getUsers, getProperties } from '../api';

const FIELD = { width: '100%', height: 42, padding: '0 12px', fontSize: 14 };

export default function Leases({ user }) {
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);

  const [form, setForm] = useState({
    user: '',
    property: '',
    start_date: '',
    end_date: '',
    security_deposit: '',
    monthly_rent: '',
  });

  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [createErr, setCreateErr] = useState('');

  const isManager = user?.user_type === 'PropertyManager';

  const loadLeases = () => {
    setLoading(true);
    let params = {};
    if (user.user_type === 'Tenant') {
      params.user_id = user.user_id;
    } else if (isManager) {
      // Manager sees only leases for their own properties
      params.manager_id = user.user_id;
    }
    getLeases(params)
      .then(r => setLeases(r.data.results ?? r.data))
      .finally(() => setLoading(false));
  };

  const loadFormData = async () => {
    try {
      const [usersRes, propsRes] = await Promise.all([
        getUsers(),
        // Manager's property picker shows only their own properties
        getProperties(isManager ? { manager_id: user.user_id } : {}),
      ]);
      const allUsers = usersRes.data.results ?? usersRes.data;
      const allProps = propsRes.data.results ?? propsRes.data;

      setUsers(allUsers.filter(u => u.user_type === 'Tenant'));
      setProperties(allProps);
    } catch {
      // можно оставить пусто
    }
  };

  useEffect(() => {
    loadLeases();
    if (isManager) loadFormData();
  }, []);

  const isActive = (l) => {
    const today = new Date();
    return new Date(l.start_date) <= today && new Date(l.end_date) >= today;
  };

  const setF = (key) => (e) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateErr('');
    setCreating(true);

    try {
      await createLease({
        user: Number(form.user),
        property: Number(form.property),
        start_date: form.start_date,
        end_date: form.end_date,
        security_deposit: form.security_deposit,
        monthly_rent: form.monthly_rent,
      });

      setForm({
        user: '',
        property: '',
        start_date: '',
        end_date: '',
        security_deposit: '',
        monthly_rent: '',
      });

      loadLeases();
    } catch (err) {
      const d = err.response?.data;
      setCreateErr(
        d?.detail ||
        d?.user?.[0] ||
        d?.property?.[0] ||
        d?.start_date?.[0] ||
        d?.end_date?.[0] ||
        d?.security_deposit?.[0] ||
        d?.monthly_rent?.[0] ||
        'Failed to create lease.'
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (leaseId) => {
    const ok = window.confirm(`Delete lease #${leaseId}?`);
    if (!ok) return;

    setDeletingId(leaseId);
    try {
      await deleteLease(leaseId);
      loadLeases();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete lease.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="page-title">{user.user_type === 'Tenant' ? 'My Lease' : 'All Leases'}</div>

      {isManager && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Add Lease</div>

          {createErr && (
            <div style={{
              background: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.3)',
              borderRadius: 8,
              padding: '10px 14px',
              marginBottom: 16,
              color: 'var(--red)',
              fontSize: 13,
            }}>
              ⚠ {createErr}
            </div>
          )}

          <form onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-group">
                <label>Tenant</label>
                <select value={form.user} onChange={setF('user')} style={FIELD} required>
                  <option value="">Select tenant</option>
                   {users.map(u => (
                      <option key={u.user_id} value={u.user_id}>
                       {u.first_name} {u.last_name} (ID: {u.user_id})
                            </option>
                          ))}
                </select>
              </div>

              <div className="form-group">
                <label>Property</label>
                <select value={form.property} onChange={setF('property')} style={FIELD} required>
                  <option value="">Select property</option>
                  {properties.map(p => (
                    <option key={p.property_id} value={p.property_id}>
                      #{p.property_id} — {p.street_name}, {p.city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" value={form.start_date} onChange={setF('start_date')} style={FIELD} required />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="date" value={form.end_date} onChange={setF('end_date')} style={FIELD} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Monthly Rent</label>
                <input type="number" step="0.01" value={form.monthly_rent} onChange={setF('monthly_rent')} style={FIELD} required />
              </div>
              <div className="form-group">
                <label>Security Deposit</label>
                <input type="number" step="0.01" value={form.security_deposit} onChange={setF('security_deposit')} style={FIELD} required />
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={creating}>
              {creating ? 'Creating...' : '+ Add Lease'}
            </button>
          </form>
        </div>
      )}

      {loading ? <div className="spinner" /> : leases.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="icon">📝</div>
            No lease records found.
          </div>
        </div>
      ) : (
        leases.map(l => (
          <div key={l.lease_id} className="card fade-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--txt2)', marginBottom: 4 }}>Lease #{l.lease_id}</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{l.property_address}</div>
                <div style={{ fontSize: 13, color: 'var(--txt2)', marginTop: 2 }}>Tenant: {l.tenant_name}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className={`badge ${isActive(l) ? 'badge-green' : 'badge-gray'}`}>
                  {isActive(l) ? '● Active' : '○ Expired'}
                </span>

                {isManager && (
                  <button
                    className="btn"
                    onClick={() => handleDelete(l.lease_id)}
                    disabled={deletingId === l.lease_id}
                    style={{
                      padding: '6px 10px',
                      fontSize: 12,
                      border: '1px solid rgba(248,113,113,0.35)',
                      color: 'var(--red)',
                      background: 'rgba(248,113,113,0.08)',
                    }}
                  >
                    {deletingId === l.lease_id ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 16 }}>
              {[
                { label: 'Monthly Rent', value: `$${parseFloat(l.monthly_rent).toLocaleString()}`, color: 'var(--accent)' },
                { label: 'Security Deposit', value: `$${parseFloat(l.security_deposit).toLocaleString()}` },
                { label: 'Start Date', value: l.start_date },
                { label: 'End Date', value: l.end_date },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: 'var(--card2)', borderRadius: 8, padding: '12px 16px' }}>
                  <div style={{ fontSize: 10, color: 'var(--txt2)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: color || 'var(--txt)' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}