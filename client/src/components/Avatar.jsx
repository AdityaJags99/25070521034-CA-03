import { useState } from 'react';

// Shows the profile picture, or the user's initials when there is none.
export default function Avatar({ user, size = 48 }) {
  const [broken, setBroken] = useState(false);
  const initials = (user?.name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  if (user?.profilePicture && !broken) {
    return <img className="avatar" style={{ width: size, height: size }} src={user.profilePicture} alt={user.name} onError={() => setBroken(true)} />;
  }
  return (
    <span className="avatar avatar-fallback" style={{ width: size, height: size, fontSize: size * 0.38 }} aria-label={user?.name}>
      {initials}
    </span>
  );
}
