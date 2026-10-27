import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Counter from '../components/Counter';
import Accordion from '../components/Accordion';
import ScopeEstimator from '../components/ScopeEstimator';
import FreelancerCard from '../components/FreelancerCard';
import ProjectCard from '../components/ProjectCard';
import Loader from '../components/Loader';
import Notice from '../components/Notice';
import Field from '../components/Field';
import { CATEGORIES, CATEGORY_ICONS, money } from '../utils/format';

const LOGOS = ['Northwind', 'Lumen Labs', 'GreenCart', 'TechNova', 'Pixelforge', 'Orbit Cafe', 'Kiteworks', 'Bluepeak'];

const SERVICES = [
  { icon: '🧑‍💻', title: 'For freelancers', badge: 'Free to join', desc: 'Show your work, set your rate and get found by clients who need your exact skills.',
    list: ['Profile with skills and portfolio links', 'Your own hourly rate and availability', 'Proposals with your expected price', 'Track every application in one place'] },
  { icon: '🏢', title: 'For clients', badge: 'Post in 2 minutes', desc: 'Describe the work once and let qualified freelancers come to you.',
    list: ['Post a project with budget and deadline', 'Compare proposals side by side', 'Accept or reject with one click', 'Follow progress to completion'] },
  { icon: '🔎', title: 'Search that fits', badge: 'Instant filters', desc: 'Find people or projects by the things that matter, not by scrolling.',
    list: ['Filter by skill, rate and experience', 'Filter projects by category and budget', 'Sort by newest, price or deadline', 'Paged results that load quickly'] },
  { icon: '🔒', title: 'Safe by design', badge: 'Protected accounts', desc: 'Your data stays yours. Each role only sees and changes what it should.',
    list: ['Hashed passwords, never plain text', 'Token-based login sessions', 'Role-based access control', 'In-app hiring notifications'] },
];

const STEPS = [
  { title: 'Create your account', text: 'Sign up as a freelancer or a client and complete your profile in a few minutes.' },
  { title: 'Post or discover', text: 'Clients post projects. Freelancers browse, filter and find work that matches their skills.' },
  { title: 'Propose and decide', text: 'Freelancers send a proposal with a price. Clients review every proposal and choose.' },
  { title: 'Work and finish', text: 'The hired freelancer is notified, the project moves to In progress, then to Completed.' },
];

const STACK = [
  ['Frontend', ['React', 'React Router', 'JavaScript ES6+', 'CSS3', 'HTML5']],
  ['Backend', ['Node.js', 'Express', 'REST API', 'JWT', 'bcrypt']],
  ['Database', ['MongoDB', 'Mongoose', 'MongoDB Compass']],
  ['Tooling', ['Git', 'GitHub', 'Vite', 'Postman', 'VS Code']],
];

const REVIEWS = [
  { name: 'Meera Joshi', role: 'Founder', company: 'GreenCart Organics', quote: 'I posted a project in the evening and had three solid proposals by morning. Choosing was easy because prices and skills were right there.' },
  { name: 'Daniel Fernandes', role: 'Product Manager', company: 'TechNova Labs', quote: 'Filtering freelancers by skill and hourly rate saved us days. The hired developer shipped the dashboard two days early.' },
  { name: 'Ananya Rao', role: 'UI/UX Freelancer', company: 'Independent', quote: 'My profile now does the selling for me. I apply with a proposal and a price, and I can see exactly where each application stands.' },
];

const FAQ = [
  { q: 'How do payments and milestones work?', a: 'FLEXI connects you with the right person. The client and the freelancer agree on price and milestones in the proposal, for example half upfront and half on completion.' },
  { q: 'Who owns the finished work?', a: 'Ownership terms are agreed between the client and the freelancer before work starts. We recommend writing them into the proposal so both sides are clear.' },
  { q: 'What if the scope changes?', a: 'Open projects can be edited by their owner. For work already in progress, agree on changes and the updated price directly with the freelancer.' },
  { q: 'What happens after a project is completed?', a: 'The client marks the project as completed. It moves to the completed list for both sides, and the freelancer gets a notification.' },
  { q: 'How do we communicate?', a: 'After hiring, clients can contact the freelancer by the email shown on the freelancer profile. Most teams continue on Slack, Discord or Loom.' },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const stats = useFetch('/stats');
  const featured = useFetch('/freelancers?limit=4&sort=experience');
  const latest = useFetch('/projects?limit=3');
  const board = latest.data?.projects || [];
  const s = stats.data;

  const [searchType, setSearchType] = useState('projects');
  const [searchText, setSearchText] = useState('');
  const [form, setForm] = useState({ name: '', email: '', projectType: 'Full App', budgetRange: '$1k-$3k', summary: '' });
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // jump to #section links such as /#faq
  useEffect(() => {
    if (!location.hash) return undefined;
    const t = setTimeout(() => document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' }), 60);
    return () => clearTimeout(t);
  }, [location.hash]);

  const onSearch = (e) => {
    e.preventDefault();
    navigate(`/${searchType}${searchText ? `?q=${encodeURIComponent(searchText)}` : ''}`);
  };

  const sendContact = async (e) => {
    e.preventDefault();
    setSending(true); setMsg({ type: '', text: '' });
    try {
      const d = await api('/contact', { method: 'POST', body: form });
      setMsg({ type: 'success', text: d.message });
      setForm({ ...form, name: '', email: '', summary: '' });
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
    setSending(false);
  };

  const catCount = (name) => s?.categories.find((c) => c.name === name)?.count || 0;

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="pill"><span className="pulse" />{s ? `${s.openProjects} open projects right now` : 'Projects are open now'}</span>
            <h1>Hire the right freelancer. Or get hired for work you like.</h1>
            <p className="lead">FLEXI matches web, design, data and marketing talent with clients who have a budget and a deadline. Post in minutes, get proposals in hours.</p>

            <form className="hero-search" onSubmit={onSearch} role="search">
              <select aria-label="Search for" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                <option value="projects">Projects</option>
                <option value="freelancers">Freelancers</option>
              </select>
              <input aria-label="Search keywords" placeholder="Try React, logo design, SEO..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
              <button className="btn btn-primary" type="submit">Search</button>
            </form>

            <div className="hero-cta">
              <Link className="btn btn-primary btn-lg" to={user?.role === 'client' ? '/post-project' : '/register'}>Post a project</Link>
              <Link className="btn btn-ghost btn-lg" to="/projects">Find work</Link>
            </div>
            <p className="proof"><span className="stars" aria-hidden="true">★★★★★</span> Rated 4.9 by early users of the platform</p>
          </div>

          <aside className="board" aria-label="Latest open projects">
            <div className="board-head"><span className="pulse" /> Live project board</div>
            {latest.loading && <Loader text="Loading projects..." />}
            {!latest.loading && board.length === 0 && <p className="muted">No open projects yet. Be the first to post one.</p>}
            {board.map((p) => (
              <Link to={`/projects/${p._id}`} className="board-row" key={p._id}>
                <div>
                  <strong>{p.title}</strong>
                  <div className="muted small">{p.category} · {p.requiredSkills.slice(0, 2).join(', ')}</div>
                </div>
                <span className="price">{money(p.budget)}</span>
              </Link>
            ))}
            <Link className="board-more" to="/projects">See all open projects</Link>
          </aside>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="trust" aria-label="Platform numbers">
        <div className="logo-row" aria-hidden="true">
          <div className="logo-track">{[...LOGOS, ...LOGOS].map((l, i) => <span key={i}>{l}</span>)}</div>
        </div>
        <div className="container metrics">
          <div><strong><Counter value={s?.freelancers || 0} /></strong><span>Freelancers</span></div>
          <div><strong><Counter value={s?.openProjects || 0} /></strong><span>Open projects</span></div>
          <div><strong><Counter value={s?.completedProjects || 0} /></strong><span>Projects completed</span></div>
          <div><strong><Counter value={s?.applications || 0} /></strong><span>Proposals sent</span></div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section" id="categories">
        <div className="container">
          <div className="section-head"><h2>Popular categories</h2><p>Start with the kind of work you need or offer.</p></div>
          <div className="grid grid-4">
            {CATEGORIES.map((c) => (
              <Link to={`/projects?category=${encodeURIComponent(c)}`} className="card cat-card" key={c}>
                <span className="cat-icon" aria-hidden="true">{CATEGORY_ICONS[c]}</span>
                <h3>{c}</h3>
                <span className="muted small">{catCount(c)} open {catCount(c) === 1 ? 'project' : 'projects'}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section alt" id="services">
        <div className="container">
          <div className="section-head"><h2>Everything you need to hire or get hired</h2><p>One platform, two sides, no spreadsheets.</p></div>
          <div className="grid grid-4">
            {SERVICES.map((sv) => (
              <article className="card service-card" key={sv.title}>
                <span className="cat-icon" aria-hidden="true">{sv.icon}</span>
                <h3>{sv.title}</h3>
                <p className="muted">{sv.desc}</p>
                <ul className="checklist">{sv.list.map((l) => <li key={l}>{l}</li>)}</ul>
                <span className="badge badge-open">{sv.badge}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED FREELANCERS */}
      <section className="section" id="featured">
        <div className="container">
          <div className="section-head row">
            <div><h2>Featured freelancers</h2><p>Experienced people ready to start.</p></div>
            <Link className="btn btn-ghost" to="/freelancers">Browse all</Link>
          </div>
          {featured.loading ? <Loader /> : featured.error ? <Notice>{featured.error}</Notice> : (
            <div className="grid grid-4">
              {featured.data.freelancers.map((f) => <FreelancerCard key={f._id} freelancer={f} />)}
            </div>
          )}
        </div>
      </section>

      {/* LATEST PROJECTS */}
      <section className="section alt" id="latest">
        <div className="container">
          <div className="section-head row">
            <div><h2>Latest projects</h2><p>Fresh work, posted by real clients.</p></div>
            <Link className="btn btn-ghost" to="/projects">See all projects</Link>
          </div>
          {latest.loading ? <Loader /> : latest.error ? <Notice>{latest.error}</Notice> : (
            <div className="grid grid-3">{board.map((p) => <ProjectCard key={p._id} project={p} />)}</div>
          )}
        </div>
      </section>

      {/* ESTIMATOR */}
      <section className="section" id="estimator">
        <div className="container split">
          <div>
            <h2>Not sure what your project will cost?</h2>
            <p className="lead">Tick the parts you need and get a quick time and budget estimate. When it looks right, post it as a project with one click.</p>
          </div>
          <ScopeEstimator />
        </div>
      </section>

      {/* PROCESS */}
      <section className="section alt" id="process">
        <div className="container">
          <div className="section-head"><h2>How FLEXI works</h2><p>From sign-up to finished project in four steps.</p></div>
          <ol className="steps">
            {STEPS.map((st, i) => (
              <li key={st.title}><span className="step-num">{i + 1}</span><h3>{st.title}</h3><p className="muted">{st.text}</p></li>
            ))}
          </ol>
        </div>
      </section>

      {/* TECH */}
      <section className="section" id="stack">
        <div className="container">
          <div className="section-head"><h2>What FLEXI is built with</h2><p>A modern full-stack JavaScript (MERN) setup.</p></div>
          <div className="grid grid-4">
            {STACK.map(([title, items]) => (
              <div className="card" key={title}><h3>{title}</h3><div className="tags">{items.map((i) => <span className="tag" key={i}>{i}</span>)}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section alt" id="reviews">
        <div className="container">
          <div className="section-head"><h2>What people say</h2><p>Sample feedback from early testers.</p></div>
          <div className="grid grid-3">
            {REVIEWS.map((r) => (
              <figure className="card review" key={r.name}>
                <blockquote>“{r.quote}”</blockquote>
                <figcaption>
                  <span className="avatar avatar-fallback" style={{ width: 44, height: 44 }}>{r.name.split(' ').map((w) => w[0]).join('')}</span>
                  <div><strong>{r.name}</strong><div className="muted small">{r.role}, {r.company}</div></div>
                  <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label={`${r.name} on LinkedIn`} className="in-link">in</a>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="section" id="about">
        <div className="container split">
          <div>
            <h2>Why we built FLEXI</h2>
            <p className="lead">Good freelancers are hard to find, and good projects are hard to win. FLEXI keeps both sides simple: clear profiles, clear budgets, clear decisions.</p>
            <p className="muted">We believe in honest proposals, fair prices and fast replies. Every feature exists to remove one step between a good idea and the person who can build it.</p>
            <Link className="btn btn-primary" to="/register">Join FLEXI</Link>
          </div>
          <div className="about-stats">
            <div><strong><Counter value={s?.clients || 0} /></strong><span>Clients</span></div>
            <div><strong>{CATEGORIES.length}</strong><span>Categories</span></div>
            <div><strong>12 h</strong><span>Typical reply</span></div>
            <div><strong>100%</strong><span>Free to join</span></div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section alt" id="faq">
        <div className="container narrow">
          <div className="section-head"><h2>Frequently asked questions</h2></div>
          <Accordion items={FAQ} />
        </div>
      </section>

      {/* CONTACT */}
      <section className="section" id="contact">
        <div className="container split">
          <div>
            <h2>Tell us about your project</h2>
            <p className="lead">Not ready to post yet? Send a short note and we will reply within 12 hours.</p>
            <p className="muted">Email: hello@flexi.dev<br />Response time: within 12 hours</p>
          </div>
          <form className="card form" onSubmit={sendContact}>
            <Field label="Full name" id="c-name"><input id="c-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Email address" id="c-email"><input id="c-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <div className="form-row">
              <Field label="Project type" id="c-type">
                <select id="c-type" value={form.projectType} onChange={(e) => setForm({ ...form, projectType: e.target.value })}>
                  <option>MVP</option><option>Full App</option><option>Bug Fix</option><option>Retainer</option>
                </select>
              </Field>
              <Field label="Budget range" id="c-budget">
                <select id="c-budget" value={form.budgetRange} onChange={(e) => setForm({ ...form, budgetRange: e.target.value })}>
                  <option>Under $1k</option><option>$1k-$3k</option><option>$3k-$5k</option><option>$5k+</option>
                </select>
              </Field>
            </div>
            <Field label="Project summary" id="c-summary"><textarea id="c-summary" rows="4" required value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></Field>
            <Notice type={msg.type || 'error'}>{msg.text}</Notice>
            <button className="btn btn-primary btn-block" disabled={sending}>{sending ? 'Sending...' : 'Send project inquiry'}</button>
          </form>
        </div>
      </section>
    </>
  );
}
