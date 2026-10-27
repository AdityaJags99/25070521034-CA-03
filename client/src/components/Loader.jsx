export default function Loader({ full = false, text = 'Loading...' }) {
  return (
    <div className={full ? 'loader loader-full' : 'loader'} role="status" aria-live="polite">
      <span className="spinner" />
      <span>{text}</span>
    </div>
  );
}
