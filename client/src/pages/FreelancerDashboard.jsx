import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import ProjectCard from '../components/ProjectCard';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import Notice from '../components/Notice';
import { ago, money } from '../utils/format';

export default function FreelancerDashboard() {
  const { user } = useAuth();
  const apps = useFetch('/applications/my?limit=100');
  const avail = useFetch('/projects?limit=3');
  const hired = useFetch('/projects/hired');
  const notes = useFetch('/notifications');

  const checks = [
    ['Add a profile photo', !!user.profilePicture], ['Write a headline', !!user.headline],
    ['Write a bio (30+ characters)', (user.bio || '').length >= 30], ['List 3 or more skills', (user.skills || []).length >= 3],
    ['Set your hourly rate', user.hourlyRate > 0], ['Add your experience', user.experience > 0],
    ['Add a portfolio link', (user.portfolio || []).length > 0], ['Add your education', !!user.education],
  ];
  const pct = Math.round((checks.filter((c) => c[1]).length / checks.length) * 100);
  const missing = checks.filter((c) => !c[1]);

  const list = apps.data?.applications || [];
  const ongoing = (hired.data?.projects || []).filter((p) => p.status === 'in-progress');
  const done = (hired.data?.projects || []).filter((p) => p.status === 'completed');

  const markRead = async () => { await api('/notifications/read-all', { method: 'PATCH' }); notes.reload(); };

  return (
    <section className="page container">
      <div className="page-head row">
        <div><h1>Hi {user.name.split(' ')[0]} 👋</h1><p className="muted">Here is what is happening with your freelance work.</p></div>
        <Link className="btn btn-primary" to="/projects">Find work</Link>
      </div>

      <div className="grid grid-4">
        <StatCard icon="📨" label="Applications sent" value={list.length} />
        <StatCard icon="⏳" label="Pending" value={list.filter((a) => a.status === 'pending').length} />
        <StatCard icon="✅" label="Hired" value={list.filter((a) => a.status === 'accepted').length} />
        <StatCard icon="🛠️" label="Ongoing / completed" value={`${ongoing.length} / ${done.length}`} />
      </div>

      <div className="dash-grid">
        <div className="card">
          <h2>Profile completion</h2>
          <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100"><span style={{ width: `${pct}%` }} /></div>
          <p><strong>{pct}%</strong> complete</p>
          {missing.length > 0 ? <ul className="checklist todo">{missing.slice(0, 4).map(([l]) => <li key={l}>{l}</li>)}</ul> : <p className="muted">Your profile is complete. Nice work!</p>}
          {missing.length > 0 && <Link className="btn btn-ghost btn-sm" to="/edit-profile">Complete profile</Link>}
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
        <div className="row"><h2>My latest applications</h2><Link to="/my-applications" className="small">View all</Link></div>
        {apps.loading ? <Loader /> : apps.error ? <Notice>{apps.error}</Notice> : list.length === 0 ? <p className="muted">You have not applied yet. <Link to="/projects">Browse projects</Link></p> : (
          <ul className="activity">{list.slice(0, 5).map((a) => (
            <li key={a._id}><Link to={`/projects/${a.projectId?._id}`}>{a.projectId?.title || 'Removed project'}</Link><span><StatusBadge status={a.status} /> <span className="muted small">{money(a.proposedBudget)}</span></span></li>
          ))}</ul>
        )}
      </div>

      <h2 className="mt">Available projects</h2>
      {avail.loading ? <Loader /> : <div className="grid grid-3">{(avail.data?.projects || []).map((p) => <ProjectCard key={p._id} project={p} />)}</div>}
    </section>
  );
}
