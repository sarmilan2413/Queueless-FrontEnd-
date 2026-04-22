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

const BASE = process.env.NEXT_PUBLIC_API_URL!;

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(
      Array.isArray(json.message) ? json.message.join(', ') : (json.message ?? 'Request failed'),
    );
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
