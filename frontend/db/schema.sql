-- Applied by scripts/db-migrate.mjs. Every statement is idempotent so it can rerun safely.
-- Statements are split on ";" at line ends, so keep one statement per block.

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  -- Optional: sign-up is username + password. Unique when present.
  email text unique,
  username text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- Existing databases: sign-up no longer collects an email.
alter table users alter column email drop not null;

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

-- The owner's own name for a piece, e.g. "Blue oxford". Null shows the label instead.
alter table garments add column if not exists name text;

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

-- Saved outfits. friend_id is set for matching outfits built with a friend.
create table if not exists outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  friend_id uuid references users (id) on delete set null,
  title text not null,
  -- Why it works (solo) or how the two looks go together (matching).
  reasoning text not null,
  your_note text,
  friend_note text,
  notes text,
  weather text,
  created_at timestamptz not null default now()
);

create index if not exists outfits_user_created_idx on outfits (user_id, created_at desc);

-- Pieces in each outfit. Removing a garment removes it from saved outfits too.
create table if not exists outfit_items (
  outfit_id uuid not null references outfits (id) on delete cascade,
  garment_id uuid not null references garments (id) on delete cascade,
  side text not null default 'you' check (side in ('you', 'friend')),
  position integer not null default 0,
  primary key (outfit_id, garment_id)
);

-- One row per outfit the stylist builds (saved or not), for usage stats.
create table if not exists outfit_generations (
  id bigint generated always as identity primary key,
  user_id uuid references users (id) on delete set null,
  kind text not null check (kind in ('solo', 'match')),
  created_at timestamptz not null default now()
);
