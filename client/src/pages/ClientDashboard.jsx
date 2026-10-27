import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import Loader from '../components/Loader';
import Notice from '../components/Notice';
import EmptyState from '../components/EmptyState';
import { ago, money } from '../utils/format';

export default function ClientDashboard() {
  const { user } = useAuth();
  const mine = useFetch('/projects/mine');
  const notes = useFetch('/notifications');
  const projects = mine.data?.projects || [];
  const count = (s) => projects.filter((p) => p.status === s).length;
  const received = projects.reduce((n, p) => n + p.applicationCount, 0);
  const pending = projects.reduce((n, p) => n + p.pendingCount, 0);
  const hired = projects.filter((p) => p.hiredFreelancerId);
  const spend = hired.reduce((n, p) => n + p.budget, 0);

  const markRead = async () => { await api('/notifications/read-all', { method: 'PATCH' }); notes.reload(); };

  return (
    <section className="page container">
      <div className="page-head row">
        <div><h1>Hi {user.name.split(' ')[0]} 👋</h1><p className="muted">Your projects, proposals and hires at a glance.</p></div>
        <Link className="btn btn-primary" to="/post-project">Post a project</Link>
      </div>

      {mine.error && <Notice>{mine.error}</Notice>}
      <div className="grid grid-4">
        <StatCard icon="📁" label="Projects posted" value={projects.length} />
        <StatCard icon="🟢" label="Open" value={count('open')} />
        <StatCard icon="🛠️" label="In progress" value={count('in-progress')} />
        <StatCard icon="🏁" label="Completed" value={count('completed')} />
        <StatCard icon="📨" label="Applications received" value={received} hint={`${pending} waiting for you`} />
        <StatCard icon="🤝" label="Freelancers hired" value={hired.length} />
        <StatCard icon="💰" label="Committed budget" value={money(spend)} />
        <StatCard icon="❌" label="Cancelled" value={count('cancelled')} />
      </div>

      <div className="dash-grid">
        <div className="card">
          <div className="row"><h2>Your projects</h2><Link to="/my-projects" className="small">Manage all</Link></div>
          {mine.loading ? <Loader /> : projects.length === 0 ? (
            <EmptyState icon="🚀" title="Post your first project" text="Describe the work and proposals will start arriving." actionTo="/post-project" actionLabel="Post a project" />
          ) : (
            <ul className="activity">{projects.slice(0, 6).map((p) => (
              <li key={p._id}>
                <Link to={`/projects/${p._id}/applications`}>{p.title}</Link>
                <span><StatusBadge status={p.status} /> <span className="muted small">{p.applicationCount} proposals{p.pendingCount ? ` (${p.pendingCount} new)` : ''}</span></span>
              </li>
            ))}</ul>
          )}
        </div>

        <div className="card">
          <div className="row"><h2>Recent activity</h2>{notes.data?.unread > 0 && <button className="btn btn-ghost btn-sm" onClick={markRead}>Mark all read</button>}</div>
          {notes.loading ? <Loader /> : notes.data?.notifications.length === 0 ? <p className="muted">No activity yet.</p> : (
            <ul className="activity">{notes.data.notifications.slice(0, 6).map((n) => (
              <li key={n._id} className={n.read ? '' : 'unread'}><Link to={n.link || '/dashboard'}>{n.message}</Link><span className="muted small">{ago(n.createdAt)}</span></li>
            ))}</ul>
          )}
        </div>
      </div>

      <div className="card">
        <h2>Hired freelancers</h2>
        {hired.length === 0 ? <p className="muted">When you accept a proposal, the freelancer appears here.</p> : (
          <ul className="activity">{hired.map((p) => (
            <li key={p._id}>
              <span className="fc-head"><Avatar user={p.hiredFreelancerId} size={36} /><span><Link to={`/freelancers/${p.hiredFreelancerId._id}`}>{p.hiredFreelancerId.name}</Link><span className="muted small"> · {p.title}</span></span></span>
              <StatusBadge status={p.status} />
            </li>
          ))}</ul>
        )}
      </div>
    </section>
  );
}
