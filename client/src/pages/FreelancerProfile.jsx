import { Link, useParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import Loader from '../components/Loader';
import Notice from '../components/Notice';
import { fmtDate, money } from '../utils/format';

export default function FreelancerProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data, loading, error } = useFetch(`/freelancers/${id}`);

  if (loading) return <Loader full />;
  if (error) return <section className="page container"><Notice>{error}</Notice><Link to="/freelancers">Back to freelancers</Link></section>;
  const f = data.freelancer;

  return (
    <section className="page container profile-layout">
      <aside className="card profile-side">
        <Avatar user={f} size={110} />
        <h1>{f.name}</h1>
        <p className="muted">{f.headline || 'Freelancer'}</p>
        <span className={`dot-label avail-${f.availability}`}>{f.availability}</span>
        <dl className="facts">
          <div><dt>Hourly rate</dt><dd>{f.hourlyRate ? `${money(f.hourlyRate)}/hr` : 'On request'}</dd></div>
          <div><dt>Experience</dt><dd>{f.experience} years</dd></div>
          {f.location && <div><dt>Location</dt><dd>{f.location}</dd></div>}
          {f.education && <div><dt>Education</dt><dd>{f.education}</dd></div>}
          <div><dt>Member since</dt><dd>{fmtDate(f.createdAt)}</dd></div>
        </dl>

        {user?.role === 'client' ? (
          <>
            <a className="btn btn-primary btn-block" href={`mailto:${f.email}?subject=Project%20on%20FLEXI`}>Contact to hire</a>
            <Link className="btn btn-ghost btn-block" to="/post-project">Post a project</Link>
          </>
        ) : user ? (
          <p className="muted small">Only client accounts can contact freelancers.</p>
        ) : (
          <Link className="btn btn-primary btn-block" to="/login">Log in as client to hire</Link>
        )}
      </aside>

      <div className="profile-main">
        <div className="card"><h2>About</h2><p>{f.bio || 'This freelancer has not added a bio yet.'}</p></div>
        <div className="card"><h2>Skills</h2><div className="tags">{f.skills.length ? f.skills.map((s) => <span className="tag" key={s}>{s}</span>) : <span className="muted">No skills listed.</span>}</div></div>
        <div className="card">
          <h2>Portfolio</h2>
          {f.portfolio.length ? (
            <ul className="link-list">{f.portfolio.map((p) => <li key={p.url}><a href={p.url} target="_blank" rel="noreferrer">{p.title}</a><span className="muted small">{p.url}</span></li>)}</ul>
          ) : <p className="muted">No portfolio links yet.</p>}
        </div>
      </div>
    </section>
  );
}
