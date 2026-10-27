import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import Notice from '../components/Notice';
import Field from '../components/Field';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import { fmtDate, money } from '../utils/format';

export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data, loading, error } = useFetch(`/projects/${id}`);
  const mine = useFetch(user?.role === 'freelancer' ? '/applications/my?limit=100' : null);
  const [form, setForm] = useState({ proposal: '', proposedBudget: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);
  const [applied, setApplied] = useState(false);

  if (loading) return <Loader full />;
  if (error) return <section className="page container"><Notice>{error}</Notice><Link to="/projects">Back to projects</Link></section>;
  const p = data.project;
  const isOwner = user?.role === 'client' && p.clientId?._id === user._id;
  const existing = mine.data?.applications.find((a) => a.projectId?._id === p._id);

  const apply = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    if (form.proposal.trim().length < 20) return setMsg({ type: 'error', text: 'Your proposal needs at least 20 characters.' });
    if (!(Number(form.proposedBudget) > 0)) return setMsg({ type: 'error', text: 'Enter your expected price (greater than 0).' });
    setBusy(true);
    try {
      await api('/applications', { method: 'POST', body: { projectId: p._id, ...form } });
      setApplied(true);
      setMsg({ type: 'success', text: 'Application sent! You can track it under My applications.' });
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
    setBusy(false);
  };

  return (
    <section className="page container detail-layout">
      <div className="detail-main">
        <div className="card">
          <div className="card-top"><span className="chip">{p.category}</span><StatusBadge status={p.status} /></div>
          <h1>{p.title}</h1>
          <p className="pre">{p.description}</p>
          <h2>Skills required</h2>
          <div className="tags">{p.requiredSkills.map((s) => <span className="tag" key={s}>{s}</span>)}</div>
        </div>

        {user?.role === 'freelancer' && p.status === 'open' && (
          <form className="card form" onSubmit={apply}>
            <h2>Apply for this project</h2>
            {existing || applied ? (
              <Notice type="info">You have already applied{existing ? ` (status: ${existing.status})` : ''}. <Link to="/my-applications">View my applications</Link></Notice>
            ) : (
              <>
                <Field label="Your proposal" id="proposal" hint="Explain why you are a good fit (min 20 characters)"><textarea id="proposal" rows="6" value={form.proposal} onChange={(e) => setForm({ ...form, proposal: e.target.value })} /></Field>
                <Field label="Expected price ($)" id="price"><input id="price" type="number" min="1" value={form.proposedBudget} onChange={(e) => setForm({ ...form, proposedBudget: e.target.value })} /></Field>
                <Notice type={msg.type || 'error'}>{msg.text}</Notice>
                <button className="btn btn-primary" disabled={busy}>{busy ? 'Sending...' : 'Send application'}</button>
              </>
            )}
            {(existing || applied) && msg.text && <Notice type={msg.type}>{msg.text}</Notice>}
          </form>
        )}
        {!user && p.status === 'open' && <div className="card"><p>Want to apply? <Link to="/login">Log in</Link> or <Link to="/register">create a freelancer account</Link>.</p></div>}
        {user?.role === 'client' && !isOwner && <div className="card"><p className="muted">Only freelancer accounts can apply to projects.</p></div>}
      </div>

      <aside className="card detail-side">
        <dl className="facts">
          <div><dt>Budget</dt><dd className="price">{money(p.budget)}</dd></div>
          <div><dt>Deadline</dt><dd>{fmtDate(p.deadline)}</dd></div>
          <div><dt>Posted</dt><dd>{fmtDate(p.createdAt)}</dd></div>
        </dl>
        <div className="client-box">
          <Avatar user={p.clientId} size={44} />
          <div><strong>{p.clientId?.company || p.clientId?.name}</strong><div className="muted small">{p.clientId?.name}{p.clientId?.location ? ` · ${p.clientId.location}` : ''}</div></div>
        </div>
        {isOwner && (
          <>
            <Link className="btn btn-primary btn-block" to={`/projects/${p._id}/applications`}>Review applications</Link>
            {p.status === 'open' && <Link className="btn btn-ghost btn-block" to={`/projects/${p._id}/edit`}>Edit project</Link>}
          </>
        )}
      </aside>
    </section>
  );
}
