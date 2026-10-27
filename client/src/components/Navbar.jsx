import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import Avatar from './Avatar';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false); // mobile menu
  const [profileOpen, setProfileOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef(null);

  // close menus on navigation
  useEffect(() => { setMenuOpen(false); setProfileOpen(false); }, [location.pathname, location.hash]);

  // unread notification count (refreshed on every page change)
  useEffect(() => {
    if (!user) { setUnread(0); return; }
    api('/notifications').then((d) => setUnread(d.unread)).catch(() => {});
  }, [user, location.pathname]);

  useEffect(() => {
    const close = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const ctaTo = user ? (user.role === 'client' ? '/post-project' : '/projects') : '/register';
  const ctaText = user ? (user.role === 'client' ? 'Post a project' : 'Find work') : 'Get started';

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="logo" aria-label="FLEXI home"><span className="logo-mark">F</span>flexi</Link>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`} aria-label="Main">
          <Link to="/#services">Services</Link>
          <NavLink to="/freelancers">Freelancers</NavLink>
          <NavLink to="/projects">Projects</NavLink>
          <Link to="/#process">How it works</Link>
          <Link to="/#faq">FAQ</Link>
          {!user && (
            <div className="nav-mobile-auth">
              <Link className="btn btn-ghost" to="/login">Log in</Link>
              <Link className="btn btn-primary" to="/register">Sign up</Link>
            </div>
          )}
        </nav>

        <div className="nav-actions">
          <button className="icon-btn" onClick={toggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {user && (
            <button className="icon-btn bell" onClick={() => navigate('/dashboard')} aria-label={`Notifications: ${unread} unread`}>
              🔔{unread > 0 && <span className="bell-count">{unread}</span>}
            </button>
          )}

          {user ? (
            <div className="profile-menu" ref={profileRef}>
              <button className="profile-btn" onClick={() => setProfileOpen((o) => !o)} aria-expanded={profileOpen} aria-haspopup="menu">
                <Avatar user={user} size={34} />
                <span className="profile-name">{user.name.split(' ')[0]}</span>
              </button>
              {profileOpen && (
                <div className="dropdown" role="menu">
                  <div className="dropdown-head"><strong>{user.name}</strong><span className="muted small">{user.role}</span></div>
                  <Link to="/dashboard" role="menuitem">Dashboard</Link>
                  <Link to="/my-projects" role="menuitem">My projects</Link>
                  {user.role === 'freelancer' && <Link to="/my-applications" role="menuitem">My applications</Link>}
                  {user.role === 'client' && <Link to="/post-project" role="menuitem">Post a project</Link>}
                  <Link to="/edit-profile" role="menuitem">Edit profile</Link>
                  <button role="menuitem" onClick={() => { logout(); navigate('/'); }}>Log out</button>
                </div>
              )}
            </div>
          ) : (
            <Link className="btn btn-ghost nav-login" to="/login">Log in</Link>
          )}

          <Link className="btn btn-primary nav-cta" to={ctaTo}>{ctaText}</Link>
          <button className="icon-btn burger" onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={menuOpen}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </header>
  );
}
