export const CATEGORIES = [
  'Web Development', 'Mobile Apps', 'UI/UX Design', 'Graphic Design',
  'Writing & Translation', 'Digital Marketing', 'Data & AI', 'Video & Animation',
];

export const CATEGORY_ICONS = {
  'Web Development': '💻', 'Mobile Apps': '📱', 'UI/UX Design': '🎨', 'Graphic Design': '🖌️',
  'Writing & Translation': '✍️', 'Digital Marketing': '📈', 'Data & AI': '🧠', 'Video & Animation': '🎬',
};

export const money = (n) => `$${Number(n || 0).toLocaleString()}`;

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

export const ago = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
};

export const STATUS_LABELS = {
  open: 'Open', 'in-progress': 'In progress', completed: 'Completed', cancelled: 'Cancelled',
  pending: 'Pending', accepted: 'Accepted', rejected: 'Rejected',
  available: 'Available', busy: 'Busy', unavailable: 'Unavailable',
};
