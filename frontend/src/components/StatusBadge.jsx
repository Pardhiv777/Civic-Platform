const STATUS_CONFIG = {
  'Open':        { cls: 'badge-open',        dot: '🔴', label: 'Open' },
  'In Progress': { cls: 'badge-in-progress', dot: '🟡', label: 'In Progress' },
  'Resolved':    { cls: 'badge-resolved',    dot: '🟢', label: 'Resolved' },
};

const CATEGORY_CONFIG = {
  'Road':        { cls: 'badge-road',        icon: '🛣️' },
  'Water':       { cls: 'badge-water',       icon: '💧' },
  'Electricity': { cls: 'badge-electricity', icon: '⚡' },
  'Garbage':     { cls: 'badge-garbage',     icon: '🗑️' },
};

export const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['Open'];
  return (
    <span className={`badge ${config.cls}`}>
      <span style={{ fontSize: '0.65rem' }}>{config.dot}</span>
      {config.label}
    </span>
  );
};

export const CategoryBadge = ({ category }) => {
  const config = CATEGORY_CONFIG[category] || {};
  return (
    <span className={`badge ${config.cls || ''}`}>
      {config.icon} {category}
    </span>
  );
};
