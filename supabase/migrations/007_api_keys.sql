-- Antry API keys table.
-- Each row is one issued API key. We store only the HMAC of the secret —
-- never the plaintext. Lookups happen by `id` (the 8-hex public chunk),
-- HMAC check in constant time at the application layer.

create table if not exists public.api_keys (
  id text primary key,
  env text not null check (env in ('live','test')),
  key_hmac text not null,
  owner_company_id uuid references public.companies(id) on delete cascade,
  owner_builder_id uuid references public.profiles(id) on delete cascade,
  scope_kind text not null check (scope_kind in ('company_read','company_write','builder_read')),
  label text default '',
  created_at timestamptz default now() not null,
  last_used_at timestamptz,
  revoked_at timestamptz,
  check (
    (owner_company_id is not null and owner_builder_id is null)
    or (owner_company_id is null and owner_builder_id is not null)
  )
);

create index if not exists idx_api_keys_owner_company
  on public.api_keys(owner_company_id) where revoked_at is null;
create index if not exists idx_api_keys_owner_builder
  on public.api_keys(owner_builder_id) where revoked_at is null;

alter table public.api_keys enable row level security;

-- Company members can list their own keys (without secret).
create policy "Company members read their api keys"
  on public.api_keys for select using (
    exists (
      select 1 from public.company_members cm
      where cm.company_id = api_keys.owner_company_id
        and cm.user_id = auth.uid()
    )
  );

-- Builders read their own builder-scope keys.
create policy "Builders read their api keys"
  on public.api_keys for select using (owner_builder_id = auth.uid());

-- All writes go through admin client + audited server actions.
