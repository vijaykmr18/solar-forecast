import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import {
  MapPin, Calendar, Zap, Settings2, ArrowLeft,
  Loader2, Sun, CheckCircle2, AlertCircle
} from 'lucide-react';
import Layout from '../../components/Layout';
import { getAuthUser } from '../../lib/auth';

export async function getServerSideProps({ req }) {
  const user = await getAuthUser(req);
  if (!user) return { redirect: { destination: '/', permanent: false } };
  return { props: { user: { id: user.userId, name: user.name, email: user.email } } };
}

const PRESETS = [
  { label: 'Residential (5kW)', panelCapacity: 400, panelCount: 12, efficiency: 21, tiltAngle: 30 },
  { label: 'Commercial (20kW)', panelCapacity: 400, panelCount: 50, efficiency: 22, tiltAngle: 25 },
  { label: 'Utility (100kW)', panelCapacity: 500, panelCount: 200, efficiency: 23, tiltAngle: 20 },
];

export default function NewForecast({ user }) {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1=form, 2=loading, 3=done, 4=error
  const [error, setError] = useState('');
  const [savedId, setSavedId] = useState(null);

  const [form, setForm] = useState({
    location: '',
    date: new Date().toISOString().split('T')[0],
    panelCapacity: 400,
    panelCount: 10,
    efficiency: 20,
    tiltAngle: 30,
    azimuth: 180,
    title: '',
  });

  const totalKwp = ((form.panelCapacity * form.panelCount * form.efficiency) / 100 / 1000).toFixed(2);

  const applyPreset = (preset) => {
    setForm((prev) => ({ ...prev, ...preset }));
  };

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.location.trim()) {
      setError('Please enter a location.');
      return;
    }
    setError('');
    setStep(2);

    try {
      // 1. Generate with AI
      const genRes = await fetch('/api/forecast/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: form.location,
          date: form.date,
          panelCapacity: Number(form.panelCapacity),
          panelCount: Number(form.panelCount),
          efficiency: Number(form.efficiency),
          tiltAngle: Number(form.tiltAngle),
          azimuth: Number(form.azimuth),
        }),
      });

      const genData = await genRes.json();
      if (!genRes.ok) throw new Error(genData.error || 'AI generation failed');

      // 2. Save to DB
      const saveRes = await fetch('/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title || `${form.location} – ${new Date(form.date).toLocaleDateString()}`,
          location: form.location,
          date: form.date,
          panelCapacity: Number(form.panelCapacity),
          panelCount: Number(form.panelCount),
          efficiency: Number(form.efficiency),
          tiltAngle: Number(form.tiltAngle),
          azimuth: Number(form.azimuth),
          results: genData.results,
        }),
      });

      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.error || 'Failed to save');

      setSavedId(saveData.id);
      setStep(3);
    } catch (err) {
      setError(err.message);
      setStep(4);
    }
  };

  const SectionLabel = ({ icon: Icon, text }) => (
    <div className="flex items-center gap-2 mb-4">
      <div
        className="w-6 h-6 rounded-lg flex items-center justify-center"
        style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
      >
        <Icon size={12} color="#f59e0b" />
      </div>
      <span
        className="text-xs font-semibold tracking-widest uppercase"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}
      >
        {text}
      </span>
    </div>
  );

  return (
    <>
      <Head>
        <title>New Forecast — SolarForecast</title>
      </Head>
      <Layout user={user}>
        <div className="max-w-2xl mx-auto px-5 py-8">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl transition-all"
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
              <h1
                className="text-xl font-bold"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                New Solar Forecast
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Configure your panel system and generate AI predictions
              </p>
            </div>
          </div>

          {/* Loading state */}
          {step === 2 && (
            <div className="card p-10 flex flex-col items-center gap-5 text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}
              >
                <Loader2 size={24} color="#f59e0b" className="animate-spin" />
              </div>
              <div>
                <h2
                  className="text-base font-semibold mb-1"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Generating Forecast…
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  AI is modelling solar irradiance, weather patterns, and system parameters for{' '}
                  <strong style={{ color: '#f59e0b' }}>{form.location}</strong>
                </p>
              </div>
              <div className="flex gap-1.5">
                {['Fetching climate data', 'Modelling irradiance', 'Computing output'].map(
                  (label, i) => (
                    <span key={label} className="badge badge-yellow text-xs" style={{ animationDelay: `${i * 0.3}s` }}>
                      {label}
                    </span>
                  )
                )}
              </div>
            </div>
          )}

          {/* Success state */}
          {step === 3 && (
            <div className="card p-10 flex flex-col items-center gap-5 text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}
              >
                <CheckCircle2 size={24} color="#10b981" />
              </div>
              <div>
                <h2
                  className="text-base font-semibold mb-1"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Forecast Ready
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Your solar output forecast has been generated and saved.
                </p>
              </div>
              <div className="flex gap-3">
                <Link href={`/forecast/${savedId}`} className="btn-primary">
                  View Report
                </Link>
                <Link href="/dashboard" className="btn-ghost">
                  Dashboard
                </Link>
              </div>
            </div>
          )}

          {/* Error state */}
          {step === 4 && (
            <div className="card p-8 flex flex-col items-center gap-4 text-center mb-6">
              <AlertCircle size={24} color="#ef4444" />
              <div>
                <h2
                  className="text-base font-semibold mb-1"
                  style={{ fontFamily: 'var(--font-display)', color: '#ef4444' }}
                >
                  Generation Failed
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{error}</p>
              </div>
              <button className="btn-ghost" onClick={() => setStep(1)}>
                Try Again
              </button>
            </div>
          )}

          {/* Form */}
          {step === 1 && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Presets */}
              <div>
                <p className="label mb-2">Quick Presets</p>
                <div className="flex gap-2 flex-wrap">
                  {PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className="px-3 py-1.5 rounded-lg text-xs transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-display)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)';
                        e.currentTarget.style.color = '#f59e0b';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location & Date */}
              <div className="card p-5">
                <SectionLabel icon={MapPin} text="Location & Date" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="label">Installation Location *</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Bangalore, India"
                      value={form.location}
                      onChange={set('location')}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Forecast Date</label>
                    <input
                      type="date"
                      className="input-field"
                      value={form.date}
                      onChange={set('date')}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Forecast Title (optional)</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Rooftop System"
                      value={form.title}
                      onChange={set('title')}
                    />
                  </div>
                </div>
              </div>

              {/* Panel Config */}
              <div className="card p-5">
                <SectionLabel icon={Zap} text="Panel Configuration" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Panel Wattage (Wp)</label>
                    <input
                      type="number"
                      className="input-field"
                      min={100}
                      max={700}
                      step={10}
                      value={form.panelCapacity}
                      onChange={set('panelCapacity')}
                    />
                  </div>
                  <div>
                    <label className="label">Number of Panels</label>
                    <input
                      type="number"
                      className="input-field"
                      min={1}
                      max={10000}
                      value={form.panelCount}
                      onChange={set('panelCount')}
                    />
                  </div>
                  <div>
                    <label className="label">Panel Efficiency (%)</label>
                    <input
                      type="number"
                      className="input-field"
                      min={10}
                      max={30}
                      step={0.1}
                      value={form.efficiency}
                      onChange={set('efficiency')}
                    />
                  </div>
                  <div>
                    <label className="label">System kWp</label>
                    <div
                      className="input-field flex items-center"
                      style={{ cursor: 'default', background: 'rgba(245,158,11,0.05)', color: '#f59e0b', fontFamily: 'var(--font-mono)' }}
                    >
                      {totalKwp} kWp
                    </div>
                  </div>
                </div>
              </div>

              {/* Mounting */}
              <div className="card p-5">
                <SectionLabel icon={Settings2} text="Mounting Parameters" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Tilt Angle (°)</label>
                    <input
                      type="number"
                      className="input-field"
                      min={0}
                      max={90}
                      value={form.tiltAngle}
                      onChange={set('tiltAngle')}
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      0° = flat, 90° = vertical. ~30° optimal.
                    </p>
                  </div>
                  <div>
                    <label className="label">Azimuth (°)</label>
                    <input
                      type="number"
                      className="input-field"
                      min={0}
                      max={360}
                      value={form.azimuth}
                      onChange={set('azimuth')}
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      180° = South-facing (optimal N. hemisphere)
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
              )}

              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                <Sun size={14} />
                Generate Solar Forecast
              </button>
            </form>
          )}
        </div>
      </Layout>
    </>
  );
}
