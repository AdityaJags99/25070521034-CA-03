import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Field from '../components/Field';
import Notice from '../components/Notice';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'freelancer' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.name.trim().length < 2) return setError('Please enter your full name.');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Please enter a valid email address.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setBusy(true);
    try {
      await register(form);
      navigate('/edit-profile', { replace: true, state: { welcome: true } });
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  return (
    <section className="auth-page">
      <form className="card auth-card form" onSubmit={submit} noValidate>
        <h1>Create your account</h1>
        <p className="muted">Join FLEXI as a freelancer or a client.</p>
        <Notice>{error}</Notice>

        <fieldset className="role-pick">
          <legend>I want to</legend>
          <label className={form.role === 'freelancer' ? 'on' : ''}>
            <input type="radio" name="role" value="freelancer" checked={form.role === 'freelancer'} onChange={set('role')} />
            <strong>Find work</strong><span className="muted small">Freelancer account</span>
          </label>
          <label className={form.role === 'client' ? 'on' : ''}>
            <input type="radio" name="role" value="client" checked={form.role === 'client'} onChange={set('role')} />
            <strong>Hire talent</strong><span className="muted small">Client account</span>
          </label>
        </fieldset>

        <Field label="Full name" id="name"><input id="name" autoComplete="name" value={form.name} onChange={set('name')} /></Field>
        <Field label="Email" id="email"><input id="email" type="email" autoComplete="email" value={form.email} onChange={set('email')} /></Field>
        <Field label="Password" id="password" hint="At least 6 characters"><input id="password" type="password" autoComplete="new-password" value={form.password} onChange={set('password')} /></Field>
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Creating account...' : 'Create account'}</button>
        <p className="muted small center">Already registered? <Link to="/login">Log in</Link></p>
      </form>
    </section>
  );
}
