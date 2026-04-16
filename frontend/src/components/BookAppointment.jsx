import { useState } from 'react';
import { createAppointment, createTimeslot } from '../api';

export default function BookAppointment({ user }) {
  const [date, setDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!date) return;
    setSubmitting(true);
    setError('');
    try {
      const apptRes = await createAppointment({ status: 'Pending', user: user.user_id });
      const appt = apptRes.data;
      const [year, month, day] = date.split('-').map(Number);
      await createTimeslot({ appointment: appt.appointment_id, slot_num: 1, day, month, year });
      setSuccess({ id: appt.appointment_id, date });
      setDate('');
    } catch (err) {
      setError('Failed to book appointment. Please try again.');
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="page-title">Book a Viewing</div>
      <div className="card fade-up" style={{ maxWidth: 480 }}>
        <div className="card-title">Schedule an Appointment</div>
        <p style={{ fontSize: 13, color: 'var(--txt2)', marginBottom: 20 }}>
          Select a date for your property viewing. A property manager will confirm your appointment shortly.
        </p>

        {success && (
          <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 8, padding: '14px 16px', marginBottom: 20 }}>
            <div style={{ color: 'var(--green)', fontWeight: 600, marginBottom: 4 }}>✓ Appointment Booked!</div>
            <div style={{ fontSize: 13, color: 'var(--txt2)' }}>Appointment #{success.id} · Requested for {success.date}</div>
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '14px 16px', marginBottom: 20 }}>
            <div style={{ color: 'var(--red)', fontSize: 13 }}>{error}</div>
          </div>
        )}

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Preferred Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={{ width: '100%' }}
              required
            />
          </div>
          <div className="form-group">
            <label>Your Name</label>
            <input type="text" value={`${user.first_name} ${user.last_name}`} readOnly style={{ width: '100%', opacity: 0.7 }} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={submitting || !date} style={{ width: '100%', justifyContent: 'center', padding: '11px' }}>
            {submitting ? 'Booking…' : '📅 Book Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
}
