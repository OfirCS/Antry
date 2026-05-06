-- Antry Mission Economy + Compute Footprint
-- 1. Adds the company billing primitives needed to ship Solo/Growth/Enterprise tiers.
-- 2. Adds receipt_surfacings to track which receipts a paying company actually
--    consumed against its monthly quota.
-- 3. Extends receipts with a compute_footprint jsonb column capturing
--    lines-of-code, energy (kWh), CO2 (grams), peak memory, wall-clock —
--    so companies can hire on energy efficiency, not just output.

-- ── Companies: billing & quotas ────────────────────────
alter table public.companies
  drop constraint if exists companies_plan_check;

alter table public.companies
  add column if not exists candidate_eval_quota_monthly int default 10,
  add column if not exists candidate_eval_quota_remaining int default 10,
  add column if not exists brief_slot_quota int default 1,
  add column if not exists active_briefs_count int default 0,
  add column if not exists billing_period_starts_at timestamptz default date_trunc('month', now()),
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists payg_balance_cents int default 0;

alter table public.companies
  add constraint companies_plan_check
    check (plan in ('solo','growth','enterprise','payg','waitlist','starter'));

-- Sensible defaults per tier — applied on plan change via app code.
comment on column public.companies.candidate_eval_quota_monthly is
  'How many Receipt seats this company can surface per month. Solo=10, Growth=50, Enterprise=250.';

-- ── Receipt surfacings (a Receipt being used by a company) ──
-- One row per (receipt, company) pair. Consuming a seat requires actually
-- viewing the trace — see consume_receipt_seat() below.
create table if not exists public.receipt_surfacings (
  id uuid default gen_random_uuid() primary key,
  receipt_id uuid references public.receipts(id) on delete cascade not null,
  company_id uuid references public.companies(id) on delete cascade not null,
  surfaced_at timestamptz default now() not null,
  viewed_at timestamptz,
  intro_requested_at timestamptz,
  intro_responded_at timestamptz,
  unique (receipt_id, company_id)
);

create index if not exists idx_surfacings_company
  on public.receipt_surfacings(company_id, surfaced_at desc);
create index if not exists idx_surfacings_receipt
  on public.receipt_surfacings(receipt_id);

alter table public.receipt_surfacings enable row level security;

create policy "Company members read their surfacings"
  on public.receipt_surfacings for select using (
    exists (
      select 1 from public.company_members cm
      where cm.company_id = receipt_surfacings.company_id
        and cm.user_id = auth.uid()
    )
  );

create policy "Builders read surfacings of their own receipts"
  on public.receipt_surfacings for select using (
    exists (
      select 1 from public.receipts r
      where r.id = receipt_surfacings.receipt_id and r.builder_id = auth.uid()
    )
  );

-- ── Atomic seat consumption ────────────────────────────
-- Decrements quota and inserts the surfacing row in one statement. Returns
-- false if quota exhausted. App code should call this — never UPDATE the
-- quota column directly (RLS on companies blocks that anyway).
create or replace function public.consume_receipt_seat(
  p_company uuid,
  p_receipt uuid
) returns boolean as $$
declare
  remaining int;
begin
  update public.companies
    set candidate_eval_quota_remaining = candidate_eval_quota_remaining - 1
    where id = p_company and candidate_eval_quota_remaining > 0
    returning candidate_eval_quota_remaining into remaining;

  if remaining is null then
    return false;
  end if;

  insert into public.receipt_surfacings(receipt_id, company_id)
    values (p_receipt, p_company)
    on conflict (receipt_id, company_id) do nothing;
  return true;
end;
$$ language plpgsql security definer;

-- ── Builder mission cap ────────────────────────────────
-- Per spec: 8 graded missions per builder per month. Tracked via a counter
-- on the profile + a monthly reset trigger.
alter table public.profiles
  add column if not exists missions_used_this_month int default 0,
  add column if not exists missions_period_starts_at timestamptz default date_trunc('month', now());

-- ── Compute footprint on receipts ──────────────────────
-- Energy/CO2/LOC are computed at mint time from gateway_calls totals.
-- Stored as jsonb to keep the schema flexible while we refine the formulas.
alter table public.receipts
  add column if not exists compute_footprint jsonb default '{}'::jsonb;

comment on column public.receipts.compute_footprint is
  'Compute footprint of the attempt: { energy_kwh, co2_grams, water_liters, lines_of_code, wall_clock_seconds, peak_memory_mb, cost_usd_cents }. Computed at mint time. Companies hire on energy efficiency, not just output.';

-- The compute_footprint MUST be immutable post-mint (already covered by the
-- 005_receipts_immutable trigger).
