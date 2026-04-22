'use client';

import { useState } from 'react';
import { bookingsApi } from '@/lib/api';
import type { Booking } from '@/types';
import { PageHeader, Spinner, StatusPill, ToastProvider, TokenChip, toast } from '@/components/ui';
import { fmtDate } from '@/lib/utils';

const SERVICES = [
  'General Consultation',
  'Account Opening',
  'Loan Application',
  'Document Submission',
  'Technical Support',
  'Bill Payment',
  'Other',
];

const inputStyle: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)',
  color: 'var(--text)', fontFamily: 'var(--font-sans)', fontSize: '0.9rem',
  padding: '0.72rem 1rem', borderRadius: 8, outline: 'none',
  width: '100%', transition: 'border-color 0.2s',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.4rem',
  display: 'block',
};

export function BookingFormClient() {
  const [form, setForm] = useState({
    customerName: '',
    email: '',
    serviceType: '',
    appointmentDate: '',
    appointmentTime: '',
  });
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<Booking | null>(null);

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { customerName, email, serviceType, appointmentDate, appointmentTime } = form;
    if (!customerName || !email || !serviceType || !appointmentDate || !appointmentTime) {
      toast('Please fill in all fields', 'error'); return;
    }
    setLoading(true);
    try {
      const res = await bookingsApi.create({
        customerName,
        email,
        serviceType,
        appointmentDate: new Date(appointmentDate).toISOString(),
        appointmentTime,
        status: 'waiting',
      });
      setCreated(res.data);
      setForm({ customerName: '', email: '', serviceType: '', appointmentDate: '', appointmentTime: '' });
      toast(`Token ${res.data.tokenNumber} created!`);
    } catch (e: any) {
      toast(e.message ?? 'Booking failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ToastProvider />
      <PageHeader
        title="New Booking"
        sub="Register a customer and generate their queue token"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Form card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Customer Name</label>
                <input style={inputStyle} value={form.customerName} placeholder="Jane Doe"
                  onChange={e => set('customerName', e.target.value)}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} type="email" value={form.email} placeholder="jane@example.com"
                  onChange={e => set('email', e.target.value)}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Service Type</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.serviceType}
                onChange={e => set('serviceType', e.target.value)}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              >
                <option value="">Select a service…</option>
                {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Appointment Date</label>
                <input style={inputStyle} type="date" value={form.appointmentDate}
                  onChange={e => set('appointmentDate', e.target.value)}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
              <div>
                <label style={labelStyle}>Appointment Time</label>
                <input style={inputStyle} type="time" value={form.appointmentTime}
                  onChange={e => set('appointmentTime', e.target.value)}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.25rem', padding: '0.85rem',
                background: loading ? 'var(--surface2)' : 'linear-gradient(135deg, var(--accent), #9b8cf9)',
                color: '#fff', fontFamily: 'var(--font-sans)', fontSize: '0.9rem',
                fontWeight: 700, letterSpacing: '0.03em',
                border: 'none', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'opacity 0.2s, transform 0.15s',
              }}
            >
              {loading && <Spinner size={16} />}
              {loading ? 'Creating…' : 'Generate Token & Book'}
            </button>
          </form>
        </div>

        {/* Token result / placeholder */}
        <div style={{
          background: created ? 'rgba(106,247,194,0.04)' : 'var(--surface)',
          border: `1px solid ${created ? 'rgba(106,247,194,0.2)' : 'var(--border)'}`,
          borderRadius: 16, padding: '2rem',
          minHeight: 260,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', gap: '0.75rem',
          transition: 'all 0.4s ease',
        }}>
          {created ? (
            <>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                Token Issued
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '3.5rem', fontWeight: 500,
                color: 'var(--serving)', letterSpacing: '0.1em', lineHeight: 1,
              }}>
                {created.tokenNumber}
              </div>
              <StatusPill status={created.status} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem', width: '100%' }}>
                {[
                  ['Customer', created.customerName],
                  ['Service', created.serviceType],
                  ['Date', fmtDate(created.appointmentDate)],
                  ['Time', created.appointmentTime],
                  ['Queue Position', `#${created.queuePosition}`],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--muted)', fontWeight: 600 }}>{label}</span>
                    <span style={{ fontWeight: 700 }}>{val}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setCreated(null)}
                style={{
                  marginTop: '0.5rem', padding: '0.55rem 1.2rem',
                  background: 'transparent', border: '1px solid var(--border)',
                  color: 'var(--muted)', fontFamily: 'var(--font-sans)',
                  fontSize: '0.78rem', fontWeight: 700, borderRadius: 7, cursor: 'pointer',
                }}
              >
                New Booking
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: '3rem', opacity: 0.2 }}>🎟</div>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem', maxWidth: 200 }}>
                Fill out the form to generate a queue token
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
