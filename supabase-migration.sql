-- ============================================================
-- Consulting Direct UK – Full Database Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. COURSES
create table if not exists public.courses (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  date        text,
  time        text,
  venue       text,
  duration    text,
  max_attendees integer default 12,
  status      text default 'active',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- 2. REGISTRATIONS
create table if not exists public.registrations (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid references public.courses(id) on delete cascade,
  first_name    text not null,
  last_name     text not null,
  email         text not null,
  business_name text,
  job_title     text,
  phone         text,
  status        text default 'pending',  -- pending | successful | waiting_list
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique(course_id, email)
);

-- 3. JOINING INSTRUCTIONS
create table if not exists public.joining_instructions (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid references public.courses(id) on delete cascade,
  set_number  integer,
  title       text not null,
  content     text not null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- 4. ATTENDANCE
create table if not exists public.attendance (
  id              uuid primary key default gen_random_uuid(),
  course_id       uuid references public.courses(id) on delete cascade,
  registration_id uuid references public.registrations(id) on delete cascade,
  attended        boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique(course_id, registration_id)
);

-- 5. ATTENDEE ACCOUNTS
create table if not exists public.attendee_accounts (
  id               uuid primary key default gen_random_uuid(),
  first_name       text not null,
  last_name        text not null,
  email            text unique not null,
  password         text not null,
  employer         text,
  mobile           text,
  email_verified   boolean default false,
  mobile_verified  boolean default false,
  verification_code text,
  mobile_code      text,
  created_at       timestamptz default now()
);

-- 6. CERTIFICATES
create table if not exists public.certificates (
  id             uuid primary key default gen_random_uuid(),
  course_id      uuid references public.courses(id) on delete cascade,
  attendee_email text not null,
  attendee_name  text,
  data_url       text,
  issued_at      timestamptz default now(),
  updated_at     timestamptz default now(),
  unique(course_id, attendee_email)
);

-- 7. CERTIFICATE TEMPLATES
create table if not exists public.cert_templates (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid references public.courses(id) on delete cascade unique,
  file_name  text,
  data_url   text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 8. EMAIL LOG
create table if not exists public.email_log (
  id         uuid primary key default gen_random_uuid(),
  "to"       text not null,
  "from"     text,
  subject    text,
  type       text,
  preview    text,
  sent_at    timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY – open policies (anon key has full access)
-- Tighten these once you add proper auth
-- ============================================================

alter table public.courses           enable row level security;
alter table public.registrations     enable row level security;
alter table public.joining_instructions enable row level security;
alter table public.attendance        enable row level security;
alter table public.attendee_accounts enable row level security;
alter table public.certificates      enable row level security;
alter table public.cert_templates    enable row level security;
alter table public.email_log         enable row level security;

-- Full access policies (anon + authenticated)
create policy "allow_all_courses"       on public.courses           for all using (true) with check (true);
create policy "allow_all_registrations" on public.registrations     for all using (true) with check (true);
create policy "allow_all_ji"            on public.joining_instructions for all using (true) with check (true);
create policy "allow_all_attendance"    on public.attendance        for all using (true) with check (true);
create policy "allow_all_accounts"      on public.attendee_accounts for all using (true) with check (true);
create policy "allow_all_certificates"  on public.certificates      for all using (true) with check (true);
create policy "allow_all_templates"     on public.cert_templates    for all using (true) with check (true);
create policy "allow_all_email_log"     on public.email_log         for all using (true) with check (true);

-- ============================================================
-- SEED: Demo course (Employment Legislation)
-- ============================================================

insert into public.courses (name, description, date, time, venue, duration, max_attendees, status)
values (
  'Changes in Employment Legislation UK – April 2026',
  'A comprehensive classroom session covering all key changes to UK employment law effective from 6 April 2026. Topics include changes to workers'' rights, flexible working rules, carer''s leave, paternity leave, and more. Specifically designed for HR managers and business owners at small and medium-sized businesses.',
  '2026-05-15',
  '09:30',
  'TBC – to be confirmed upon acceptance',
  'Full day (9:30 – 16:30)',
  12,
  'active'
)
on conflict do nothing;

-- Seed joining instructions Set 1 for the demo course
insert into public.joining_instructions (course_id, set_number, title, content)
select id, 1, 'Set 1 – Standard Joining Instructions',
'Dear Attendee,

We are delighted to confirm your place on the above course.

VENUE DETAILS
The course will be held at our training room. Full address and directions will be provided closer to the date.

WHAT TO BRING
• A notepad and pen
• Any relevant HR or employment contracts you wish to discuss
• Photo ID

TIMINGS
• Registration opens at 09:00
• Course begins promptly at 09:30
• Lunch will be provided
• Course ends at approximately 16:30

PARKING
Free parking is available on site.

Please confirm your attendance by replying to this email.

Kind regards,
Consulting Direct UK Limited'
from public.courses
where name = 'Changes in Employment Legislation UK – April 2026'
on conflict do nothing;
