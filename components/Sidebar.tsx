'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Plus, BarChart2, Zap } from 'lucide-react';

const NAV = [
  { href: '/live', label: 'Live Queue', icon: LayoutDashboard },
  { href: '/book', label: 'New Booking', icon: Plus },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
];

export function Sidebar() {
  const path = usePathname() ?? '';

  return (
    <aside style={{
      width: 220,
      minWidth: 220,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      padding: '2rem 0',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.7rem',
        padding: '0 1.25rem 1.5rem 1.25rem',
      }}>
        <div style={{
          width: 34,
          height: 34,
          background: 'linear-gradient(135deg, var(--accent), var(--accent3))',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Zap size={17} color="#fff" fill="#fff" />
        </div>
        <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.03em' }}>
          Queue<span style={{ color: 'var(--accent)' }}>Less</span>
        </span>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', padding: '0 0.75rem' }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(href + '/');
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: '0.7rem',
              padding: '0.6rem 0.85rem',
              borderRadius: 8,
              fontSize: '0.875rem',
              fontWeight: active ? 700 : 500,
              color: active ? 'var(--text)' : 'var(--muted)',
              background: active ? 'var(--surface2)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.15s',
              border: active ? '1px solid var(--border)' : '1px solid transparent',
            }}>
              <Icon size={16} style={{ color: active ? 'var(--accent)' : 'var(--muted)', flexShrink: 0 }} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
