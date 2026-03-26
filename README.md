This is a React + Vite application for the Thaalam event management admin.

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Environment

Create a `.env.local` or `.env` file with the frontend runtime values:

```bash
VITE_BASE_API=http://localhost:3000
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

The app also accepts the compatibility keys `VITE_NEXT_PUBLIC_BASE_API` and `VITE_NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` if you want to preserve older values temporarily.

## Scripts

```bash
npm run dev
npm run build
npm run start
```

## Notes

Routing is handled by `react-router-dom`, and the former Next.js App Router pages are now mounted through [`src/App.tsx`](./src/App.tsx).
