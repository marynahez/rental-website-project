import { useState, useEffect } from 'react';
import { getListings, bookAppointment, getProperties, createListing, deleteListing } from '../api';

const STATUS_BADGE = { Active: 'badge-green', Rented: 'badge-blue', Inactive: 'badge-gray', Closed: 'badge-red' };
const FIELD = { width: '100%', height: 42, padding: '0 12px', fontSize: 14 };

function BookModal({ listing, user, onClose }) {
  const [date, setDate] = useState('');
  const [hour, setHour] = useState('');          // '9' .. '17'
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!date || hour === '') return;
    setSubmitting(true);
    setError('');
    const [year, month, day] = date.split('-').map(Number);
    try {
      const res = await bookAppointment({
        user: user.user_id,
        listing: listing.listing_id,
        year, month, day, hour: Number(hour),
      });
      setDone(res.data.appointment_id);
    } catch (err) {
      const msg = err.response?.data?.detail;
      // 409 = slot already taken
      if (err.response?.status === 409) {
        setError(msg || 'This slot is already booked for this listing. Please choose another time.');
      } else {
        setError(msg || 'Could not book appointment. Please try again.');
      }
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
      <div className="card fade-up" style={{ width: 420, margin: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>📅 Book a Viewing</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--txt2)', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ background: 'var(--card2)', borderRadius: 8, padding: '12px 14px', marginBottom: 18, fontSize: 13 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            {listing.property_details?.street_name}, {listing.property_details?.city}
          </div>
          <div style={{ color: 'var(--accent)', fontWeight: 700 }}>${parseFloat(listing.price).toLocaleString()}/mo</div>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Appointment Booked!</div>
            <div style={{ color: 'var(--txt2)', fontSize: 13 }}>Appointment #{done} · {date} at {String(hour).padStart(2,'0')}:00</div>
            <div style={{ color: 'var(--txt2)', fontSize: 12, marginTop: 6 }}>A property manager will confirm your visit shortly.</div>
            <button className="btn btn-primary" onClick={onClose} style={{ marginTop: 18 }}>Done</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            {error && (
              <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, color: 'var(--red)', fontSize: 13 }}>{error}</div>
            )}
            <div className="form-group">
              <label>Preferred Visit Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]} style={{ width: '100%' }} required />
            </div>
            <div className="form-group">
              <label>Preferred Time</label>
              <select value={hour} onChange={e => setHour(e.target.value)}
                style={{ width: '100%', height: 42, padding: '0 12px', fontSize: 14 }} required>
                <option value="">Select a time…</option>
                {[9,10,11,12,13,14,15,16,17].map(h => (
                  <option key={h} value={h}>{String(h).padStart(2,'0')}:00</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Your Name</label>
              <input type="text" value={`${user.first_name} ${user.last_name}`} readOnly style={{ width: '100%', opacity: 0.6 }} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting || !date || hour === ''}
              style={{ width: '100%', justifyContent: 'center', padding: '11px' }}>
              {submitting ? 'Booking…' : '📅 Confirm Booking'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function Listings({ user }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [statusFilter, setStatusFilter] = useState(user.user_type === 'ProspectiveRenter' ? 'Active' : '');
  const [booking, setBooking] = useState(null);

  // Manager: create listing
  const [properties, setProperties] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    property: '',
    price: '',
    description: '',
    date_posted: new Date().toISOString().split('T')[0],
    status: 'Active',
  });
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const isRenter = user.user_type === 'ProspectiveRenter';
  const isManager = user.user_type === 'PropertyManager';

  const load = () => {
    setLoading(true);
    const params = {};
    if (city) params.city = city;
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    if (statusFilter) params.status = statusFilter;
    // Manager sees ALL listings (can only create/delete their own)
    getListings(params).then(r => { setListings(r.data.results ?? r.data); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (isManager) {
      getProperties().then(r => setProperties(r.data.results ?? r.data));
    }
  }, [isManager]);

  const setF = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateErr('');
    setCreating(true);
    try {
      await createListing({
        property: Number(form.property),
        user: user.user_id,
        price: form.price,
        description: form.description,
        date_posted: form.date_posted,
        status: form.status,
      });
      setForm({
        property: '',
        price: '',
        description: '',
        date_posted: new Date().toISOString().split('T')[0],
        status: 'Active',
      });
      setShowForm(false);
      load();
    } catch (err) {
      const d = err.response?.data;
      setCreateErr(
        d?.detail || d?.property?.[0] || d?.price?.[0] || d?.description?.[0] || 'Failed to create listing.'
      );
    } finally { setCreating(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete listing #${id}?`)) return;
    setDeletingId(id);
    try {
      await deleteListing(id);
      load();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete listing.');
    } finally { setDeletingId(null); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div className="page-title" style={{ marginBottom: 0 }}>
          {isRenter ? 'Browse Listings' : 'Rental Listings'}
        </div>
        {isManager && (
          <button className="btn btn-primary" onClick={() => { setShowForm(v => !v); setCreateErr(''); }}>
            {showForm ? '✕ Cancel' : '+ New Listing'}
          </button>
        )}
      </div>

      {/* Create Listing Form (manager only) */}
      {isManager && showForm && (
        <div className="card fade-up" style={{ marginBottom: 20 }}>
          <div className="card-title">Add New Listing</div>

          {createErr && (
            <div style={{
              background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: 'var(--red)', fontSize: 13,
            }}>⚠ {createErr}</div>
          )}

          <form onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-group">
                <label>Property</label>
                <select value={form.property} onChange={setF('property')} style={FIELD} required>
                  <option value="">Select property…</option>
                  {properties.map(p => (
                    <option key={p.property_id} value={p.property_id}>
                      #{p.property_id} — {p.street_name}, {p.city}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Monthly Price ($)</label>
                <input type="number" step="0.01" min="0" value={form.price} onChange={setF('price')} style={FIELD} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date Posted</label>
                <input type="date" value={form.date_posted} onChange={setF('date_posted')} style={FIELD} required />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={setF('status')} style={FIELD}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Rented">Rented</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the property…"
                style={{ width: '100%', minHeight: 80 }}
                required
              />
            </div>

            <button className="btn btn-primary" type="submit" disabled={creating}>
              {creating ? 'Creating…' : '+ Add Listing'}
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="filter-bar">
        <input type="text" placeholder="City…" value={city} onChange={e => setCity(e.target.value)} style={{ width: 140 }} />
        <input type="number" placeholder="Min $" value={minPrice} onChange={e => setMinPrice(e.target.value)} style={{ width: 90 }} />
        <input type="number" placeholder="Max $" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} style={{ width: 90 }} />
        {!isRenter && (
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 130 }}>
            <option value="">All statuses</option>
            <option value="Active">Active</option>
            <option value="Rented">Rented</option>
            <option value="Inactive">Inactive</option>
            <option value="Closed">Closed</option>
          </select>
        )}
        <button className="btn btn-primary" onClick={load}>Search</button>
        {!isRenter && (
          <button className="btn btn-gray" onClick={() => {
            setCity(''); setMinPrice(''); setMaxPrice(''); setStatusFilter('');
            setTimeout(load, 0);
          }}>Clear</button>
        )}
      </div>

      {loading ? <div className="spinner" /> : (
        <>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginBottom: 16 }}>
            {listings.length} listing{listings.length !== 1 ? 's' : ''} found
          </div>
          <div className="listing-grid">
            {listings.map(l => (
              <div key={l.listing_id} className="listing-card fade-up">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div className="price">${parseFloat(l.price).toLocaleString()}<span>/mo</span></div>
                  <span className={`badge ${STATUS_BADGE[l.status] || 'badge-gray'}`}>{l.status}</span>
                </div>

                {l.property_details && (
                  <>
                    <div className="address">
                      {l.property_details.street_name}, {l.property_details.city}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--txt2)', marginBottom: 10 }}>
                      {l.property_details.province} · Apt {l.property_details.apartment}
                      {l.property_details.suite ? ` · ${l.property_details.suite}` : ''} · {l.property_details.post_code}
                    </div>
                  </>
                )}

                <div className="desc">{l.description}</div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--txt2)' }}>
                    Posted {l.date_posted} · #{l.listing_id}
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {isRenter && l.status === 'Active' && (
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: 11, padding: '5px 12px' }}
                        onClick={() => setBooking(l)}
                      >
                        📅 Book
                      </button>
                    )}
                    {isManager && properties.some(p => p.property_id === l.property) && (
                      <button
                        className="btn"
                        onClick={() => handleDelete(l.listing_id)}
                        disabled={deletingId === l.listing_id}
                        style={{
                          padding: '5px 10px', fontSize: 11,
                          border: '1px solid rgba(248,113,113,0.35)',
                          color: 'var(--red)', background: 'rgba(248,113,113,0.08)',
                        }}
                      >
                        {deletingId === l.listing_id ? 'Deleting…' : 'Delete'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {!listings.length && (
              <div className="empty" style={{ gridColumn: '1/-1' }}>
                <div className="icon">🔍</div>No listings match your search.
              </div>
            )}
          </div>
        </>
      )}

      {booking && <BookModal listing={booking} user={user} onClose={() => setBooking(null)} />}
    </div>
  );
}
