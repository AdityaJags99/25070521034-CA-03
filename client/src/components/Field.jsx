// A label + input wrapper so every form is accessible and consistent.
export default function Field({ label, id, hint, children }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && <small>{hint}</small>}
    </div>
  );
}
