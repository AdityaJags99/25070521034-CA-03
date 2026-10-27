import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { CATEGORY_ICONS, fmtDate, money } from '../utils/format';

export default function ProjectCard({ project }) {
  return (
    <article className="card project-card">
      <div className="card-top">
        <span className="chip">{CATEGORY_ICONS[project.category]} {project.category}</span>
        <StatusBadge status={project.status} />
      </div>
      <h3><Link to={`/projects/${project._id}`}>{project.title}</Link></h3>
      <p className="clamp">{project.description}</p>
      <div className="tags">
        {project.requiredSkills.slice(0, 4).map((s) => <span className="tag" key={s}>{s}</span>)}
      </div>
      <div className="card-foot">
        <div>
          <strong className="price">{money(project.budget)}</strong>
          <span className="muted"> budget</span>
        </div>
        <div className="muted small">Due {fmtDate(project.deadline)}</div>
      </div>
      {project.clientId?.name && (
        <div className="muted small">Posted by {project.clientId.company || project.clientId.name}</div>
      )}
    </article>
  );
}
