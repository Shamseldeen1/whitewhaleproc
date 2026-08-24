import Link from 'next/link';
import { ReactNode } from 'react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Suppliers', href: '/dashboard' },
  { label: 'Components', href: '/dashboard' },
  { label: 'Orders', href: '/dashboard' },
];

export default function Layout({ children, title = 'White Whale Procurement' }: { children: ReactNode; title?: string }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">WW</div>
          <div>
            <h1>White Whale</h1>
            <p>Procurement System</p>
          </div>
        </div>
        <nav className="nav-list">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div>
            <h2>{title}</h2>
            <p>Enterprise procurement operations</p>
          </div>
        </header>
        <section className="page-content">{children}</section>
      </main>
    </div>
  );
}
