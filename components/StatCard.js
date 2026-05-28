export default function StatCard({ label, value, unit, icon: Icon, color = '#f59e0b', trend }) {
  return (
    <div
      className="card p-5 relative overflow-hidden"
      style={{ borderColor: `rgba(${hexToRgb(color)},0.15)` }}
    >
      {/* Background glow */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-40 pointer-events-none"
        style={{ background: color }}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: `rgba(${hexToRgb(color)},0.12)`,
              border: `1px solid rgba(${hexToRgb(color)},0.2)`,
            }}
          >
            {Icon && <Icon size={16} color={color} />}
          </div>
          {trend !== undefined && (
            <span
              className="text-xs font-mono"
              style={{ color: trend >= 0 ? '#10b981' : '#ef4444' }}
            >
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="stat-number">{value ?? '—'}</span>
          {unit && (
            <span
              className="text-xs font-mono"
              style={{ color: 'var(--text-muted)' }}
            >
              {unit}
            </span>
          )}
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {label}
        </p>
      </div>
    </div>
  );
}

function hexToRgb(hex) {
  // Handle named colors approximately
  const map = {
    '#f59e0b': '245,158,11',
    '#10b981': '16,185,129',
    '#3b82f6': '59,130,246',
    '#8b5cf6': '139,92,246',
    '#ef4444': '239,68,68',
    '#06b6d4': '6,182,212',
  };
  return map[hex] || '245,158,11';
}
