export default function StatCard({ label, value, icon, hint }) {
  return (
    <div className="stat-card">
      <span className="stat-icon" aria-hidden="true">{icon}</span>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {hint && <div className="stat-hint">{hint}</div>}
      </div>
    </div>
  );
}
