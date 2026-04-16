import { useState, useEffect } from 'react';
import { getProperties, createProperty, updateProperty, deleteProperty } from '../api';

const FIELD = { width: '100%', height: 42, padding: '0 12px', fontSize: 14 };

export default function Properties({ user }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [city, setCity] = useState('');
  const [rented, setRented] = useState('');

  const [form, setForm] = useState({
    province: '',
    city: '',
    street_name: '',
    post_code: '',
    suite: '',
    apartment: '',
    is_rented: false,
  });

  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [createErr, setCreateErr] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  const isManager = user?.user_type === 'PropertyManager';

  const load = () => {
    setLoading(true);
    const params = {};
    if (city) params.city = city;
    if (rented) params.is_rented = rented;
    // Manager sees only their own properties
    if (isManager) params.manager_id = user.user_id;

    getProperties(params)
      .then(r => setProperties(r.data.results ?? r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const setF = (key) => (e) => {
    const value = key === 'is_rented' ? e.target.value === 'true' : e.target.value;
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateErr('');
    setCreating(true);

    try {
      await createProperty({ ...form, manager: user.user_id });
      setForm({
        province: '',
        city: '',
        street_name: '',
        post_code: '',
        suite: '',
        apartment: '',
        is_rented: false,
      });
      load();
    } catch (err) {
      const d = err.response?.data;
      setCreateErr(
        d?.detail ||
        d?.street_name?.[0] ||
        d?.city?.[0] ||
        d?.province?.[0] ||
        d?.post_code?.[0] ||
        'Failed to create property.'
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (propertyId) => {
    const ok = window.confirm(`Delete property #${propertyId}?`);
    if (!ok) return;

    setDeletingId(propertyId);
    try {
      await deleteProperty(propertyId);
      load();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete property.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleRented = async (property) => {
    setTogglingId(property.property_id);
    try {
      await updateProperty(property.property_id, { is_rented: !property.is_rented });
      load();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update status.');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div>
      <div className="page-title">Properties</div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Filter by city…"
          value={city}
          onChange={e => setCity(e.target.value)}
          style={{ width: 180 }}
        />
        <select
          value={rented}
          onChange={e => setRented(e.target.value)}
          style={{ width: 150 }}
        >
          <option value="">All statuses</option>
          <option value="true">Rented</option>
          <option value="false">Available</option>
        </select>
        <button className="btn btn-primary" onClick={load}>Search</button>
      </div>

      {isManager && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
            Add Property
          </div>

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
                <label>Province</label>
                <input
                  value={form.province}
                  onChange={setF('province')}
                  style={FIELD}
                  required
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  value={form.city}
                  onChange={setF('city')}
                  style={FIELD}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Street Name</label>
              <input
                value={form.street_name}
                onChange={setF('street_name')}
                style={FIELD}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Post Code</label>
                <input
                  value={form.post_code}
                  onChange={setF('post_code')}
                  style={FIELD}
                  required
                />
              </div>
              <div className="form-group">
                <label>Suite</label>
                <input
                  value={form.suite}
                  onChange={setF('suite')}
                  style={FIELD}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Apartment</label>
                <input
                  value={form.apartment}
                  onChange={setF('apartment')}
                  style={FIELD}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={String(form.is_rented)}
                  onChange={setF('is_rented')}
                  style={FIELD}
                >
                  <option value="false">Available</option>
                  <option value="true">Rented</option>
                </select>
              </div>
            </div>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={creating}
            >
              {creating ? 'Creating...' : '+ Add Property'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? <div className="spinner" /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Address</th>
                  <th>City</th>
                  <th>Province</th>
                  <th>Post Code</th>
                  <th>Suite</th>
                  <th>Apt</th>
                  <th>Status</th>
                  {isManager && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {properties.map(p => (
                  <tr key={p.property_id} className="fade-up">
                    <td style={{ color: 'var(--txt2)' }}>#{p.property_id}</td>
                    <td style={{ fontWeight: 600 }}>{p.street_name}</td>
                    <td>{p.city}</td>
                    <td>{p.province}</td>
                    <td>{p.post_code}</td>
                    <td>{p.suite || <span style={{ color: 'var(--txt2)' }}>—</span>}</td>
                    <td>{p.apartment}</td>
                    <td>
                      <span className={`badge ${p.is_rented ? 'badge-green' : 'badge-blue'}`}>
                        {p.is_rented ? '✓ Rented' : '◉ Available'}
                      </span>
                    </td>
                    {isManager && (
                      <td>
                        <div className="btn-row">
                          <button
                            className="btn"
                            onClick={() => handleToggleRented(p)}
                            disabled={togglingId === p.property_id}
                            style={{
                              padding: '6px 10px',
                              fontSize: 12,
                              border: `1px solid ${p.is_rented ? 'rgba(96,165,250,0.35)' : 'rgba(52,211,153,0.35)'}`,
                              color: p.is_rented ? 'var(--blue)' : 'var(--green)',
                              background: p.is_rented ? 'rgba(96,165,250,0.08)' : 'rgba(52,211,153,0.08)',
                            }}
                          >
                            {togglingId === p.property_id
                              ? '…'
                              : p.is_rented ? '→ Available' : '→ Rented'}
                          </button>
                          <button
                            className="btn"
                            onClick={() => handleDelete(p.property_id)}
                            disabled={deletingId === p.property_id}
                            style={{
                              padding: '6px 10px',
                              fontSize: 12,
                              border: '1px solid rgba(248,113,113,0.35)',
                              color: 'var(--red)',
                              background: 'rgba(248,113,113,0.08)',
                            }}
                          >
                            {deletingId === p.property_id ? '…' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {!properties.length && (
              <div className="empty">
                <div className="icon">🏘️</div>
                No properties found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}