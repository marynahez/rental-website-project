import { useState, useEffect } from 'react';
import { getAppointments, confirmAppointment, cancelAppointment, completeAppointment } from '../api';

const STATUS_BADGE = { Pending: 'badge-yellow', Confirmed: 'badge-green', Cancelled: 'badge-red', Completed: 'badge-blue' };

export default function Appointments({ user, navigate }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState({});
  const [statusFilter, setStatusFilter] = useState('');

  const isManager = user.user_type === 'PropertyManager';

  const load = () => {
    setLoading(true);
    const params = {};
    if (isManager) {
      // Manager sees only appointments for their own listings
      params.manager_id = user.user_id;
    } else {
      params.user_id = user.user_id;
    }
    if (statusFilter) params.status = statusFilter;
    getAppointments(params).then(r => { setAppointments(r.data.results ?? r.data); setLoading(false); });
  };

  useEffect(() => { load(); }, [statusFilter]);

  const act = async (id, fn) => {
    setBusy(b => ({ ...b, [id]: true }));
    try { await fn(id); await load(); } finally { setBusy(b => ({ ...b, [id]: false })); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div className="page-title" style={{ marginBottom: 0 }}>
          {isManager ? 'All Appointments' : 'My Appointments'}
        </div>
        {user.user_type === 'ProspectiveRenter' && (
          <button className="btn btn-primary" onClick={() => navigate('listings')}>
            + Book New Appointment
          </button>
        )}
      </div>

      {isManager && (
        <div className="filter-bar">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 150 }}>
            <option value="">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      )}

      <div className="card">
        {loading ? <div className="spinner" /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Renter</th>
                  <th>Property</th>
                  <th>Price</th>
                  <th>Visit Date</th>
                  <th>Status</th>
                  {isManager && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {appointments.map(a => {
                  const slot = a.time_slots?.[0];
                  const dateStr = slot
                    ? `${slot.year}-${String(slot.month).padStart(2,'0')}-${String(slot.day).padStart(2,'0')}`
                      + (slot.hour !== undefined && slot.hour !== null ? ` ${String(slot.hour).padStart(2,'0')}:00` : '')
                    : '—';
                  return (
                    <tr key={a.appointment_id} className="fade-up">
                      <td style={{ color: 'var(--txt2)', fontSize: 12 }}>#{a.appointment_id}</td>
                      <td style={{ fontWeight: 600 }}>{a.user_name}</td>
                      <td style={{ fontSize: 12, color: a.property_address ? 'var(--txt)' : 'var(--txt2)' }}>
                        {a.property_address || <span style={{ opacity: 0.4 }}>—</span>}
                      </td>
                      <td style={{ color: 'var(--green)', fontWeight: 600, fontSize: 13 }}>
                        {a.listing_price ? `$${parseFloat(a.listing_price).toLocaleString()}/mo` : <span style={{ opacity: 0.4 }}>—</span>}
                      </td>
                      <td>{dateStr}</td>
                      <td><span className={`badge ${STATUS_BADGE[a.status] || 'badge-gray'}`}>{a.status}</span></td>
                      {isManager && (
                        <td>
                          <div className="btn-row">
                            {a.status === 'Pending' && (
                              <>
                                <button className="btn btn-green" disabled={busy[a.appointment_id]}
                                  onClick={() => act(a.appointment_id, confirmAppointment)}>✓ Confirm</button>
                                <button className="btn btn-red" disabled={busy[a.appointment_id]}
                                  onClick={() => act(a.appointment_id, cancelAppointment)}>✕ Cancel</button>
                              </>
                            )}
                            {a.status === 'Confirmed' && (
                              <button className="btn btn-blue" disabled={busy[a.appointment_id]}
                                onClick={() => act(a.appointment_id, completeAppointment)}>✓ Complete</button>
                            )}
                            {(a.status === 'Cancelled' || a.status === 'Completed') && (
                              <span style={{ color: 'var(--txt2)', fontSize: 12 }}>—</span>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!appointments.length && (
              <div className="empty">
                <div className="icon">📅</div>
                {user.user_type === 'ProspectiveRenter'
                  ? <>No appointments yet. <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => navigate('listings')}>Browse listings</span> to book one.</>
                  : 'No appointments found.'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
