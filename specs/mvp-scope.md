# MVP Phase 1 — Build Scope (Application Shell & Catalog Read)

Captures Tia's own phase-1 breakdown: the application shell and read-only
catalog, built before writes, auth, or payments.

## Foundation
- Shared UI components (atoms, molecules, ...)
- Strict, clear TypeScript types throughout
- Layout components: top bar / mobile menu, footer
- Responsive, mobile-first page layouts
- Tailwind CSS variables for light/dark theme colors
- Tailwind CSS variables for a spacing/radius scale (sm / md / lg ...)
- Theme switch (light/dark)

## Pages (Phase 1)
- Products page: fetch + paginated display, built from shared components
- Single product page
- Home page (placeholder for now)

## Data fetching
- Axios for HTTP requests
- React Query (TanStack Query) for server-state management where
  applicable

## Folder structure
```
src/
  shared/
    components/   # atoms, molecules, ...
    hooks/
    utils/
    index.ts
  modules/
    admin/
    auth/
    ...            # one module per feature area
```

## Explicitly not in Phase 1
- Firestore writes for auth/orders (admin write UI comes later)
- Cart / checkout logic
- Stripe integration
- Authentication implementation (Auth.js wiring)
