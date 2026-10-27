import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import { money } from '../utils/format';

export default function FreelancerCard({ freelancer: f }) {
  return (
    <article className="card freelancer-card">
      <div className="fc-head">
        <Avatar user={f} size={60} />
        <div>
          <h3><Link to={`/freelancers/${f._id}`}>{f.name}</Link></h3>
          <p className="muted small">{f.headline || 'Freelancer'}</p>
        </div>
      </div>
      <div className="tags">
        {f.skills.slice(0, 4).map((s) => <span className="tag" key={s}>{s}</span>)}
      </div>
      <div className="card-foot">
        <div>
          <strong className="price">{f.hourlyRate ? `${money(f.hourlyRate)}/hr` : 'Rate on request'}</strong>
          <div className="muted small">{f.experience} yr experience</div>
        </div>
        <span className={`dot-label avail-${f.availability}`}>{f.availability}</span>
      </div>
      <Link className="btn btn-ghost btn-block" to={`/freelancers/${f._id}`}>View profile</Link>
    </article>
  );
}
