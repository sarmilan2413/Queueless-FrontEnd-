import { clsx, type ClassValue } from 'clsx';
import type { BookingStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function fmtWait(mins: number) {
  if (!mins || mins === 0) return 'Now';
  return `~${mins} min`;
}

export function fmtHour(h: number) {
  if (h === 0) return '12am';
  if (h < 12) return `${h}am`;
  if (h === 12) return '12pm';
  return `${h - 12}pm`;
}

export const STATUS_COLORS: Record<BookingStatus, string> = {
  waiting: '#f7c26a',
  serving: '#6af7c2',
  completed: '#7c6af7',
  cancelled: '#f76a6a',
};
