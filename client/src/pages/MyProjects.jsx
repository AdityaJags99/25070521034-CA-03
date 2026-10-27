import { useState } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import Notice from '../components/Notice';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import { fmtDate, money } from '../utils/format';

const TABS = [['', 'All'], ['open', 'Open'], ['in-progress', 'In progress'], ['completed', 'Completed'], ['cancelled', 'Cancelled']];

export default function MyProjects() {
  const { user } = useAuth();
  const isClient = user.role === 'client';
  const { data, loading, error, reload } = useFetch(isClient ? '/projects/mine' : '/projects/hired');
  const [tab, setTab] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });

  const changeStatus = async (p, status) => {
    if (!window.confirm(`Mark "${p.title}" as ${status}?`)) return;
    try { await api(`/projects/${p._id}`, { method: 'PUT', body: { status } }); setMsg({ type: 'success', text: `Project marked ${status}.` }); reload(); }
    catch (err) { setMsg({ type: 'error', text: err.message }); }
  };
  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.title}" and its applications? This cannot be undone.`)) return;
    try { await api(`/projects/${p._id}`, { method: 'DELETE' }); setMsg({ type: 'success', text: 'Project deleted.' }); reload(); }
    catch (err) { setMsg({ type: 'error', text: err.message }); }
  };

  const projects = (data?.projects || []).filter((p) => !tab || p.status === tab);

  return (
    <section className="page container">
      <div className="page-head row">
        <div><h1>My projects</h1><p className="muted">{isClient ? 'Projects you posted.' : 'Projects you were hired for.'}</p></div>
        {isClient && <Link className="btn btn-primary" to="/post-project">Post a project</Link>}
      </div>
      <div className="tabs" role="tablist">
        {TABS.map(([v, l]) => <button key={l} role="tab" aria-selected={tab === v} className={tab === v ? 'active' : ''} onClick={() => setTab(v)}>{l}</button>)}
      </div>
      <Notice type={msg.type || 'error'}>{msg.text}</Notice>

      {loading ? <Loader /> : error ? <Notice>{error}</Notice> : projects.length === 0 ? (
        <EmptyState icon="📁" title="Nothing here yet" text={isClient ? 'Post your first project to start receiving proposals.' : 'Projects you are hired for will show up here.'} actionTo={isClient ? '/post-project' : '/projects'} actionLabel={isClient ? 'Post a project' : 'Browse projects'} />
      ) : (
        <div className="list">
          {projects.map((p) => (
            <article className="card row-card" key={p._id}>
              <div>
                <div className="card-top"><StatusBadge status={p.status} /><span className="chip">{p.category}</span></div>
                <h3><Link to={`/projects/${p._id}`}>{p.title}</Link></h3>
                <p className="muted small">Budget {money(p.budget)} · Due {fmtDate(p.deadline)}
                  {isClient && p.hiredFreelancerId && <> · Hired: <strong>{p.hiredFreelancerId.name}</strong></>}
                  {!isClient && p.clientId && <> · Client: <strong>{p.clientId.company || p.clientId.name}</strong></>}
                </p>
              </div>
              {isClient && (
                <div className="row-side">
                  <Link className="btn btn-ghost btn-sm" to={`/projects/${p._id}/applications`}>Applications ({p.applicationCount})</Link>
                  <div className="btn-group">
                    {p.status === 'open' && <Link className="btn btn-ghost btn-sm" to={`/projects/${p._id}/edit`}>Edit</Link>}
                    {p.status === 'in-progress' && <button className="btn btn-primary btn-sm" onClick={() => changeStatus(p, 'completed')}>Mark completed</button>}
                    {(p.status === 'open' || p.status === 'in-progress') && <button className="btn btn-ghost btn-sm" onClick={() => changeStatus(p, 'cancelled')}>Cancel</button>}
                    {p.status !== 'in-progress' && <button className="btn btn-danger btn-sm" onClick={() => remove(p)}>Delete</button>}
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
