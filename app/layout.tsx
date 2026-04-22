import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'QueueLess — Smart Queue Management',
  description: 'Real-time appointment and queue management system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Ambient glows */}
        <div aria-hidden style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: `
            radial-gradient(ellipse 60vw 60vw at 0% 0%, rgba(124,106,247,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 50vw 50vw at 100% 100%, rgba(106,247,194,0.05) 0%, transparent 60%)
          `,
        }} />

        <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
          <Sidebar />
          <main style={{ flex: 1, padding: '2.5rem 2.5rem 4rem', overflowX: 'hidden' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
