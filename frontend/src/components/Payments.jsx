import { useState, useEffect } from 'react';
import { getPayments, getLeases, approvePayment, failPayment, createPayment } from '../api';

const STATUS_BADGE = { Completed: 'badge-green', Pending: 'badge-yellow', Failed: 'badge-red' };
const METHOD_ICONS = { Transfer: '🔄', CreditCard: '💳', DebitCard: '💰', Cash: '💵' };
const FIELD = { width: '100%', height: 42, padding: '0 12px', fontSize: 14 };

export default function Payments({ user }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState({});
  const [filter, setFilter] = useState('');

  // Tenant: make payment
  const [leases, setLeases] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    lease: '',
    amount: '',
    method: 'Transfer',
    pay_date: new Date().toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState('');
  const [submitOk, setSubmitOk] = useState('');

  const isManager = user.user_type === 'PropertyManager';
  const isTenant = user.user_type === 'Tenant';

  const load = async () => {
    setLoading(true);
    try {
      if (isTenant) {
        const leasesRes = await getLeases({ user_id: user.user_id });
        const myLeases = leasesRes.data.results ?? leasesRes.data;
        setLeases(myLeases);
        const leaseIds = myLeases.map(l => l.lease_id);
        const payRes = await getPayments();
        const all = payRes.data.results ?? payRes.data;
        setPayments(all.filter(p => leaseIds.includes(p.lease)));
      } else {
        // Manager sees only payments for their properties
        const params = { manager_id: user.user_id };
        if (filter) params.status = filter;
        const res = await getPayments(params);
        setPayments(res.data.results ?? res.data);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    setBusy(b => ({ ...b, [id]: true }));
    try { await approvePayment(id); await load(); } finally { setBusy(b => ({ ...b, [id]: false })); }
  };

  const fail = async (id) => {
    setBusy(b => ({ ...b, [id]: true }));
    try { await failPayment(id); await load(); } finally { setBusy(b => ({ ...b, [id]: false })); }
  };

  const setF = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setSubmitErr('');
    setSubmitOk('');
    setSubmitting(true);
    try {
      await createPayment({
        lease: Number(form.lease),
        amount: form.amount,
        method: form.method,
        pay_date: form.pay_date,
        status: 'Pending',
      });
      setForm({
        lease: leases.length ? String(leases[0].lease_id) : '',
        amount: '',
        method: 'Transfer',
        pay_date: new Date().toISOString().split('T')[0],
      });
      setShowForm(false);
      setSubmitOk('Payment submitted! It will be reviewed by the property manager.');
      await load();
    } catch (err) {
      const d = err.response?.data;
      setSubmitErr(d?.detail || d?.amount?.[0] || d?.lease?.[0] || 'Failed to submit payment.');
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div className="page-title" style={{ marginBottom: 0 }}>
          {isManager ? 'Rent Payments' : 'My Payments'}
        </div>
        {isTenant && (
          <button className="btn btn-primary" onClick={() => { setShowForm(v => !v); setSubmitErr(''); setSubmitOk(''); }}>
            {showForm ? '✕ Cancel' : '+ Make Payment'}
          </button>
        )}
      </div>

      {/* Make Payment Form (tenant) */}
      {isTenant && showForm && (
        <div className="card fade-up" style={{ marginBottom: 20 }}>
          <div className="card-title">Submit Rent Payment</div>

          {submitErr && (
            <div style={{
              background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: 'var(--red)', fontSize: 13,
            }}>⚠ {submitErr}</div>
          )}

          <form onSubmit={handleSubmitPayment}>
            <div className="form-row">
              <div className="form-group">
                <label>Lease</label>
                <select value={form.lease} onChange={setF('lease')} style={FIELD} required>
                  <option value="">Select lease…</option>
                  {leases.map(l => (
                    <option key={l.lease_id} value={l.lease_id}>
                      #{l.lease_id} — {l.property_address} (${parseFloat(l.monthly_rent).toLocaleString()}/mo)
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Amount ($)</label>
                <input
                  type="number" step="0.01" min="0.01"
                  value={form.amount} onChange={setF('amount')}
                  style={FIELD} required
                  placeholder={leases.find(l => String(l.lease_id) === form.lease)
                    ? `Monthly rent: $${parseFloat(leases.find(l => String(l.lease_id) === form.lease).monthly_rent).toLocaleString()}`
                    : ''}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Payment Method</label>
                <select value={form.method} onChange={setF('method')} style={FIELD} required>
                  <option value="Transfer">🔄 Bank Transfer</option>
                  <option value="CreditCard">💳 Credit Card</option>
                  <option value="DebitCard">💰 Debit Card</option>
                  <option value="Cash">💵 Cash</option>
                </select>
              </div>
              <div className="form-group">
                <label>Payment Date</label>
                <input type="date" value={form.pay_date} onChange={setF('pay_date')} style={FIELD} required />
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Submitting…' : '💳 Submit Payment'}
            </button>
          </form>
        </div>
      )}

      {submitOk && (
        <div style={{
          background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)',
          borderRadius: 8, padding: '10px 16px', marginBottom: 16, color: 'var(--green)', fontSize: 13,
        }}>✓ {submitOk}</div>
      )}

      {/* Filter for manager */}
      {isManager && (
        <div className="filter-bar">
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 150 }}>
            <option value="">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Failed">Failed</option>
          </select>
          <button className="btn btn-primary" onClick={load}>Filter</button>
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
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Lease</th>
                  <th>Status</th>
                  {isManager && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.payment_id} className="fade-up">
                    <td style={{ color: 'var(--txt2)' }}>#{p.payment_id}</td>
                    <td>{p.pay_date}</td>
                    <td style={{ fontWeight: 600, color: 'var(--green)' }}>${parseFloat(p.amount).toLocaleString()}</td>
                    <td>{METHOD_ICONS[p.method]} {p.method}</td>
                    <td style={{ color: 'var(--txt2)' }}>Lease #{p.lease}</td>
                    <td><span className={`badge ${STATUS_BADGE[p.status] || 'badge-gray'}`}>{p.status}</span></td>
                    {isManager && (
                      <td>
                        {p.status === 'Pending' ? (
                          <div className="btn-row">
                            <button className="btn btn-green" disabled={busy[p.payment_id]} onClick={() => approve(p.payment_id)}>✓ Approve</button>
                            <button className="btn btn-red"   disabled={busy[p.payment_id]} onClick={() => fail(p.payment_id)}>✕ Fail</button>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--txt2)', fontSize: 12 }}>—</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {!payments.length && (
              <div className="empty">
                <div className="icon">💳</div>
                {isTenant ? 'No payments yet. Use "+ Make Payment" to submit your first payment.' : 'No payments found.'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
