import Head from 'next/head';
import Link from 'next/link';
import {
  ArrowLeft, MapPin, Calendar, Zap, Leaf,
  DollarSign, Sun, TrendingUp, Clock, Activity
} from 'lucide-react';
import Layout from '../../components/Layout';
import HourlyChart from '../../components/charts/HourlyChart';
import DailyChart from '../../components/charts/DailyChart';
import MonthlyChart from '../../components/charts/MonthlyChart';
import { getAuthUser } from '../../lib/auth';
import { getDb } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function getServerSideProps({ req, params }) {
  const user = await getAuthUser(req);
  if (!user) return { redirect: { destination: '/', permanent: false } };

  if (!ObjectId.isValid(params.id)) {
    return { notFound: true };
  }

  try {
    const db = await getDb();
    const doc = await db.collection('forecasts').findOne({
      _id: new ObjectId(params.id),
      userId: user.userId,
    });

    if (!doc) return { notFound: true };

    return {
      props: {
        user: { id: user.userId, name: user.name, email: user.email },
        forecast: {
          id: doc._id.toString(),
          title: doc.title,
          location: doc.location,
          date: doc.date?.toISOString() || null,
          panelCapacity: doc.panelCapacity,
          panelCount: doc.panelCount,
          efficiency: doc.efficiency,
          tiltAngle: doc.tiltAngle,
          azimuth: doc.azimuth,
          totalKwp: doc.totalKwp,
          results: doc.results || {},
          createdAt: doc.createdAt?.toISOString() || null,
        },
      },
    };
  } catch (err) {
    return { notFound: true };
  }
}

export default function ForecastDetail({ user, forecast }) {
  const r = forecast.results || {};
  const date = forecast.date ? new Date(forecast.date) : null;

  const metrics = [
    {
      icon: Zap,
      label: 'Daily Output',
      value: r.totalDailyKwh?.toFixed(1) || '—',
      unit: 'kWh',
      color: '#f59e0b',
    },
    {
      icon: TrendingUp,
      label: 'Annual Output',
      value: r.totalAnnualKwh ? (r.totalAnnualKwh / 1000).toFixed(1) : '—',
      unit: 'MWh/yr',
      color: '#fbbf24',
    },
    {
      icon: Activity,
      label: 'Peak Output',
      value: r.peakOutputKw?.toFixed(2) || '—',
      unit: 'kW',
      color: '#f59e0b',
    },
    {
      icon: Clock,
      label: 'Peak Hour',
      value: r.peakHour !== undefined ? `${r.peakHour}:00` : '—',
      unit: '',
      color: '#f59e0b',
    },
    {
      icon: Leaf,
      label: 'CO₂ Offset',
      value: r.co2OffsetKgPerYear
        ? (r.co2OffsetKgPerYear / 1000).toFixed(2)
        : '—',
      unit: 'tonnes/yr',
      color: '#10b981',
    },
    {
      icon: DollarSign,
      label: 'Est. Savings',
      value: r.savingsPerYearUSD ? `$${Math.round(r.savingsPerYearUSD).toLocaleString()}` : '—',
      unit: '/yr',
      color: '#3b82f6',
    },
    {
      icon: Sun,
      label: 'Capacity Factor',
      value: r.capacityFactor ? (r.capacityFactor * 100).toFixed(1) : '—',
      unit: '%',
      color: '#f59e0b',
    },
    {
      icon: Activity,
      label: 'Performance Ratio',
      value: r.performanceRatio ? (r.performanceRatio * 100).toFixed(0) : '—',
      unit: '%',
      color: '#8b5cf6',
    },
  ];

  const ChartSection = ({ title, subtitle, children }) => (
    <div className="card p-5 mb-4">
      <div className="mb-4">
        <h3
          className="text-sm font-semibold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          {title}
        </h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
      </div>
      {children}
    </div>
  );

  return (
    <>
      <Head>
        <title>{forecast.title} — SolarForecast</title>
      </Head>
      <Layout user={user}>
        <div className="max-w-5xl mx-auto px-5 py-8">

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-3">
              <Link
                href="/dashboard"
                className="p-2 rounded-xl mt-0.5 transition-all"
                style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)';
                  e.currentTarget.style.color = '#f59e0b';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                <ArrowLeft size={14} />
              </Link>
              <div>
                <p
                  className="text-xs font-mono tracking-widest mb-1"
                  style={{ color: '#f59e0b', letterSpacing: '0.1em' }}
                >
                  FORECAST REPORT
                </p>
                <h1
                  className="text-xl font-bold mb-1.5"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
                >
                  {forecast.title}
                </h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <span
                    className="flex items-center gap-1 text-xs"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <MapPin size={11} /> {forecast.location}
                  </span>
                  {date && (
                    <span
                      className="flex items-center gap-1 text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <Calendar size={11} />{' '}
                      {date.toLocaleDateString('en', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </span>
                  )}
                  <span className="badge badge-yellow">
                    {forecast.panelCount} panels · {forecast.totalKwp?.toFixed(1)} kWp
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* System specs bar */}
          <div
            className="rounded-2xl px-5 py-3 mb-6 flex gap-6 flex-wrap"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border)',
            }}
          >
            {[
              { label: 'Panel Wattage', value: `${forecast.panelCapacity} Wp` },
              { label: 'Efficiency', value: `${forecast.efficiency}%` },
              { label: 'Tilt', value: `${forecast.tiltAngle}°` },
              { label: 'Azimuth', value: `${forecast.azimuth}°` },
              { label: 'System kWp', value: `${forecast.totalKwp?.toFixed(2)} kWp` },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <p
                  className="text-sm font-semibold"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="card p-4"
                style={{ borderColor: `rgba(255,255,255,0.06)` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <m.icon size={12} color={m.color} />
                  <span
                    className="text-xs"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.04em', textTransform: 'uppercase' }}
                  >
                    {m.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-xl font-bold"
                    style={{ fontFamily: 'var(--font-display)', color: m.color }}
                  >
                    {m.value}
                  </span>
                  {m.unit && (
                    <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {m.unit}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <ChartSection
              title="Hourly Output"
              subtitle={`Power generation curve for ${date?.toLocaleDateString('en', { month: 'long', day: 'numeric' }) || 'selected date'}`}
            >
              <HourlyChart data={r.hourly} peakHour={r.peakHour} />
            </ChartSection>

            <ChartSection
              title="Monthly Generation"
              subtitle="Estimated kWh per month across the year"
            >
              <MonthlyChart data={r.monthly} />
            </ChartSection>
          </div>

          <ChartSection
            title="30-Day Output Forecast"
            subtitle="Daily energy generation with weather variation"
          >
            <DailyChart data={r.daily} />
          </ChartSection>

          {/* AI Summary */}
          {r.summary && (
            <div
              className="card p-5"
              style={{ borderColor: 'rgba(245,158,11,0.15)', background: 'rgba(245,158,11,0.03)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sun size={13} color="#f59e0b" />
                <span
                  className="text-xs font-semibold tracking-widest uppercase"
                  style={{ fontFamily: 'var(--font-display)', color: '#f59e0b' }}
                >
                  AI Analysis
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {r.summary}
              </p>
            </div>
          )}

        </div>
      </Layout>
    </>
  );
}
