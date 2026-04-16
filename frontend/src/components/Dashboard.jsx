import { useState, useEffect } from 'react';
import { getProperties, getListings, getAppointments, getLeases, getPayments, getRequests } from '../api';

export default function Dashboard({ user }) {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (user.user_type === 'PropertyManager') {
          const [props, listings, appts, leases, payments, reqs] = await Promise.all([
            getProperties(), getListings(), getAppointments(),
            getLeases(), getPayments(), getRequests(),
          ]);
          const p = (r) => r.data.results ?? r.data;
          setStats({
            properties:    p(props).length,
            activeListings: p(listings).filter(l => l.status === 'Active').length,
            pendingAppts:  p(appts).filter(a => a.status === 'Pending').length,
            activeLeases:  p(leases).length,
            pendingPayments: p(payments).filter(p => p.status === 'Pending').length,
            openRequests:  p(reqs).filter(r => r.status === 'Pending').length,
          });
        } else if (user.user_type === 'Tenant') {
          const [leases, payments, reqs] = await Promise.all([
            getLeases({ user_id: user.user_id }),
            getPayments(),
            getRequests({ user_id: user.user_id }),
          ]);
          const p = (r) => r.data.results ?? r.data;
          const myLeases = p(leases);
          const leaseIds = myLeases.map(l => l.lease_id);
          const allPayments = p(payments).filter(pay => leaseIds.includes(pay.lease));
          setStats({
            myLeases: myLeases.length,
            totalPaid: allPayments.filter(p => p.status === 'Completed').reduce((s, p) => s + parseFloat(p.amount), 0).toFixed(2),
            pendingPayments: allPayments.filter(p => p.status === 'Pending').length,
            myRequests: p(reqs).length,
            openRequests: p(reqs).filter(r => r.status === 'Pending').length,
          });
        } else {
          const [listings, appts] = await Promise.all([
            getListings({ status: 'Active' }),
            getAppointments({ user_id: user.user_id }),
          ]);
          const p = (r) => r.data.results ?? r.data;
          setStats({
            activeListings: p(listings).length,
            myAppointments: p(appts).length,
            confirmed: p(appts).filter(a => a.status === 'Confirmed').length,
          });
        }
      } finally { setLoading(false); }
    };
    load();
  }, [user]);

  if (loading) return <div className="spinner" />;

  const StatCard = ({ label, value, sub, color }) => (
    <div className="stat-card fade-up">
      <div className="label">{label}</div>
      <div className="value" style={color ? { color } : {}}>{value}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  );

  if (user.user_type === 'PropertyManager') return (
    <div>
      <div className="page-title">Welcome back, {user.first_name} 👋</div>
      <div className="stat-grid">
        <StatCard label="Properties"       value={stats.properties}      sub="total managed" />
        <StatCard label="Active Listings"  value={stats.activeListings}  color="var(--green)" />
        <StatCard label="Pending Appts"    value={stats.pendingAppts}    color="var(--yellow)" />
        <StatCard label="Active Leases"    value={stats.activeLeases}    color="var(--blue)" />
        <StatCard label="Pending Payments" value={stats.pendingPayments} color="var(--red)" sub="need approval" />
        <StatCard label="Open Requests"    value={stats.openRequests}    color="var(--yellow)" sub="awaiting action" />
      </div>
      <div className="card">
        <div className="card-title">Quick Actions</div>
        <p style={{ color: 'var(--txt2)', fontSize: 13 }}>Use the sidebar to manage properties, listings, appointments, leases, payments, and maintenance requests.</p>
      </div>
    </div>
  );

  if (user.user_type === 'Tenant') return (
    <div>
      <div className="page-title">My Dashboard</div>
      <div className="stat-grid">
        <StatCard label="My Leases"        value={stats.myLeases}         color="var(--blue)" />
        <StatCard label="Total Paid"       value={`$${stats.totalPaid}`}  color="var(--green)" sub="completed payments" />
        <StatCard label="Pending Payments" value={stats.pendingPayments}  color="var(--yellow)" />
        <StatCard label="My Requests"      value={stats.myRequests}       sub="maintenance" />
        <StatCard label="Open Requests"    value={stats.openRequests}     color="var(--red)" sub="pending review" />
      </div>
      <div className="card">
        <div className="card-title">Tenant Portal</div>
        <p style={{ color: 'var(--txt2)', fontSize: 13 }}>View your lease details, track payments, and submit or monitor maintenance requests from the sidebar.</p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-title">Find Your New Home</div>
      <div className="stat-grid">
        <StatCard label="Available Listings" value={stats.activeListings}  color="var(--green)" sub="active now" />
        <StatCard label="My Appointments"    value={stats.myAppointments}  color="var(--blue)" />
        <StatCard label="Confirmed"          value={stats.confirmed}       color="var(--green)" sub="visits scheduled" />
      </div>
      <div className="card">
        <div className="card-title">Getting Started</div>
        <p style={{ color: 'var(--txt2)', fontSize: 13 }}>Browse active listings, filter by city or price, and book a viewing appointment directly from the sidebar.</p>
      </div>
    </div>
  );
}
