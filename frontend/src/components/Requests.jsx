import { useState, useEffect } from 'react';
import { getRequests, approveRequest, rejectRequest, completeRequest, createRequest, getLeases } from '../api';

const STATUS_BADGE = { Pending: 'badge-yellow', Approved: 'badge-green', Rejected: 'badge-red', Completed: 'badge-blue' };
const PERM_BADGE   = { Granted: 'badge-green',  Denied:   'badge-red',   Pending:  'badge-gray' };

export default function Requests({ user }) {
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [busy, setBusy]           = useState({});
  const [showForm, setShowForm]   = useState(false);
  const [leases, setLeases]       = useState([]);
  const [form, setForm]           = useState({ description: '', property: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const isManager = user.user_type === 'PropertyManager';

  const load = () => {
    setLoading(true);
    const params = {};
    if (isManager) {
      // Manager sees only requests for their own properties
      params.manager_id = user.user_id;
    } else {
      params.user_id = user.user_id;
    }
    if (statusFilter) params.status = statusFilter;
    getRequests(params).then(r => { setRequests(r.data.results ?? r.data); setLoading(false); });
  };

  useEffect(() => {
    load();
    if (user.user_type === 'Tenant') {
      getLeases({ user_id: user.user_id }).then(r => {
        const ls = r.data.results ?? r.data;
        setLeases(ls);
        if (ls.length) setForm(f => ({ ...f, property: ls[0].property }));
      });
    }
  }, [statusFilter]);

  const act = async (id, fn) => {
    setBusy(b => ({ ...b, [id]: true }));
    try { await fn(id); await load(); } finally { setBusy(b => ({ ...b, [id]: false })); }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.description || !form.property) return;
    setSubmitting(true);
    setSubmitMsg('');
    try {
      await createRequest({
        date_submitted: new Date().toISOString().split('T')[0],
        status: 'Pending',
        permission: 'Pending',
        description: form.description,
        user: user.user_id,
        property: form.property,
      });
      setForm(f => ({ ...f, description: '' }));
      setShowForm(false);
      setSubmitMsg('Request submitted successfully.');
      load();
    } catch { setSubmitMsg('Failed to submit. Please try again.'); }
    finally { setSubmitting(false); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div className="page-title" style={{ marginBottom: 0 }}>
          {isManager ? 'Maintenance Requests' : 'My Requests'}
        </div>
        {user.user_type === 'Tenant' && (
          <button className="btn btn-primary" onClick={() => { setShowForm(v => !v); setSubmitMsg(''); }}>
            {showForm ? '✕ Cancel' : '+ New Request'}
          </button>
        )}
      </div>

      {/* Submit form for Tenant */}
      {showForm && (
        <div className="card fade-up" style={{ marginBottom: 20 }}>
          <div className="card-title">Submit Maintenance Request</div>
          <form onSubmit={submit}>
            <div className="form-group">
              <label>Property</label>
              <select value={form.property} onChange={e => setForm(f => ({ ...f, property: e.target.value }))} style={{ width: '100%' }} required>
                <option value="">Select a property…</option>
                {leases.map(l => (
                  <option key={l.lease_id} value={l.property}>
                    {l.property_address} (Lease #{l.lease_id})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Description of Issue</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe the maintenance issue in detail…"
                required
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Submitting…' : '✓ Submit Request'}
            </button>
          </form>
        </div>
      )}

      {submitMsg && (
        <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 8, padding: '10px 16px', marginBottom: 16, color: 'var(--green)', fontSize: 13 }}>
          ✓ {submitMsg}
        </div>
      )}

      {/* Filter for manager */}
      {isManager && (
        <div className="filter-bar">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 150 }}>
            <option value="">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
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
                  <th>Date</th>
                  {isManager && <th>Tenant</th>}
                  <th>Property</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Permission</th>
                  {isManager && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.request_id} className="fade-up">
                    <td style={{ color: 'var(--txt2)', fontSize: 12 }}>#{r.request_id}</td>
                    <td>{r.date_submitted}</td>
                    {isManager && <td style={{ fontWeight: 600 }}>{r.tenant_name}</td>}
                    <td style={{ fontWeight: 500, fontSize: 12 }}>{r.property_address}</td>
                    <td style={{ maxWidth: 220, color: 'var(--txt2)', fontSize: 12, lineHeight: 1.4 }}>{r.description}</td>
                    <td><span className={`badge ${STATUS_BADGE[r.status] || 'badge-gray'}`}>{r.status}</span></td>
                    <td><span className={`badge ${PERM_BADGE[r.permission] || 'badge-gray'}`}>{r.permission}</span></td>
                    {isManager && (
                      <td>
                        <div className="btn-row">
                          {r.status === 'Pending' && (
                            <>
                              <button className="btn btn-green" disabled={busy[r.request_id]}
                                onClick={() => act(r.request_id, approveRequest)} title="Approve">✓</button>
                              <button className="btn btn-red" disabled={busy[r.request_id]}
                                onClick={() => act(r.request_id, rejectRequest)} title="Reject">✕</button>
                            </>
                          )}
                          {r.status === 'Approved' && (
                            <button className="btn btn-blue" disabled={busy[r.request_id]}
                              onClick={() => act(r.request_id, completeRequest)}>Done</button>
                          )}
                          {(r.status === 'Rejected' || r.status === 'Completed') && (
                            <span style={{ color: 'var(--txt2)', fontSize: 12 }}>—</span>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {!requests.length && (
              <div className="empty">
                <div className="icon">🔧</div>No requests found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
