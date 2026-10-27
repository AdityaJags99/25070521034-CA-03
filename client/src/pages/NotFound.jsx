import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="auth-page">
      <div className="center">
        <div className="big-404">404</div>
        <h1>This page wandered off</h1>
        <p className="muted">The page you are looking for does not exist or was moved.</p>
        <Link className="btn btn-primary" to="/">Back to home</Link>
      </div>
    </section>
  );
}
