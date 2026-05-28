import Head from 'next/head';
import Link from 'next/link';
import { Sun } from 'lucide-react';

export default function Custom404() {
  return (
    <>
      <Head><title>404 — SolarForecast</title></Head>
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ background: 'var(--bg-base)' }}
      >
        <Sun size={32} color="#f59e0b" className="mb-4 opacity-50" />
        <h1
          className="text-4xl font-bold mb-2"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          404
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          This page doesn't exist.
        </p>
        <Link href="/dashboard" className="btn-primary">
          Go to Dashboard
        </Link>
      </div>
    </>
  );
}
