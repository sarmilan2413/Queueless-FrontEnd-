'use client';

import { cn, STATUS_COLORS } from '@/lib/utils';
import type { BookingStatus } from '@/types';
import { useEffect, useRef } from 'react';

/* ── StatusPill ───────────────────────────────────────────────── */
export function StatusPill({ status }: { status: BookingStatus }) {
  const color = STATUS_COLORS[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
      padding: '0.22rem 0.65rem',
      borderRadius: 100,
      fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
      background: `${color}18`,
      color,
      border: `1px solid ${color}30`,
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0,
        animation: status === 'serving' ? 'pulse 1.5s infinite' : undefined,
      }} />
      {status}
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.5)} }
      `}</style>
    </span>
  );
}

/* ── TokenChip ────────────────────────────────────────────────── */
export function TokenChip({ token }: { token: string }) {
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 500,
      background: 'var(--surface2)', border: '1px solid var(--border)',
      padding: '0.18rem 0.55rem', borderRadius: 4, letterSpacing: '0.06em',
    }}>
      {token}
    </span>
  );
}

/* ── StatCard ─────────────────────────────────────────────────── */
export function StatCard({
  label, value, accentColor,
}: { label: string; value: number | string; accentColor: string }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '1.25rem 1.5rem',
      position: 'relative', overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accentColor }} />
      <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.5rem' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.4rem', fontWeight: 500, letterSpacing: '-0.03em', color: accentColor }}>
        {value}
      </div>
    </div>
  );
}

/* ── Spinner ──────────────────────────────────────────────────── */
export function Spinner({ size = 18 }: { size?: number }) {
  return (
    <>
      <span style={{
        display: 'inline-block', width: size, height: size,
        border: '2px solid var(--border)', borderTopColor: 'var(--accent)',
        borderRadius: '50%', animation: 'spin 0.6s linear infinite', verticalAlign: 'middle',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

/* ── Toast ────────────────────────────────────────────────────── */
let _showToast: ((msg: string, type?: 'success' | 'error') => void) | null = null;

export function toast(msg: string, type: 'success' | 'error' = 'success') {
  _showToast?.(msg, type);
}

export function ToastProvider() {
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    _showToast = (msg, type = 'success') => {
      if (!ref.current) return;
      ref.current.textContent = msg;
      if (type === 'error') {
        ref.current.style.background = 'rgba(247,106,106,0.12)';
        ref.current.style.border = '1px solid rgba(247,106,106,0.25)';
        ref.current.style.color = 'var(--danger)';
      } else {
        ref.current.style.background = 'rgba(106,247,194,0.12)';
        ref.current.style.border = '1px solid rgba(106,247,194,0.25)';
        ref.current.style.color = 'var(--accent3)';
      }
      ref.current.style.opacity = '1';
      ref.current.style.transform = 'translateY(0)';
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (ref.current) {
          ref.current.style.opacity = '0';
          ref.current.style.transform = 'translateY(16px)';
        }
      }, 3500);
    };
    return () => { _showToast = null; };
  }, []);

  return (
    <div ref={ref} style={{
      position: 'fixed', bottom: '2rem', right: '2rem',
      padding: '0.75rem 1.2rem', borderRadius: 10,
      fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 600,
      zIndex: 9999, maxWidth: 340,
      opacity: 0, transform: 'translateY(16px)',
      transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      pointerEvents: 'none',
      background: 'rgba(106,247,194,0.12)',
      border: '1px solid rgba(106,247,194,0.25)',
      color: 'var(--accent3)',
    }} />
  );
}

/* ── PageHeader ───────────────────────────────────────────────── */
export function PageHeader({ title, sub, action }: {
  title: string; sub?: string; action?: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.15 }}>{title}</h1>
        {sub && <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.3rem' }}>{sub}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

/* ── EmptyState ───────────────────────────────────────────────── */
export function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--muted)' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.4 }}>{icon}</div>
      <p style={{ fontSize: '0.875rem' }}>{message}</p>
    </div>
  );
}

/* ── ActionButton ─────────────────────────────────────────────── */
export function ActionButton({
  label, variant = 'default', onClick, disabled,
}: {
  label: string;
  variant?: 'default' | 'serve' | 'complete' | 'cancel' | 'restore' | 'danger';
  onClick: () => void;
  disabled?: boolean;
}) {
  const colors: Record<string, { color: string; bg: string; border: string }> = {
    default:   { color: 'var(--muted)',     bg: 'transparent',              border: 'var(--border)' },
    serve:     { color: 'var(--serving)',   bg: 'rgba(106,247,194,0.08)',    border: 'rgba(106,247,194,0.3)' },
    complete:  { color: 'var(--completed)', bg: 'rgba(124,106,247,0.08)',    border: 'rgba(124,106,247,0.3)' },
    cancel:    { color: 'var(--cancelled)', bg: 'rgba(247,106,106,0.08)',    border: 'rgba(247,106,106,0.3)' },
    restore:   { color: 'var(--waiting)',   bg: 'rgba(247,194,106,0.08)',    border: 'rgba(247,194,106,0.3)' },
    danger:    { color: 'var(--cancelled)', bg: 'rgba(247,106,106,0.06)',    border: 'rgba(247,106,106,0.2)' },
  };
  const c = colors[variant] ?? colors.default;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '0.28rem 0.65rem',
        border: `1px solid ${c.border}`,
        background: c.bg,
        color: c.color,
        fontFamily: 'var(--font-sans)',
        fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        borderRadius: 5,
        opacity: disabled ? 0.4 : 1,
        transition: 'opacity 0.15s, transform 0.1s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}
