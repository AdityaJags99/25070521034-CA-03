import { useState } from 'react';

// Type a skill and press Enter (or comma) to add it as a removable tag.
export default function SkillInput({ id, skills, onChange, placeholder = 'Type a skill and press Enter' }) {
  const [text, setText] = useState('');

  const add = () => {
    const v = text.trim().replace(/,$/, '');
    if (v && !skills.some((s) => s.toLowerCase() === v.toLowerCase())) onChange([...skills, v]);
    setText('');
  };

  return (
    <div className="skill-input">
      <div className="tags">
        {skills.map((s) => (
          <span className="tag tag-removable" key={s}>
            {s}
            <button type="button" aria-label={`Remove ${s}`} onClick={() => onChange(skills.filter((x) => x !== s))}>×</button>
          </span>
        ))}
      </div>
      <input
        id={id} value={text} placeholder={placeholder}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }}
        onBlur={add}
      />
    </div>
  );
}
