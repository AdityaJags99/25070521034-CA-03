import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Link to="/" className="logo"><span className="logo-mark">F</span>flexi</Link>
          <p className="muted">Freelancing, made flexible. Hire skilled people or find work you enjoy.</p>
        </div>
        <div>
          <h4>Explore</h4>
          <Link to="/freelancers">Find freelancers</Link>
          <Link to="/projects">Browse projects</Link>
          <Link to="/register">Create account</Link>
        </div>
        <div>
          <h4>Company</h4>
          <Link to="/#process">How it works</Link>
          <Link to="/#faq">FAQ</Link>
          <Link to="/#contact">Contact</Link>
        </div>
        <div>
          <h4>Follow</h4>
          <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="https://x.com" target="_blank" rel="noreferrer">Twitter / X</a>
          <a href="https://discord.com" target="_blank" rel="noreferrer">Discord</a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 FLEXI. All rights reserved.</span>
        <span className="status-badge">Built with React, Node.js and MongoDB</span>
      </div>
    </footer>
  );
}
