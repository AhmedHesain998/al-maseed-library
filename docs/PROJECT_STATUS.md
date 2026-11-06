# Al-Maseed Library — Project Status

## 1. Project Overview

Al-Maseed Library is a web-based library and stationery store system built with React and Supabase.

The project currently includes a customer storefront and an administrative dashboard.

**Repository:** https://github.com/AhmedHesain998/al-maseed-library

**Current branch:** `main`

**Last stable commit:** `cb7844d`

## 2. Technology Stack

- React 19
- Vite
- React Router
- Supabase
- PostgreSQL
- Supabase Authentication
- Supabase Edge Functions
- Supabase Storage
- Supabase Realtime
- Progressive Web App (PWA)

## 3. Completed Features

### Customer Storefront
- Product listing.
- Product categories.
- Arabic and English language support.
- SDG currency formatting.
- Shopping cart.
- Checkout form.
- WhatsApp order communication.

### Admin Dashboard
- Admin authentication.
- Admin access verification using `admin_users`.
- Dashboard overview.
- Product management.
- Product image management.
- Inventory fields and low-stock thresholds.
- Order listing and search.
- Order status management.
- Order details.
- Realtime order updates.
- Arabic and English admin interface.
- Toast notifications.

### Backend and Security
- Supabase database integration.
- Row Level Security (RLS).
- Server-side order creation through an Edge Function.
- Server-side product price verification.
- Order request validation.
- Idempotency handling.
- Order rate limiting.

## 4. Important Technical Notes

- Order creation is handled by the `create-order` Supabase Edge Function.
- Product prices and order totals are verified on the server.
- The current order creation process does not automatically deduct inventory.
- WhatsApp communication and database order creation are separate operations.
- Admin authorization must continue to be enforced by database policies, not only frontend checks.
- Environment variables are stored in `.env`, which must never be committed to Git.

## 5. Not Yet Implemented / Pending Decisions

These items are intentionally deferred until an actual client provides requirements:

- Automatic inventory deduction.
- Full offline operation.
- Local database and synchronization strategy.
- Multi-library support.
- Receipt and invoice printing.
- Advanced reporting.
- User roles and permissions beyond the current admin setup.
- Backup and recovery strategy for a production deployment.

## 6. Important Project Decision

Development is paused until a real client is identified and their requirements are collected.

Do not begin a major architectural change before understanding:

- Number of devices.
- Single-device or local-network usage.
- Internet availability.
- Required offline behavior.
- Inventory workflow.
- Receipt and reporting requirements.
- User roles.
- Budget and maintenance expectations.

## 7. Current Git Status

- Branch: `main`
- Stable commit: `cb7844d`
- Remote: GitHub
- Latest push: successful
- Working tree: clean at the time of the last check.

## 8. Recovery Notes

To restore the project:

1. Clone the GitHub repository.
2. Install dependencies using `npm install`.
3. Restore the required environment variables securely.
4. Configure the Supabase project.
5. Run the development server using `npm run dev`.

Never upload `.env`, service-role keys, or other private credentials to GitHub.

## 9. Next Phase

The next phase is client discovery, not additional development.

Collect the actual business requirements first, then decide which features and architecture are necessary.