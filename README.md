This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Local Stripe webhook testing

Checkout uses a signature-verified Stripe webhook (`app/api/webhooks/stripe/route.ts`) as the sole source of truth for payment status — the browser redirect after Stripe Checkout is never treated as proof of payment. To exercise that locally:

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and run `stripe login` once.
2. In a separate terminal, forward events to your local dev server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
3. Copy the `whsec_...` value the CLI prints into `STRIPE_WEBHOOK_SECRET` in `.env.local`.
4. Complete a checkout in the app using a [Stripe test card](https://stripe.com/docs/testing) — the CLI forwards the real, signed event from that test-mode session to your local webhook route.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
