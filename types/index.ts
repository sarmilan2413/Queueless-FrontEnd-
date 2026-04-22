export type BookingStatus = 'waiting' | 'serving' | 'completed' | 'cancelled';

export interface Booking {
  _id: string;
  customerName: string;
  email: string;
  serviceType: string;
  appointmentDate: string;
  appointmentTime: string;
  status: BookingStatus;
  tokenNumber: string;
  queuePosition: number;
  estimatedWait: number;
  createdAt: string;
}

export interface CreateBookingPayload {
  customerName: string;
  email: string;
  serviceType: string;
  appointmentDate: string; // ISO string
  appointmentTime: string;
  status?: BookingStatus;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface LiveQueueData {
  currentServingToken: string | null;
  waitingCount: number;
  servingCount: number;
  totalActive: number;
  averageServiceTime: number;
  bookings: Booking[];
}

export interface QueueStatusData {
  booking: Booking;
  currentServingToken: string | null;
  averageServiceTime: number;
}

export interface SummaryStats {
  totalBookings: number;
  waiting: number;
  serving: number;
  completed: number;
  cancelled: number;
}

export interface HourlyEntry {
  hour: number;
  totalBookings: number;
}
