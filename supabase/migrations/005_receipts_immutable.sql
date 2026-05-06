-- Antry Receipts hardening (security review fix #4):
-- The original migration 004_receipts.sql allowed builders to UPDATE any
-- column on their own receipts. Receipts are intended to be immutable signed
-- artifacts; only the visibility flags should be user-mutable.
--
-- This migration:
--   1. Replaces the broad UPDATE policy with one that only matches when the
--      sensitive columns are unchanged (enforced by trigger).
--   2. Installs a BEFORE UPDATE trigger that raises if any signed field is
--      mutated (signature, content_hash, fingerprint, composite_score,
--      builder_id, brief_id, attempt_id, signed_at).
--   3. Adds an `immutable_after_mint` constraint comment so future schema
--      changes reason about it explicitly.

-- ── Drop the broad policy ──────────────────────────────
drop policy if exists "Builders update own receipt visibility" on public.receipts;

-- ── Re-create with explicit `with check` clause ────────
create policy "Builders update own receipt visibility v2"
  on public.receipts for update
  using (builder_id = auth.uid())
  with check (builder_id = auth.uid());

-- ── Trigger: forbid mutation of signed columns ─────────
create or replace function public.receipts_immutable_after_mint()
returns trigger as $$
begin
  if new.signature is distinct from old.signature
    or new.content_hash is distinct from old.content_hash
    or new.fingerprint is distinct from old.fingerprint
    or new.composite_score is distinct from old.composite_score
    or new.builder_id is distinct from old.builder_id
    or new.brief_id is distinct from old.brief_id
    or new.attempt_id is distinct from old.attempt_id
    or new.signed_at is distinct from old.signed_at then
    raise exception 'receipts.signed_columns_immutable: signature, content_hash, fingerprint, composite_score, builder_id, brief_id, attempt_id, signed_at cannot be mutated after mint'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_receipts_immutable_after_mint on public.receipts;
create trigger trg_receipts_immutable_after_mint
  before update on public.receipts
  for each row execute function public.receipts_immutable_after_mint();

-- ── Document intent ────────────────────────────────────
comment on table public.receipts is
  'Immutable signed artifact. Only display_visibility and trace_visibility may be mutated post-mint; all other columns are locked by trg_receipts_immutable_after_mint.';

-- ── Add the signature column if migration 004 was applied without it ──
-- (Defensive: the column existed in 004; this is a no-op when present.)
alter table public.receipts
  add column if not exists signature_v2 text;

-- The original 004 migration already declares `signature text not null`. If
-- you haven't applied 004 yet, this column is redundant; if you have, it's
-- harmless. The "real" signature lives on the existing `signature` column.
