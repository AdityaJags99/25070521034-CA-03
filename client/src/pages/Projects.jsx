import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import useDebounce from '../hooks/useDebounce';
import { qs } from '../services/api';
import ProjectCard from '../components/ProjectCard';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import Notice from '../components/Notice';
import EmptyState from '../components/EmptyState';
import { CATEGORIES } from '../utils/format';

export default function Projects() {
  const [params] = useSearchParams();
  const [f, setF] = useState({ q: params.get('q') || '', category: params.get('category') || '', skill: '', minBudget: '', maxBudget: '', sort: 'newest' });
  const [page, setPage] = useState(1);
  const debouncedQ = useDebounce(f.q);

  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setPage(1); };
  const { data, loading, error } = useFetch('/projects' + qs({ ...f, q: debouncedQ, page, limit: 9 }));

  return (
    <section className="page container">
      <div className="page-head"><h1>Browse projects</h1><p className="muted">Open projects from clients. Filter by category, skill and budget.</p></div>

      <div className="filters card">
        <div className="field"><label htmlFor="q">Keyword</label><input id="q" value={f.q} onChange={set('q')} placeholder="e.g. dashboard" /></div>
        <div className="field"><label htmlFor="category">Category</label>
          <select id="category" value={f.category} onChange={set('category')}><option value="">All categories</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div className="field"><label htmlFor="skill">Skill</label><input id="skill" value={f.skill} onChange={set('skill')} placeholder="e.g. React" /></div>
        <div className="field"><label htmlFor="minBudget">Min budget ($)</label><input id="minBudget" type="number" min="0" value={f.minBudget} onChange={set('minBudget')} /></div>
        <div className="field"><label htmlFor="maxBudget">Max budget ($)</label><input id="maxBudget" type="number" min="0" value={f.maxBudget} onChange={set('maxBudget')} /></div>
        <div className="field"><label htmlFor="sort">Sort by</label>
          <select id="sort" value={f.sort} onChange={set('sort')}><option value="newest">Newest</option><option value="budget-high">Budget: high to low</option><option value="budget-low">Budget: low to high</option><option value="deadline">Deadline: soonest</option></select></div>
      </div>

      {loading ? <Loader text="Loading projects..." /> : error ? <Notice>{error}</Notice> : data.projects.length === 0 ? (
        <EmptyState icon="📭" title="No projects match your filters" text="Try a different category or clear the budget range." />
      ) : (
        <>
          <p className="muted small">{data.total} open project{data.total === 1 ? '' : 's'}</p>
          <div className="grid grid-3">{data.projects.map((p) => <ProjectCard key={p._id} project={p} />)}</div>
          <Pagination page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}
    </section>
  );
}
