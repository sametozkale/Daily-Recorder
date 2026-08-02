-- Allowed owner emails (invite-only)
create table public.allowed_emails (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.allowed_emails enable row level security;

create or replace function public.is_email_allowed(check_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.allowed_emails
    where lower(email) = lower(check_email)
  );
$$;

revoke all on function public.is_email_allowed(text) from public;
grant execute on function public.is_email_allowed(text) to authenticated, anon;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  slug text not null unique,
  display_name text not null,
  title text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_slug_format check (slug ~ '^[a-z0-9]([a-z0-9-]{0,62}[a-z0-9])?$')
);

create type public.activity_type as enum (
  'design', 'code', 'pr', 'review', 'spec', 'meeting', 'research', 'ship', 'other'
);

create type public.activity_source as enum (
  'manual', 'github', 'figma'
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  occurred_on date not null,
  type public.activity_type not null default 'other',
  title text not null,
  summary text,
  url text,
  project text,
  is_public boolean not null default true,
  media_url text,
  source public.activity_source not null default 'manual',
  external_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index activities_user_occurred_idx on public.activities (user_id, occurred_on desc);
create index activities_public_slug_idx on public.activities (user_id, is_public, occurred_on desc);
create unique index activities_external_uidx
  on public.activities (user_id, source, external_id)
  where external_id is not null;

alter table public.profiles enable row level security;
alter table public.activities enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert own profile if allowed"
  on public.profiles for insert
  to authenticated
  with check (
    auth.uid() = id
    and public.is_email_allowed(coalesce(auth.jwt() ->> 'email', ''))
  );

create policy "Public can read public activities"
  on public.activities for select
  using (is_public = true);

create policy "Owners can read own activities"
  on public.activities for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Owners can insert own activities"
  on public.activities for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Owners can update own activities"
  on public.activities for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Owners can delete own activities"
  on public.activities for delete
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_slug text;
  final_slug text;
begin
  if not public.is_email_allowed(new.email) then
    raise exception 'Email % is not allowed to sign up', new.email;
  end if;

  base_slug := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  if base_slug = '' then
    base_slug := 'user';
  end if;
  final_slug := base_slug;

  if exists (select 1 from public.profiles where slug = final_slug) then
    final_slug := base_slug || '-' || substr(replace(new.id::text, '-', ''), 1, 6);
  end if;

  insert into public.profiles (id, slug, display_name, title)
  values (
    new.id,
    final_slug,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    'Design Engineer'
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger activities_updated_at
  before update on public.activities
  for each row execute function public.set_updated_at();
