import Navbar from './Navbar';

export default function Layout({ children, user }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Navbar user={user} />
      <main className="pt-14">{children}</main>
    </div>
  );
}
