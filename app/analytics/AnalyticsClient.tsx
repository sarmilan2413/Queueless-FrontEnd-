'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { analyticsApi } from '@/lib/api';
import type { HourlyEntry, SummaryStats } from '@/types';
import { fmtHour, STATUS_COLORS } from '@/lib/utils';
import { EmptyState, PageHeader, Spinner, StatCard, ToastProvider, toast } from '@/components/ui';

const CARD: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 16, padding: '1.75rem',
};

const CARD_TITLE: React.CSSProperties = {
  fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1.5rem',
};

const PIE_DATA_KEYS: Array<{ key: keyof Omit<SummaryStats, 'totalBookings'>; label: string }> = [
  { key: 'waiting', label: 'Waiting' },
  { key: 'serving', label: 'Serving' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export function AnalyticsClient() {
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [hourly, setHourly] = useState<HourlyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, hRes] = await Promise.all([
        analyticsApi.getSummary(),
        analyticsApi.getHourly(),
      ]);
      setSummary(sRes.data);
      setHourly(hRes.data);
    } catch {
      toast('Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const pieData = summary
    ? PIE_DATA_KEYS
        .map(({ key, label }) => ({ name: label, value: summary[key] ?? 0, color: STATUS_COLORS[key] }))
        .filter(d => d.value > 0)
    : [];

  const barData = hourly.map(e => ({
    hour: fmtHour(e.hour),
    bookings: e.totalBookings,
  }));

  return (
    <>
      <ToastProvider />
      <PageHeader title="Analytics" sub="Summary and volume data from all bookings" />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--muted)' }}>
          <Spinner size={28} />
        </div>
      ) : (
        <>
          {/* Stat row */}
          {summary && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              <StatCard label="Total" value={summary.totalBookings} accentColor="linear-gradient(90deg,var(--accent),var(--accent3))" />
              <StatCard label="Waiting" value={summary.waiting} accentColor="var(--waiting)" />
              <StatCard label="Serving" value={summary.serving} accentColor="var(--serving)" />
              <StatCard label="Completed" value={summary.completed} accentColor="var(--completed)" />
              <StatCard label="Cancelled" value={summary.cancelled} accentColor="var(--cancelled)" />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.5rem' }}>
            {/* Donut chart */}
            <div style={CARD}>
              <div style={CARD_TITLE}>Status Breakdown</div>
              {pieData.length === 0 ? (
                <EmptyState icon="📊" message="No booking data yet" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'var(--surface2)', border: '1px solid var(--border)',
                        borderRadius: 8, fontFamily: 'var(--font-sans)', fontSize: '0.82rem',
                        color: 'var(--text)',
                      }}
                      itemStyle={{ color: 'var(--text)' }}
                      formatter={(val: number, name: string) => [val, name]}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 600 }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Bar chart */}
            <div style={CARD}>
              <div style={CARD_TITLE}>Bookings by Hour</div>
              {barData.length === 0 ? (
                <EmptyState icon="📈" message="No hourly data yet" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="hour"
                      tick={{ fill: 'var(--muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                      axisLine={{ stroke: 'var(--border)' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'var(--muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(124,106,247,0.06)' }}
                      contentStyle={{
                        background: 'var(--surface2)', border: '1px solid var(--border)',
                        borderRadius: 8, fontFamily: 'var(--font-sans)', fontSize: '0.82rem',
                        color: 'var(--text)',
                      }}
                      formatter={(val: number) => [val, 'Bookings']}
                    />
                    <Bar dataKey="bookings" fill="url(#barGrad)" radius={[4, 4, 0, 0]}>
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Completion rate card */}
          {summary && summary.totalBookings > 0 && (
            <div style={{ ...CARD, marginTop: '1.5rem' }}>
              <div style={CARD_TITLE}>Completion Rate</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '3rem', fontWeight: 500, color: 'var(--completed)', letterSpacing: '-0.03em' }}>
                  {Math.round((summary.completed / summary.totalBookings) * 100)}%
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 10, background: 'var(--surface2)', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${(summary.completed / summary.totalBookings) * 100}%`,
                      background: 'linear-gradient(90deg, var(--completed), var(--accent3))',
                      borderRadius: 5, transition: 'width 0.8s ease',
                    }} />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                    {summary.completed} of {summary.totalBookings} bookings completed
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
