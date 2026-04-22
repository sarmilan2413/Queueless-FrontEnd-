'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
import { queueApi, analyticsApi } from '@/lib/api';
import { fmtDate, fmtWait } from '@/lib/utils';
import type { Booking, BookingStatus, LiveQueueData, SummaryStats } from '@/types';
import {
  ActionButton, EmptyState, PageHeader, Spinner,
  StatCard, StatusPill, ToastProvider, TokenChip, toast,
} from '@/components/ui';

export function LiveQueueClient() {
  const [live, setLive] = useState<LiveQueueData | null>(null);
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [liveRes, statsRes] = await Promise.all([
        queueApi.getLive(),
        analyticsApi.getSummary(),
      ]);
      setLive(liveRes.data);
      setStats(statsRes.data);
    } catch {
      toast('Failed to load queue data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: BookingStatus) {
    setBusy(id);
    try {
      await queueApi.updateStatus(id, status);
      toast(`Marked as ${status}`);
      await load();
    } catch (e: any) {
      toast(e.message ?? 'Failed to update', 'error');
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <ToastProvider />
      <PageHeader
        title="Live Queue"
        sub="Real-time view of active bookings"
        action={
          <button
            onClick={load}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.45rem',
              padding: '0.55rem 1.1rem',
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--muted)', fontFamily: 'var(--font-sans)',
              fontSize: '0.8rem', fontWeight: 700, borderRadius: 8,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1,
              transition: 'border-color 0.15s',
            }}
          >
            {loading ? <Spinner size={14} /> : <RefreshCw size={14} />}
            Refresh
          </button>
        }
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Total Bookings" value={stats?.totalBookings ?? '—'} accentColor="linear-gradient(90deg,var(--accent),var(--accent3))" />
        <StatCard label="Waiting" value={stats?.waiting ?? '—'} accentColor="var(--waiting)" />
        <StatCard label="Serving" value={stats?.serving ?? '—'} accentColor="var(--serving)" />
        <StatCard label="Completed" value={stats?.completed ?? '—'} accentColor="var(--completed)" />
      </div>

      {/* Now serving banner */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem',
      }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          Active Queue
        </span>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.55rem',
          background: 'rgba(106,247,194,0.08)',
          border: '1px solid rgba(106,247,194,0.2)',
          padding: '0.4rem 1rem', borderRadius: 100,
          fontSize: '0.8rem', fontWeight: 600, color: 'var(--serving)',
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--serving)', animation: 'pulse 1.5s infinite', display: 'inline-block' }} />
          {live?.currentServingToken ? `Now Serving: ${live.currentServingToken}` : 'No one serving'}
          <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.5)}}`}</style>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['#', 'Token', 'Customer', 'Service', 'Appointment', 'Status', 'Wait', 'Actions'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '0.75rem 1rem',
                  fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: 'var(--muted)',
                  borderBottom: '1px solid var(--border)',
                  background: 'var(--surface2)',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--muted)' }}>
                  <Spinner /> <span style={{ marginLeft: '0.5rem' }}>Loading…</span>
                </td>
              </tr>
            ) : !live?.bookings.length ? (
              <tr>
                <td colSpan={8}>
                  <EmptyState icon="🎉" message="Queue is empty — all clear!" />
                </td>
              </tr>
            ) : (
              live.bookings.map((b: Booking) => (
                <QueueRow
                  key={b._id}
                  booking={b}
                  isBusy={busy === b._id}
                  onStatusChange={updateStatus}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function QueueRow({
  booking: b,
  isBusy,
  onStatusChange,
}: {
  booking: Booking;
  isBusy: boolean;
  onStatusChange: (id: string, status: BookingStatus) => void;
}) {
  return (
    <tr style={{ borderBottom: '1px solid rgba(37,37,53,0.6)', transition: 'background 0.12s' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(26,26,36,0.6)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <td style={{ padding: '0.85rem 1rem' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 24, height: 24, borderRadius: '50%',
          background: b.queuePosition === 1 ? 'rgba(124,106,247,0.15)' : 'var(--surface2)',
          color: b.queuePosition === 1 ? 'var(--accent)' : 'var(--muted)',
          fontSize: '0.72rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
        }}>
          {b.queuePosition}
        </span>
      </td>
      <td style={{ padding: '0.85rem 1rem' }}><TokenChip token={b.tokenNumber} /></td>
      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, fontSize: '0.88rem' }}>{b.customerName}</td>
      <td style={{ padding: '0.85rem 1rem', color: 'var(--muted)', fontSize: '0.82rem' }}>{b.serviceType}</td>
      <td style={{ padding: '0.85rem 1rem', color: 'var(--muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
        {fmtDate(b.appointmentDate)}<br />
        <span style={{ opacity: 0.6 }}>{b.appointmentTime}</span>
      </td>
      <td style={{ padding: '0.85rem 1rem' }}><StatusPill status={b.status} /></td>
      <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--muted)' }}>
        {fmtWait(b.estimatedWait)}
      </td>
      <td style={{ padding: '0.85rem 1rem' }}>
        {isBusy ? <Spinner size={14} /> : (
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <Link
              href={`/edit/${b._id}`}
              style={{
                padding: '0.28rem 0.65rem',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--muted)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                borderRadius: 5,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Edit
            </Link>
            {b.status === 'waiting' && (
              <ActionButton label="Serve" variant="serve" onClick={() => onStatusChange(b._id, 'serving')} />
            )}
            {b.status === 'serving' && (
              <ActionButton label="Done" variant="complete" onClick={() => onStatusChange(b._id, 'completed')} />
            )}
            {(b.status === 'waiting' || b.status === 'serving') && (
              <ActionButton label="Cancel" variant="cancel" onClick={() => onStatusChange(b._id, 'cancelled')} />
            )}
            {b.status === 'cancelled' && (
              <ActionButton label="Restore" variant="restore" onClick={() => onStatusChange(b._id, 'waiting')} />
            )}
          </div>
        )}
      </td>
    </tr>
  );
}
