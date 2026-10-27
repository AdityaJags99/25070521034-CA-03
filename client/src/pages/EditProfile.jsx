import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Field from '../components/Field';
import Notice from '../components/Notice';
import SkillInput from '../components/SkillInput';
import Avatar from '../components/Avatar';

export default function EditProfile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const welcome = useLocation().state?.welcome;
  const isFreelancer = user.role === 'freelancer';

  const [form, setForm] = useState({
    name: user.name, profilePicture: user.profilePicture || '', bio: user.bio || '', location: user.location || '',
    headline: user.headline || '', experience: user.experience ?? 0, education: user.education || '',
    hourlyRate: user.hourlyRate ?? 0, availability: user.availability || 'available',
    skills: user.skills || [], portfolio: user.portfolio?.length ? user.portfolio.map(({ title, url }) => ({ title, url })) : [],
    company: user.company || '',
  });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const setLink = (i, key, value) => setForm({ ...form, portfolio: form.portfolio.map((p, idx) => (idx === i ? { ...p, [key]: value } : p)) });

  const submit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    if (form.name.trim().length < 2) return setMsg({ type: 'error', text: 'Please enter your name.' });
    setBusy(true);
    try {
      const body = isFreelancer ? form : { name: form.name, profilePicture: form.profilePicture, bio: form.bio, location: form.location, company: form.company };
      const d = await api('/freelancers/profile', { method: 'PUT', body });
      setUser(d.user);
      setMsg({ type: 'success', text: 'Profile saved.' });
      if (welcome) setTimeout(() => navigate('/dashboard'), 700);
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
    setBusy(false);
  };

  return (
    <section className="page container narrow">
      <div className="page-head"><h1>{welcome ? 'Welcome to FLEXI! Set up your profile' : 'Edit profile'}</h1>
        <p className="muted">{isFreelancer ? 'A complete profile gets noticed by clients.' : 'Tell freelancers who you are.'}</p></div>

      <form className="card form" onSubmit={submit} noValidate>
        <div className="fc-head"><Avatar user={{ ...user, profilePicture: form.profilePicture }} size={72} /><div><strong>{user.email}</strong><div className="muted small">{user.role} account</div></div></div>
        <Notice type={msg.type || 'error'}>{msg.text}</Notice>

        <div className="form-row">
          <Field label="Full name" id="name"><input id="name" value={form.name} onChange={set('name')} /></Field>
          <Field label="Location" id="location"><input id="location" value={form.location} onChange={set('location')} /></Field>
        </div>
        <Field label="Profile picture URL" id="pic" hint="Link to an image, starting with https://"><input id="pic" value={form.profilePicture} onChange={set('profilePicture')} placeholder="https://..." /></Field>

        {isFreelancer ? (
          <>
            <Field label="Professional headline" id="headline"><input id="headline" value={form.headline} onChange={set('headline')} placeholder="e.g. React Developer" /></Field>
            <Field label="Bio" id="bio"><textarea id="bio" rows="5" value={form.bio} onChange={set('bio')} /></Field>
            <Field label="Skills" id="skills" hint="Press Enter after each skill"><SkillInput id="skills" skills={form.skills} onChange={(v) => setForm({ ...form, skills: v })} /></Field>
            <div className="form-row">
              <Field label="Experience (years)" id="exp"><input id="exp" type="number" min="0" max="60" value={form.experience} onChange={set('experience')} /></Field>
              <Field label="Hourly rate ($)" id="rate"><input id="rate" type="number" min="0" value={form.hourlyRate} onChange={set('hourlyRate')} /></Field>
              <Field label="Availability" id="avail"><select id="avail" value={form.availability} onChange={set('availability')}><option value="available">Available</option><option value="busy">Busy</option><option value="unavailable">Unavailable</option></select></Field>
            </div>
            <Field label="Education" id="edu"><input id="edu" value={form.education} onChange={set('education')} placeholder="e.g. B.Tech Computer Science" /></Field>

            <fieldset className="links-edit">
              <legend>Portfolio links</legend>
              {form.portfolio.map((p, i) => (
                <div className="form-row link-row" key={i}>
                  <input aria-label="Link title" placeholder="Title" value={p.title} onChange={(e) => setLink(i, 'title', e.target.value)} />
                  <input aria-label="Link URL" placeholder="https://..." value={p.url} onChange={(e) => setLink(i, 'url', e.target.value)} />
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({ ...form, portfolio: form.portfolio.filter((_, x) => x !== i) })}>Remove</button>
                </div>
              ))}
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({ ...form, portfolio: [...form.portfolio, { title: '', url: '' }] })}>+ Add link</button>
            </fieldset>
          </>
        ) : (
          <>
            <Field label="Company" id="company"><input id="company" value={form.company} onChange={set('company')} /></Field>
            <Field label="About you" id="bio"><textarea id="bio" rows="5" value={form.bio} onChange={set('bio')} /></Field>
          </>
        )}
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving...' : 'Save profile'}</button>
      </form>
    </section>
  );
}
