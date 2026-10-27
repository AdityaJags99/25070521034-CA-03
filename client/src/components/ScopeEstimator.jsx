import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { money } from '../utils/format';

const OPTIONS = [
  { key: 'Frontend', weeks: 1.5, cost: 600, skill: 'React' },
  { key: 'Backend API', weeks: 2, cost: 800, skill: 'Node.js' },
  { key: 'Database', weeks: 1, cost: 400, skill: 'MongoDB' },
  { key: 'Authentication', weeks: 0.5, cost: 250, skill: 'JWT' },
  { key: 'Payment gateway', weeks: 1, cost: 500, skill: 'Payments' },
  { key: 'Admin dashboard', weeks: 1.5, cost: 700, skill: 'Dashboards' },
  { key: 'Deployment', weeks: 0.5, cost: 200, skill: 'DevOps' },
];

export default function ScopeEstimator() {
  const [picked, setPicked] = useState(['Frontend', 'Backend API', 'Database']);
  const navigate = useNavigate();
  const chosen = OPTIONS.filter((o) => picked.includes(o.key));
  const weeks = chosen.reduce((s, o) => s + o.weeks, 0);
  const cost = chosen.reduce((s, o) => s + o.cost, 0);

  const toggle = (key) => setPicked((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));

  const send = () =>
    navigate('/post-project', {
      state: {
        title: 'Custom web app: ' + chosen.map((o) => o.key.toLowerCase()).join(', '),
        description: `Scope: ${chosen.map((o) => o.key).join(', ')}. Estimated timeline about ${Math.ceil(weeks)} weeks.`,
        requiredSkills: chosen.map((o) => o.skill),
        budget: cost,
      },
    });

  return (
    <div className="estimator">
      <fieldset>
        <legend>What does your project need?</legend>
        <div className="est-options">
          {OPTIONS.map((o) => (
            <label key={o.key} className={`est-opt ${picked.includes(o.key) ? 'on' : ''}`}>
              <input type="checkbox" checked={picked.includes(o.key)} onChange={() => toggle(o.key)} />
              <span>{o.key}</span>
              <small>{o.weeks} wk</small>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="est-output" aria-live="polite">
        <div className="est-line"><span>Estimated timeline</span><strong>{weeks ? `${Math.ceil(weeks)} weeks` : '-'}</strong></div>
        <div className="est-line"><span>Ballpark budget</span><strong>{cost ? `${money(Math.round(cost * 0.85))} - ${money(Math.round(cost * 1.2))}` : '-'}</strong></div>
        <p className="muted small">A rough guide for planning. Real proposals come from freelancers.</p>
        <button className="btn btn-primary btn-block" disabled={!chosen.length} onClick={send}>Post this scope as a project</button>
      </div>
    </div>
  );
}
