import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Sun, Zap, TrendingUp, Shield, Eye, EyeOff } from 'lucide-react';
import { getAuthUser } from '../lib/auth';

export async function getServerSideProps({ req }) {
  const user = await getAuthUser(req);
  if (user) {
    return { redirect: { destination: '/dashboard', permanent: false } };
  }
  return { props: {} };
}

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = tab === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Zap, text: 'AI-powered solar output forecasting' },
    { icon: TrendingUp, text: 'Hourly, daily & annual projections' },
    { icon: Shield, text: 'CO₂ offset & savings analysis' },
  ];

  return (
    <>
      <Head>
        <title>SolarForecast — Solar Power Output Prediction</title>
        <meta name="description" content="AI-powered solar energy forecasting platform" />
      </Head>

      <div
        className="min-h-screen flex grid-bg"
        style={{ background: 'var(--bg-base)' }}
      >
        {/* Left panel */}
        <div className="hidden lg:flex flex-col justify-between w-[52%] p-12 relative overflow-hidden">
          {/* Background orbs */}
          <div
            className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full opacity-10 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />

          {/* Logo */}
          <div className="flex items-center gap-3 relative">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'rgba(245,158,11,0.15)',
                border: '1px solid rgba(245,158,11,0.3)',
              }}
            >
              <Sun size={18} color="#f59e0b" />
            </div>
            <span
              className="text-base font-semibold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              SolarForecast
            </span>
          </div>

          {/* Hero text */}
          <div className="relative">
            <p
              className="text-xs font-mono mb-4 tracking-widest"
              style={{ color: '#f59e0b', letterSpacing: '0.12em' }}
            >
              SOLAR ENERGY INTELLIGENCE
            </p>
            <h1
              className="text-5xl font-bold leading-tight mb-6"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--text-primary)',
                lineHeight: '1.1',
              }}
            >
              Predict your
              <br />
              <span style={{ color: '#f59e0b' }}>solar output</span>
              <br />
              with precision.
            </h1>
            <p
              className="text-base mb-8 max-w-sm leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              ML-powered forecasting for solar panels. Get hourly predictions, annual
              energy estimates, and ROI analysis — in seconds.
            </p>

            {/* Features */}
            <div className="flex flex-col gap-3">
              {features.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: 'rgba(245,158,11,0.1)',
                      border: '1px solid rgba(245,158,11,0.2)',
                    }}
                  >
                    <Icon size={11} color="#f59e0b" />
                  </div>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom stats */}
          <div className="flex gap-8 relative">
            {[
              { val: '35%', label: 'Noise Reduction' },
              { val: '18%', label: 'RMSE Improvement' },
              { val: '99.9%', label: 'Uptime SLA' },
            ].map(({ val, label }) => (
              <div key={label}>
                <div
                  className="text-2xl font-bold"
                  style={{ fontFamily: 'var(--font-display)', color: '#f59e0b' }}
                >
                  {val}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel – auth form */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div
            className="w-full max-w-sm"
            style={{ animation: 'fadeUp 0.5s ease both' }}
          >
            {/* Mobile logo */}
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <Sun size={20} color="#f59e0b" />
              <span
                className="text-base font-semibold"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                SolarForecast
              </span>
            </div>

            {/* Tab switcher */}
            <div
              className="flex p-1 rounded-xl mb-6"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}
            >
              {['login', 'register'].map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(''); }}
                  className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    fontFamily: 'var(--font-display)',
                    background: tab === t ? 'rgba(245,158,11,0.15)' : 'transparent',
                    color: tab === t ? '#f59e0b' : 'var(--text-muted)',
                    border: tab === t ? '1px solid rgba(245,158,11,0.25)' : '1px solid transparent',
                  }}
                >
                  {t === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {tab === 'register' && (
                <div>
                  <label className="label">Full Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Jane Smith"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
              )}

              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder={tab === 'register' ? 'Min. 8 characters' : '••••••••'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPass(!showPass)}
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  className="text-sm px-4 py-2.5 rounded-xl"
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    color: '#ef4444',
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary w-full mt-1 flex items-center justify-center gap-2"
                disabled={loading}
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? (
                  <>
                    <span
                      className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black/80 animate-spin"
                    />
                    <span>{tab === 'login' ? 'Signing in…' : 'Creating account…'}</span>
                  </>
                ) : (
                  <span>{tab === 'login' ? 'Sign In' : 'Get Started'}</span>
                )}
              </button>
            </form>

            <p
              className="text-xs text-center mt-5"
              style={{ color: 'var(--text-muted)' }}
            >
              {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError(''); }}
                className="underline"
                style={{ color: 'var(--solar-primary)' }}
              >
                {tab === 'login' ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
