import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import {
  Sun, Zap, Leaf, DollarSign, Plus, BarChart2,
  TrendingUp, Activity
} from 'lucide-react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import ForecastCard from '../components/ForecastCard';
import { getAuthUser } from '../lib/auth';
import { getDb } from '../lib/mongodb';

export async function getServerSideProps({ req }) {
  const user = await getAuthUser(req);
  if (!user) {
    return { redirect: { destination: '/', permanent: false } };
  }

  try {
    const db = await getDb();

    const forecasts = await db
      .collection('forecasts')
      .find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .limit(12)
      .toArray();

    const total = await db
      .collection('forecasts')
      .countDocuments({ userId: user.userId });

    // Aggregate stats
    let totalAnnualKwh = 0;
    let totalCo2 = 0;
    let totalSavings = 0;
    forecasts.forEach((f) => {
      totalAnnualKwh += f.results?.totalAnnualKwh || 0;
      totalCo2 += f.results?.co2OffsetKgPerYear || 0;
      totalSavings += f.results?.savingsPerYearUSD || 0;
    });

    return {
      props: {
        user: { id: user.userId, name: user.name, email: user.email },
        forecasts: forecasts.map((f) => ({
          id: f._id.toString(),
          title: f.title,
          location: f.location,
          date: f.date?.toISOString() || null,
          panelCount: f.panelCount,
          totalKwp: f.totalKwp,
          results: {
            totalDailyKwh: f.results?.totalDailyKwh || null,
            totalAnnualKwh: f.results?.totalAnnualKwh || null,
            peakOutputKw: f.results?.peakOutputKw || null,
            co2OffsetKgPerYear: f.results?.co2OffsetKgPerYear || null,
            savingsPerYearUSD: f.results?.savingsPerYearUSD || null,
          },
          createdAt: f.createdAt?.toISOString() || null,
        })),
        stats: {
          total,
          totalAnnualKwh: Math.round(totalAnnualKwh),
          totalCo2: Math.round(totalCo2),
          totalSavings: Math.round(totalSavings),
        },
      },
    };
  } catch (err) {
    console.error('Dashboard SSR error:', err);
    return {
      props: {
        user: { id: user.userId, name: user.name, email: user.email },
        forecasts: [],
        stats: { total: 0, totalAnnualKwh: 0, totalCo2: 0, totalSavings: 0 },
      },
    };
  }
}

export default function Dashboard({ user, forecasts: initial, stats }) {
  const router = useRouter();
  const [forecasts, setForecasts] = useState(initial);

  const handleDelete = async (id) => {
    if (!confirm('Delete this forecast?')) return;
    const res = await fetch(`/api/forecast/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setForecasts((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const statCards = [
    {
      label: 'Total Forecasts',
      value: stats.total,
      icon: BarChart2,
      color: '#f59e0b',
    },
    {
      label: 'Annual Energy',
      value: stats.totalAnnualKwh > 0 ? (stats.totalAnnualKwh / 1000).toFixed(1) : '0',
      unit: 'MWh',
      icon: Zap,
      color: '#fbbf24',
    },
    {
      label: 'CO₂ Offset',
      value: stats.totalCo2 > 0 ? (stats.totalCo2 / 1000).toFixed(1) : '0',
      unit: 'tonnes/yr',
      icon: Leaf,
      color: '#10b981',
    },
    {
      label: 'Est. Savings',
      value: stats.totalSavings > 0 ? `$${stats.totalSavings.toLocaleString()}` : '$0',
      icon: DollarSign,
      color: '#3b82f6',
    },
  ];

  return (
    <>
      <Head>
        <title>Dashboard — SolarForecast</title>
      </Head>
      <Layout user={user}>
        <div className="max-w-6xl mx-auto px-5 py-8">

          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <p
                className="text-xs font-mono tracking-widest mb-1.5"
                style={{ color: '#f59e0b', letterSpacing: '0.1em' }}
              >
                OVERVIEW
              </p>
              <h1
                className="text-2xl font-bold"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                Welcome back, {user.name.split(' ')[0]}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {stats.total > 0
                  ? `${stats.total} forecast${stats.total !== 1 ? 's' : ''} across your installations`
                  : 'Run your first solar forecast to get started'}
              </p>
            </div>
            <Link href="/forecast/new" className="btn-primary flex items-center gap-2">
              <Plus size={14} />
              New Forecast
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {statCards.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>

          {/* Forecasts */}
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-sm font-semibold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}
            >
              Recent Forecasts
            </h2>
            {forecasts.length > 0 && (
              <span
                className="badge badge-yellow"
              >
                {forecasts.length} shown
              </span>
            )}
          </div>

          {forecasts.length === 0 ? (
            /* Empty state */
            <div
              className="card flex flex-col items-center justify-center py-20 text-center"
              style={{ borderStyle: 'dashed' }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.2)',
                }}
              >
                <Sun size={24} color="#f59e0b" />
              </div>
              <p
                className="text-base font-semibold mb-1"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                No forecasts yet
              </p>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                Generate your first solar output prediction
              </p>
              <Link href="/forecast/new" className="btn-primary">
                Run First Forecast
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {forecasts.map((f) => (
                <ForecastCard key={f.id} forecast={f} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
