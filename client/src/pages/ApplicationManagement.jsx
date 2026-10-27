import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { api } from '../services/api';
import Avatar from '../components/Avatar';
import Loader from '../components/Loader';
import Notice from '../components/Notice';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import { fmtDate, money } from '../utils/format';

export default function ApplicationManagement() {
  const { id } = useParams();
  const { data, loading, error, reload } = useFetch(`/projects/${id}/applications`);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [busyId, setBusyId] = useState('');

  const decide = async (app, status) => {
    const verb = status === 'accepted' ? `Hire ${app.freelancerId.name}? Other pending proposals will be rejected.` : `Reject ${app.freelancerId.name}'s proposal?`;
    if (!window.confirm(verb)) return;
    setBusyId(app._id); setMsg({ type: '', text: '' });
    try {
      await api(`/applications/${app._id}/status`, { method: 'PATCH', body: { status } });
      setMsg({ type: 'success', text: status === 'accepted' ? 'Freelancer hired. The project is now In progress.' : 'Application rejected.' });
      reload();
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
    setBusyId('');
  };

  if (loading) return <Loader full />;
  if (error) return <section className="page container"><Notice>{error}</Notice><Link to="/my-projects">Back to my projects</Link></section>;
  const { project, applications } = data;

  return (
    <section className="page container">
      <div className="page-head">
        <Link to="/my-projects" className="muted small">← My projects</Link>
        <h1>Applications</h1>
        <p className="muted">{project.title} · Budget {money(project.budget)} · <StatusBadge status={project.status} /></p>
      </div>
      <Notice type={msg.type || 'error'}>{msg.text}</Notice>

      {applications.length === 0 ? (
        <EmptyState icon="⏳" title="No applications yet" text="Freelancers will appear here as soon as they apply." />
      ) : (
        <div className="list">
          {applications.map((a) => (
            <article className="card app-card" key={a._id}>
              <div className="fc-head">
                <Avatar user={a.freelancerId} size={56} />
                <div>
                  <h3><Link to={`/freelancers/${a.freelancerId._id}`}>{a.freelancerId.name}</Link></h3>
                  <p className="muted small">{a.freelancerId.headline} · {a.freelancerId.experience} yr · {money(a.freelancerId.hourlyRate)}/hr</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <p className="pre">{a.proposal}</p>
              <div className="tags">{a.freelancerId.skills.slice(0, 5).map((s) => <span className="tag" key={s}>{s}</span>)}</div>
              <div className="card-foot">
                <div><strong className="price">{money(a.proposedBudget)}</strong><span className="muted small"> proposed · sent {fmtDate(a.createdAt)}</span></div>
                {a.status === 'pending' && project.status === 'open' && (
                  <div className="btn-group">
                    <button className="btn btn-ghost btn-sm" disabled={busyId === a._id} onClick={() => decide(a, 'rejected')}>Reject</button>
                    <button className="btn btn-primary btn-sm" disabled={busyId === a._id} onClick={() => decide(a, 'accepted')}>Accept and hire</button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
