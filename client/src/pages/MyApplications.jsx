import { useState } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import Loader from '../components/Loader';
import Notice from '../components/Notice';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import { fmtDate, money } from '../utils/format';

export default function MyApplications() {
  const [status, setStatus] = useState('');
  const { data, loading, error } = useFetch(`/applications/my?limit=100${status ? `&status=${status}` : ''}`);

  return (
    <section className="page container">
      <div className="page-head"><h1>My applications</h1><p className="muted">Every proposal you sent and where it stands.</p></div>
      <div className="tabs" role="tablist">
        {['', 'pending', 'accepted', 'rejected'].map((s) => (
          <button key={s} role="tab" aria-selected={status === s} className={status === s ? 'active' : ''} onClick={() => setStatus(s)}>{s ? s[0].toUpperCase() + s.slice(1) : 'All'}</button>
        ))}
      </div>

      {loading ? <Loader /> : error ? <Notice>{error}</Notice> : data.applications.length === 0 ? (
        <EmptyState icon="📨" title="No applications here yet" text="Browse open projects and send your first proposal." actionTo="/projects" actionLabel="Browse projects" />
      ) : (
        <div className="list">
          {data.applications.map((a) => (
            <article className="card row-card" key={a._id}>
              <div>
                <h3>{a.projectId ? <Link to={`/projects/${a.projectId._id}`}>{a.projectId.title}</Link> : 'Project removed'}</h3>
                <p className="muted small">{a.projectId?.clientId?.company || a.projectId?.clientId?.name} · Applied {fmtDate(a.createdAt)}</p>
                <p className="clamp">{a.proposal}</p>
              </div>
              <div className="row-side">
                <StatusBadge status={a.status} />
                <div><strong className="price">{money(a.proposedBudget)}</strong><div className="muted small">your price</div></div>
                {a.projectId && <div className="muted small">Budget {money(a.projectId.budget)}</div>}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
