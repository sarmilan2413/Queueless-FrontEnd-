# QueueLess Frontend

Next.js 14 App Router frontend for the QueueLess queue management system.
Connects directly to the live NestJS backend — **no local backend needed**.

## Stack

- **Next.js 14** (App Router)
- **TypeScript** (strict)
- **Recharts** — analytics charts
- **Lucide React** — icons
- **Syne + DM Mono** — fonts via Google Fonts

## Getting Started

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Environment

`.env.local` is pre-configured to point at the deployed backend:

```
NEXT_PUBLIC_API_URL=https://queueless-backend-production-dd70.up.railway.app
```

> **Note:** The backend is on Render's free tier, so the first request may
> take ~30 seconds if it has been idle (cold start). Subsequent requests are fast.

## Pages

| Route        | Description                                           |
|--------------|-------------------------------------------------------|
| `/live`      | Real-time queue table with status controls            |
| `/book`      | Create a booking and get a token number               |
| `/lookup`    | Look up any booking by its ID                         |
| `/analytics` | Donut + bar charts, completion rate                   |

## API Endpoints Used

| Method | Path                    | Used In          |
|--------|-------------------------|------------------|
| POST   | /bookings               | /book            |
| GET    | /queue/live             | /live            |
| PATCH  | /queue/:id/status       | /live            |
| GET    | /queue/:bookingId       | /lookup          |
| GET    | /analytics/summary      | /live, /analytics|
| GET    | /analytics/hourly       | /analytics       |

## Build for Production

```bash
npm run build
npm start
```

## Deploy to Vercel

```bash
npx vercel
```

Set `NEXT_PUBLIC_API_URL` in your Vercel project's environment variables.
