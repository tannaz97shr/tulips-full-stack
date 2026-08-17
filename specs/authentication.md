# Authentication — Tulips

## Identity system
Auth.js is the source of identity and sessions (per the project's default
stack decision). Firebase Admin SDK is used server-side only, for trusted
Firestore/Storage access — not for authentication itself. The Auth.js
session user id is the canonical user id, stored on `users` docs and on
`orders.userId`.

## Providers
- Email / password
- Google OAuth

## Account lifecycle
- Sign-up (either provider) creates a `users` doc with `role: "customer"`
  by default.
- Admin role is not self-assignable through the app in MVP — set directly
  in Firestore or via a seed script.
- Login / logout handled through Auth.js sessions.
- Email verification: not required for MVP (portfolio demo, not a
  production consumer product).
- Password reset: **open question** — pending decision on whether this is
  built for MVP or deferred to a later phase.

## Authorization rules
- Guest browsing of the catalog is allowed without login.
- Login is required at checkout, and for cart/account/order-history pages.
- Admin routes require an authenticated session **and** `role === "admin"`,
  checked server-side on every request — never enforced only by hiding UI.
