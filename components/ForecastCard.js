import Link from 'next/link';
import { MapPin, Calendar, Zap, ChevronRight, Trash2 } from 'lucide-react';

export default function ForecastCard({ forecast, onDelete }) {
  const date = new Date(forecast.date);
  const kwh = forecast.results?.totalDailyKwh?.toFixed(1) || '—';
  const annual = forecast.results?.totalAnnualKwh
    ? (forecast.results.totalAnnualKwh / 1000).toFixed(1) + ' MWh'
    : '—';

  return (
    <div
      className="card group relative overflow-hidden"
      style={{ transition: 'all 0.2s ease' }}
    >
      {/* Top accent bar */}
      <div
        className="h-px w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(245,158,11,0.4), transparent)',
        }}
      />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3
              className="text-sm font-semibold mb-0.5 truncate"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              {forecast.title}
            </h3>
            <div className="flex items-center gap-3">
              <span
                className="flex items-center gap-1 text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                <MapPin size={10} />
                {forecast.location}
              </span>
              <span
                className="flex items-center gap-1 text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                <Calendar size={10} />
                {date.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete?.(forecast.id);
            }}
            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ef4444';
              e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>

        {/* Stats row */}
        <div
          className="flex items-center gap-4 py-3 px-3 rounded-xl mb-3"
          style={{ background: 'rgba(255,255,255,0.025)' }}
        >
          <div>
            <div
              className="text-lg font-bold"
              style={{ fontFamily: 'var(--font-display)', color: '#f59e0b' }}
            >
              {kwh}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              kWh/day
            </div>
          </div>
          <div
            className="w-px h-8 self-center"
            style={{ background: 'var(--border)' }}
          />
          <div>
            <div
              className="text-lg font-bold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              {annual}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Annual
            </div>
          </div>
          <div
            className="w-px h-8 self-center"
            style={{ background: 'var(--border)' }}
          />
          <div>
            <div
              className="text-sm font-bold"
              style={{ fontFamily: 'var(--font-display)', color: '#10b981' }}
            >
              {forecast.panelCount}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Panels
            </div>
          </div>
        </div>

        <Link
          href={`/forecast/${forecast.id}`}
          className="flex items-center justify-between w-full text-xs px-3 py-2 rounded-lg transition-all"
          style={{
            color: 'var(--solar-primary)',
            background: 'rgba(245,158,11,0.06)',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(245,158,11,0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(245,158,11,0.06)';
          }}
        >
          <span>View Full Report</span>
          <ChevronRight size={13} />
        </Link>
      </div>
    </div>
  );
}
