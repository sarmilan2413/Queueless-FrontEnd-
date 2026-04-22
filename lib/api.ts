import type {
  ApiResponse,
  Booking,
  BookingStatus,
  CreateBookingPayload,
  HourlyEntry,
  LiveQueueData,
  QueueStatusData,
  SummaryStats,
} from '@/types';

const DEFAULT_API_URL = 'https://queueless-backend.onrender.com';
const BASE = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/$/, '');

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  const contentType = res.headers.get('content-type') || '';
  const raw = await res.text();

  let json: any = null;
  if (raw) {
    if (contentType.includes('application/json')) {
      try {
        json = JSON.parse(raw);
      } catch {
        throw new Error('Backend returned invalid JSON. Check the API base URL.');
      }
    } else {
      json = { message: raw };
    }
  }

  if (!res.ok) {
    const message = Array.isArray(json?.message)
      ? json.message.join(', ')
      : (json?.message ?? `Request failed (${res.status})`);

    if (!contentType.includes('application/json') && raw.startsWith('<!DOCTYPE')) {
      throw new Error('API endpoint returned HTML instead of JSON. Verify NEXT_PUBLIC_API_URL.');
    }

    throw new Error(message);
  }

  if (!json || typeof json !== 'object') {
    throw new Error('Backend returned an unexpected response format.');
  }

  return json;
}

// ── Bookings ──────────────────────────────────────────────────────────────────
export const bookingsApi = {
  create: (payload: CreateBookingPayload) =>
    req<ApiResponse<Booking>>('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  findAll: () => req<ApiResponse<Booking[]>>('/bookings'),

  findOne: (id: string) => req<ApiResponse<Booking>>(`/bookings/${id}`),

  update: (id: string, payload: Partial<CreateBookingPayload & { status: BookingStatus }>) =>
    req<ApiResponse<Booking>>(`/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  remove: (id: string) =>
    req<ApiResponse<Booking>>(`/bookings/${id}`, { method: 'DELETE' }),
};

// ── Queue ─────────────────────────────────────────────────────────────────────
export const queueApi = {
  getLive: () => req<ApiResponse<LiveQueueData>>('/queue/live'),

  getStatus: (bookingId: string) =>
    req<ApiResponse<QueueStatusData>>(`/queue/${bookingId}`),

  updateStatus: (id: string, status: BookingStatus) =>
    req<ApiResponse<Booking>>(`/queue/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsApi = {
  getSummary: () => req<ApiResponse<SummaryStats>>('/analytics/summary'),
  getHourly: () => req<ApiResponse<HourlyEntry[]>>('/analytics/hourly'),
};
