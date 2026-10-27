import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import Field from '../components/Field';
import Notice from '../components/Notice';
import Loader from '../components/Loader';
import SkillInput from '../components/SkillInput';
import { CATEGORIES } from '../utils/format';

// Used for both "Post a project" and "Edit project" (when the URL has an :id)
export default function PostProject() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const prefill = useLocation().state; // comes from the home page estimator
  const [form, setForm] = useState({
    title: prefill?.title || '', description: prefill?.description || '', category: CATEGORIES[0],
    requiredSkills: prefill?.requiredSkills || [], budget: prefill?.budget || '', deadline: '',
  });
  const [loading, setLoading] = useState(editing);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    if (!editing) return;
    api(`/projects/${id}`)
      .then(({ project: p }) => setForm({ title: p.title, description: p.description, category: p.category, requiredSkills: p.requiredSkills, budget: p.budget, deadline: p.deadline.slice(0, 10) }))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, editing]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.title.trim().length < 5) return setError('Title must be at least 5 characters.');
    if (form.description.trim().length < 20) return setError('Description must be at least 20 characters.');
    if (form.requiredSkills.length === 0) return setError('Add at least one required skill.');
    if (!(Number(form.budget) > 0)) return setError('Budget must be greater than 0.');
    if (!form.deadline || new Date(form.deadline) <= new Date()) return setError('Choose a deadline in the future.');
    setBusy(true);
    try {
      await api(editing ? `/projects/${id}` : '/projects', { method: editing ? 'PUT' : 'POST', body: form });
      navigate('/my-projects');
    } catch (err) { setError(err.message); }
    setBusy(false);
  };

  if (loading) return <Loader full />;
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  return (
    <section className="page container narrow">
      <div className="page-head"><h1>{editing ? 'Edit project' : 'Post a project'}</h1><p className="muted">Clear details bring better proposals.</p></div>
      <form className="card form" onSubmit={submit} noValidate>
        <Notice>{error}</Notice>
        <Field label="Project title" id="title"><input id="title" value={form.title} onChange={set('title')} placeholder="e.g. Build a landing page in React" /></Field>
        <Field label="Category" id="category"><select id="category" value={form.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Description" id="description"><textarea id="description" rows="6" value={form.description} onChange={set('description')} placeholder="What needs to be done? What does success look like?" /></Field>
        <Field label="Required skills" id="skills" hint="Press Enter after each skill"><SkillInput id="skills" skills={form.requiredSkills} onChange={(v) => setForm({ ...form, requiredSkills: v })} /></Field>
        <div className="form-row">
          <Field label="Budget ($)" id="budget"><input id="budget" type="number" min="1" value={form.budget} onChange={set('budget')} /></Field>
          <Field label="Deadline" id="deadline"><input id="deadline" type="date" min={tomorrow} value={form.deadline} onChange={set('deadline')} /></Field>
        </div>
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving...' : editing ? 'Save changes' : 'Publish project'}</button>
      </form>
    </section>
  );
}
