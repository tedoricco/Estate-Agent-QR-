# Estate Agent QR - Admin MVP

This repository is a minimal Next.js 15 + TypeScript app that provides an admin-only dashboard to manage QR boards. It uses Supabase for authentication and data storage, and Tailwind CSS for styling.

Quick setup

1. Create a Supabase project.
2. Run the SQL in `db/schema.sql` in the Supabase SQL editor to create the `boards` and `scans` tables.
3. Create an admin user in Supabase Auth (Dashboard → Authentication → Users) using the email you set in `ADMIN_EMAIL`.
4. Copy `.env.local.example` to `.env.local` and fill values.
5. Install and run:

```bash
npm install
npm run dev
```

Admin flows

- Admin signs in at `/admin/login` using the Supabase email/password account.
- Admin dashboard at `/admin/dashboard` shows all boards and allows create/edit/delete.

Public flows

- Visiting `/b/[slug]` logs the scan and redirects to the board's `destination_url`.

Notes

- The server API endpoints verify incoming requests by validating the provided Supabase access token and matching the user's email to `ADMIN_EMAIL`.
- For production, set environment variables on your host and keep `SUPABASE_SERVICE_ROLE_KEY` secret.
