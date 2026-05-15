// Generate a color from a string (for avatars)
export const stringToColor = (str) => {
  const colors = [
    '#6366f1', '#8b5cf6', '#a78bfa', '#ec4899',
    '#f43f5e', '#10b981', '#14b8a6', '#06b6d4',
    '#0ea5e9', '#f59e0b', '#ef4444', '#84cc16',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Format date
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Format relative time
export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count > 0) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
};

// Check if a date is overdue
export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

// Get status color class
export const getStatusBadge = (status) => {
  switch (status) {
    case 'To Do': return 'badge-info';
    case 'In Progress': return 'badge-warning';
    case 'Done': return 'badge-success';
    default: return 'badge-primary';
  }
};

// Get priority color class
export const getPriorityBadge = (priority) => {
  switch (priority) {
    case 'High': return 'badge-danger';
    case 'Medium': return 'badge-warning';
    case 'Low': return 'badge-success';
    default: return 'badge-primary';
  }
};
