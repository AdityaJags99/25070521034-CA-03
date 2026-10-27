import { useState } from 'react';

export default function Accordion({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="accordion">
      {items.map((it, i) => (
        <div className={`acc-item ${open === i ? 'open' : ''}`} key={it.q}>
          <h3>
            <button aria-expanded={open === i} aria-controls={`acc-${i}`} onClick={() => setOpen(open === i ? -1 : i)}>
              {it.q}<span className="acc-icon" aria-hidden="true">+</span>
            </button>
          </h3>
          <div className="acc-panel" id={`acc-${i}`} role="region"><p>{it.a}</p></div>
        </div>
      ))}
    </div>
  );
}
