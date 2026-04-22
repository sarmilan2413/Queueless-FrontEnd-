'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  fontFamily: 'var(--font-sans)',
  fontSize: '0.9rem',
  padding: '0.72rem 1rem',
  borderRadius: 8,
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.2s',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--muted)',
  marginBottom: '0.4rem',
  display: 'block',
};

type Props = {
  id: string;
};

export function EditBookingClient({ id }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [form, setForm] = useState({
    customerName: '',
    email: '',
    serviceType: '',
    appointmentDate: '',
    appointmentTime: '',
  });

  useEffect(() => {
    let mounted = true;

    async function loadBooking() {
      setLoading(true);
      try {
        const res = await bookingsApi.findOne(id);
        if (!mounted) {
          return;
        }

        setBooking(res.data);
        setForm({
          customerName: res.data.customerName,
          email: res.data.email,
          serviceType: res.data.serviceType,
          appointmentDate: toDateInputValue(res.data.appointmentDate),
          appointmentTime: res.data.appointmentTime,
        });
      } catch (error: any) {
        toast(error.message ?? 'Failed to load booking', 'error');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadBooking();

    return () => {
      mounted = false;
    };
  }, [id]);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !form.customerName ||
      !form.email ||
      !form.serviceType ||
      !form.appointmentDate ||
      !form.appointmentTime
    ) {
      toast('Please fill in all fields', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await bookingsApi.update(id, {
        customerName: form.customerName,
        email: form.email,
        serviceType: form.serviceType,
        appointmentDate: new Date(form.appointmentDate).toISOString(),
        appointmentTime: form.appointmentTime,
      });
      setBooking(res.data);
      toast('Booking updated successfully');
    } catch (error: any) {
      toast(error.message ?? 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <ToastProvider />
      <PageHeader title="Edit Booking" sub="Update customer and appointment details" />

      {loading ? (
        <div
          style={{
            minHeight: 240,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--muted)',
            gap: '0.6rem',
          }}
        >
          <Spinner />
          <span>Loading booking...</span>
        </div>
      ) : !booking ? (
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '2rem',
            color: 'var(--muted)',
          }}
        >
          Booking not found.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem',
            alignItems: 'start',
          }}
        >
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: '2rem',
            }}
          >
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Customer Name</label>
                  <input
                    style={inputStyle}
                    value={form.customerName}
                    onChange={(e) => set('customerName', e.target.value)}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    style={inputStyle}
                    type="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Service Type</label>
                <select
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  value={form.serviceType}
                  onChange={(e) => set('serviceType', e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                >
                  <option value="">Select a service...</option>
                  {SERVICES.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Appointment Date</label>
                  <input
                    style={inputStyle}
                    type="date"
                    value={form.appointmentDate}
                    onChange={(e) => set('appointmentDate', e.target.value)}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Appointment Time</label>
                  <input
                    style={inputStyle}
                    type="time"
                    value={form.appointmentTime}
                    onChange={(e) => set('appointmentTime', e.target.value)}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                style={{
                  marginTop: '0.25rem',
                  padding: '0.85rem',
                  background: saving
                    ? 'var(--surface2)'
                    : 'linear-gradient(135deg, var(--accent), #9b8cf9)',
                  color: '#fff',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  letterSpacing: '0.03em',
                  border: 'none',
                  borderRadius: 8,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                {saving && <Spinner size={16} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.7rem',
            }}
          >
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
              }}
            >
              Booking Snapshot
            </div>
            <TokenChip token={booking.tokenNumber} />
            <StatusPill status={booking.status} />

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                marginTop: '0.6rem',
              }}
            >
              {[
                ['Customer', booking.customerName],
                ['Service', booking.serviceType],
                ['Date', fmtDate(booking.appointmentDate)],
                ['Time', booking.appointmentTime],
                ['Queue Position', booking.queuePosition > 0 ? `#${booking.queuePosition}` : '—'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.82rem',
                    padding: '0.4rem 0',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <span style={{ color: 'var(--muted)', fontWeight: 600 }}>{label}</span>
                  <span style={{ fontWeight: 700 }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.8rem', flexWrap: 'wrap' }}>
              <Link
                href="/live"
                style={{
                  padding: '0.55rem 1rem',
                  borderRadius: 7,
                  border: '1px solid var(--border)',
                  color: 'var(--muted)',
                  textDecoration: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                }}
              >
                Back to Live Queue
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function toDateInputValue(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
