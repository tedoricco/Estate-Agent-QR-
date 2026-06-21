-- Boards table
create table if not exists boards (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  agent_name text,
  branch_name text,
  destination_url text not null,
  slug text unique not null,
  scan_count bigint default 0
);

-- Scans table
create table if not exists scans (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  board_id uuid references boards(id) on delete cascade,
  user_agent text,
  ip_address text,
  referrer text
);

-- Note: create an admin user in Supabase Auth (Dashboard → Authentication → Users)
-- and set ADMIN_EMAIL in your environment to that user's email.
