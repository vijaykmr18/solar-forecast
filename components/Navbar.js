import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Sun, LayoutDashboard, Plus, LogOut, Menu, X } from 'lucide-react';

export default function Navbar({ user }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const nav = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/forecast/new', label: 'New Forecast', icon: Plus },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(7,7,9,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}
          >
            <Sun size={14} color="#f59e0b" />
          </div>
          <span
            className="text-sm font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            SolarForecast
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                color: router.pathname === href ? 'var(--solar-primary)' : 'var(--text-secondary)',
                background: router.pathname === href ? 'rgba(245,158,11,0.1)' : 'transparent',
                fontFamily: 'var(--font-display)',
              }}
            >
              <Icon size={13} />
              {label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.4), rgba(245,158,11,0.15))',
                border: '1px solid rgba(245,158,11,0.3)',
                color: '#f59e0b',
                fontFamily: 'var(--font-display)',
              }}
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {user?.name}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ef4444';
              e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <LogOut size={12} />
            Logout
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ color: 'var(--text-secondary)' }}
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden px-5 pb-4 pt-2 flex flex-col gap-1"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Icon size={14} />
              {label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-left"
            style={{ color: '#ef4444' }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
