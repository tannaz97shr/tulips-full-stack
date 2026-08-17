# Tulips — Product Overview

**Type:** Portfolio project — demonstrates full-stack e-commerce capability for freelance client acquisition.
**Owner:** Tia (freelance full-stack developer)

## Purpose
Tulips is an online flower shop demo that showcases end-to-end e-commerce
development: a filterable product catalog, shopping cart, real Stripe
Checkout (test mode), customer authentication, and an admin backend for
inventory and order management.

## Target audience
- **Primary (real-world):** prospective freelance clients / hiring managers
  evaluating Tia's development skills.
- **In-universe:** general consumers buying flowers, bouquets, and related
  gift products online.

## Core value proposition
A realistic, fully working flower & bouquet e-commerce experience — not a
static mockup — with genuine payment processing, authentication, and an
admin management flow, to demonstrate production-grade full-stack ability.

## Roles
Two roles: **Customer** and **Admin**. See `user-roles.md`.

## MVP scope (in)
- Browsable, filterable catalog of products (flowers, admin-curated
  bouquets, vases, greenery, gift add-ons)
- Product detail pages with image gallery
- Cart and real Stripe Checkout (test mode)
- Customer accounts (email/password + Google), order history
- Admin: manage products, manage curated bouquets (component-based),
  manage orders/status
- Stock tracking, including automatic decrement of bouquet component stock
- Light/dark theme, responsive mobile-first UI

## Explicitly deferred (later phases)
- Customer "build your own bouquet" (custom assembly) — admin-curated only
  in MVP
- Real transactional emails (order confirmation, etc.)
- Real courier / live shipping-rate integration
- Real tax-API integration (fixed-rate tax line item only in MVP)
- Additional staff role distinct from Admin
- Admin audit logging

## Open questions
- Password reset flow: build for MVP, or defer — pending decision.
