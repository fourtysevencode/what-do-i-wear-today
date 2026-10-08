-- Applied by scripts/db-migrate.mjs. Every statement is idempotent so it can rerun safely.
-- Statements are split on ";" at line ends, so keep one statement per block.

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  -- Free text for now ("test" is a valid login); unique, stored lowercase.
  email text not null unique,
  username text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists garments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  -- Object key in the private storage bucket: garments/{user_id}/{id}.png
  storage_key text not null,
  -- Class name from the segmentation model, e.g. "long sleeve top"
  label text not null,
  confidence real,
  -- [{ "name": "navy", "hex": "#1f2a44", "percentage": 62.5 }, ...]
  colors jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists garments_user_created_idx on garments (user_id, created_at desc);

create table if not exists friendships (
  requester_id uuid not null references users (id) on delete cascade,
  addressee_id uuid not null references users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  primary key (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

-- One friendship row per pair, whichever side asked first.
create unique index if not exists friendships_pair_idx
  on friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));

create index if not exists friendships_addressee_idx on friendships (addressee_id, status);
