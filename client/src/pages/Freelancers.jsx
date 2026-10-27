import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import useDebounce from '../hooks/useDebounce';
import { qs } from '../services/api';
import FreelancerCard from '../components/FreelancerCard';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import Notice from '../components/Notice';
import EmptyState from '../components/EmptyState';

export default function Freelancers() {
  const [params] = useSearchParams();
  const [f, setF] = useState({ q: params.get('q') || '', skill: '', minRate: '', maxRate: '', minExp: '', availability: '', sort: 'newest' });
  const [page, setPage] = useState(1);
  const debouncedQ = useDebounce(f.q);

  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setPage(1); };
  const { data, loading, error } = useFetch('/freelancers' + qs({ ...f, q: debouncedQ, page, limit: 9 }));

  return (
    <section className="page container">
      <div className="page-head"><h1>Find freelancers</h1><p className="muted">Search by name or skill, then narrow by rate and experience.</p></div>

      <div className="filters card">
        <div className="field"><label htmlFor="q">Name or skill</label><input id="q" value={f.q} onChange={set('q')} placeholder="e.g. React, Priya" /></div>
        <div className="field"><label htmlFor="skill">Exact skill</label><input id="skill" value={f.skill} onChange={set('skill')} placeholder="e.g. Figma" /></div>
        <div className="field"><label htmlFor="minRate">Min rate ($/hr)</label><input id="minRate" type="number" min="0" value={f.minRate} onChange={set('minRate')} /></div>
        <div className="field"><label htmlFor="maxRate">Max rate ($/hr)</label><input id="maxRate" type="number" min="0" value={f.maxRate} onChange={set('maxRate')} /></div>
        <div className="field"><label htmlFor="minExp">Experience</label>
          <select id="minExp" value={f.minExp} onChange={set('minExp')}><option value="">Any</option><option value="1">1+ years</option><option value="3">3+ years</option><option value="5">5+ years</option></select></div>
        <div className="field"><label htmlFor="availability">Availability</label>
          <select id="availability" value={f.availability} onChange={set('availability')}><option value="">Any</option><option value="available">Available</option><option value="busy">Busy</option></select></div>
        <div className="field"><label htmlFor="sort">Sort by</label>
          <select id="sort" value={f.sort} onChange={set('sort')}><option value="newest">Newest</option><option value="experience">Most experienced</option><option value="rate-asc">Rate: low to high</option><option value="rate-desc">Rate: high to low</option></select></div>
      </div>

      {loading ? <Loader text="Finding freelancers..." /> : error ? <Notice>{error}</Notice> : data.freelancers.length === 0 ? (
        <EmptyState icon="🔍" title="No freelancers match these filters" text="Try removing a filter or searching a different skill." />
      ) : (
        <>
          <p className="muted small">{data.total} freelancer{data.total === 1 ? '' : 's'} found</p>
          <div className="grid grid-3">{data.freelancers.map((x) => <FreelancerCard key={x._id} freelancer={x} />)}</div>
          <Pagination page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}
    </section>
  );
}
