create extension if not exists pgcrypto;

create or replace function public.set_updated_date()
returns trigger
language plpgsql
as $$
begin
  new.updated_date = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

create table if not exists public.disorder (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  name text not null,
  slug text not null unique,
  category text not null,
  short_description text,
  overview text,
  biological_causes jsonb default '[]'::jsonb,
  environmental_causes jsonb default '[]'::jsonb,
  psychological_causes jsonb default '[]'::jsonb,
  lifestyle_causes jsonb default '[]'::jsonb,
  symptoms jsonb default '[]'::jsonb,
  neurochemistry text,
  who_is_affected text,
  medications jsonb default '[]'::jsonb,
  lifestyle_remedies jsonb default '[]'::jsonb,
  prognosis text,
  prevalence text,
  related_disorders jsonb default '[]'::jsonb
);

create table if not exists public.user_profile (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  user_email text not null unique,
  username text unique,
  display_name text,
  avatar_url text,
  avatar_color text default '#a78bfa',
  bio text,
  about text,
  location text,
  website text,
  interests jsonb default '[]'::jsonb,
  joined_label text,
  is_banned boolean default false,
  is_admin boolean default false
);

create table if not exists public.direct_message (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  sender_email text not null,
  recipient_email text not null,
  body text not null,
  is_read boolean default false,
  conversation_key text not null
);

create table if not exists public.forum_thread (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  title text not null,
  body text not null,
  topic_tag text not null,
  author_email text,
  author_name text,
  upvotes jsonb default '[]'::jsonb,
  reply_count int default 0,
  is_pinned boolean default false,
  is_hidden boolean default false,
  is_locked boolean default false
);

create table if not exists public.forum_reply (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  thread_id uuid not null references public.forum_thread(id) on delete cascade,
  body text not null,
  author_email text,
  author_name text,
  upvotes jsonb default '[]'::jsonb,
  is_helpful boolean default false,
  is_hidden boolean default false
);

create table if not exists public.notification (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  recipient_email text not null,
  type text not null,
  title text not null,
  body text not null,
  link text,
  is_read boolean default false,
  actor_email text,
  actor_name text,
  entity_id text
);

create table if not exists public.user_follow (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  follower_email text not null,
  following_email text not null
);

create table if not exists public.wellness_goal (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  title text not null,
  category text not null default 'custom',
  reminder_time text,
  frequency text default 'daily',
  is_active boolean default true,
  streak int default 0,
  target_days int default 21,
  completion_history jsonb default '[]'::jsonb,
  last_completed_date text,
  note text,
  user_email text
);

create table if not exists public.journal_entry (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  user_email text,
  date text not null,
  mood int not null,
  mood_label text,
  energy int,
  reflection text,
  gratitude text,
  intentions text,
  tags jsonb default '[]'::jsonb,
  is_private boolean default true
);

create table if not exists public.saved_resource (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  user_email text,
  resource_type text not null,
  resource_id text not null,
  resource_name text not null,
  resource_slug text,
  note text
);

create table if not exists public.saved_affirmation (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  user_email text not null,
  text text not null,
  date text
);

create table if not exists public.favorite_tool (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  user_email text not null,
  tool_id text not null,
  tool_type text not null
);

create table if not exists public.crisis_plan (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  user_email text not null unique,
  warning_signs jsonb default '[]'::jsonb,
  coping_strategies jsonb default '[]'::jsonb,
  reasons_to_live jsonb default '[]'::jsonb,
  safe_environment_steps jsonb default '[]'::jsonb,
  emergency_contacts jsonb default '[]'::jsonb,
  crisis_lines jsonb default '[]'::jsonb,
  professional_contact text,
  last_updated text
);

create table if not exists public.wellness_circle (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  name text not null,
  description text,
  focus_area text not null,
  created_by text,
  member_emails jsonb default '[]'::jsonb,
  is_private boolean default false,
  max_members int default 50,
  celebration_count int default 0,
  post_count int default 0,
  avatar_color text default '#a78bfa'
);

create table if not exists public.circle_post (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  circle_id uuid not null references public.wellness_circle(id) on delete cascade,
  author_email text not null,
  author_name text,
  type text not null default 'progress_update',
  title text,
  body text not null,
  goal_streak int,
  goal_title text,
  reaction_count int default 0,
  reactions jsonb default '[]'::jsonb,
  comment_count int default 0
);

create table if not exists public.support_group (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  name text not null,
  description text,
  topic text not null,
  created_by text,
  member_emails jsonb default '[]'::jsonb,
  is_private boolean default false,
  facilitator_email text,
  avatar_color text default '#a78bfa'
);

create table if not exists public.group_message (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  group_id uuid not null references public.support_group(id) on delete cascade,
  sender_email text not null,
  sender_name text,
  body text not null,
  is_system boolean default false
);

create table if not exists public.group_session (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  group_id uuid not null references public.support_group(id) on delete cascade,
  title text not null,
  description text,
  facilitator_email text not null,
  facilitator_name text,
  scheduled_at text not null,
  duration_minutes int default 60,
  status text default 'upcoming',
  rsvp_emails jsonb default '[]'::jsonb
);

create table if not exists public.user_points (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  user_email text not null unique,
  total_points int default 0,
  current_level int default 1,
  points_to_next_level int default 100,
  goal_completions int default 0,
  circle_contributions int default 0,
  longest_streak int default 0,
  total_reactions_given int default 0
);

create table if not exists public.user_achievement (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  user_email text not null,
  badge_id text not null,
  badge_title text,
  badge_icon text,
  earned_at timestamptz,
  progress int default 0
);

create table if not exists public.reward_log (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  user_email text not null,
  action_type text not null,
  action_id text not null,
  unique (user_email, action_type, action_id)
);

create table if not exists public.content_flag (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  reporter_email text not null,
  content_type text not null,
  content_id text not null,
  content_preview text,
  reason text not null,
  details text,
  status text default 'pending',
  resolved_by text
);

create table if not exists public.professional (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  name text not null,
  type text not null,
  specialties jsonb default '[]'::jsonb,
  bio text,
  location text,
  telehealth boolean default false,
  accepting_new boolean default true,
  languages jsonb default '["English"]'::jsonb,
  insurance jsonb default '[]'::jsonb,
  avatar_color text default '#a78bfa',
  phone text,
  email text,
  website text,
  session_fee text
);

create table if not exists public.professional_profile (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  user_email text not null unique,
  display_name text,
  profession_type text not null,
  specialties jsonb default '[]'::jsonb,
  bio text,
  credentials text,
  location text,
  telehealth_available boolean default true,
  in_person_available boolean default false,
  accepting_new_clients boolean default true,
  session_fee text,
  contact_email text,
  contact_phone text,
  website text,
  avatar_url text,
  languages jsonb default '["English"]'::jsonb,
  insurance_accepted jsonb default '[]'::jsonb
);

create table if not exists public.consultation_request (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  requester_email text not null,
  requester_name text,
  professional_id uuid not null references public.professional(id) on delete cascade,
  professional_name text,
  professional_email text,
  preferred_date text not null,
  preferred_time text,
  session_type text default 'in_person',
  concerns text,
  insurance_provider text,
  is_first_time boolean default true,
  status text default 'pending',
  notes text
);

do $$
declare t text;
begin
  foreach t in array array[
    'disorder','user_profile','direct_message','forum_thread','forum_reply','notification',
    'user_follow','wellness_goal','journal_entry','saved_resource','saved_affirmation',
    'favorite_tool','crisis_plan','wellness_circle','circle_post','support_group','group_message',
    'group_session','user_points','user_achievement','reward_log','content_flag','professional',
    'professional_profile','consultation_request'
  ]
  loop
    execute format('drop trigger if exists trg_%I_updated on public.%I;', t, t);
    execute format('create trigger trg_%I_updated before update on public.%I for each row execute function public.set_updated_date();', t, t);
  end loop;
end $$;

alter table public.disorder enable row level security;
alter table public.user_profile enable row level security;
alter table public.direct_message enable row level security;
alter table public.forum_thread enable row level security;
alter table public.forum_reply enable row level security;
alter table public.notification enable row level security;
alter table public.user_follow enable row level security;
alter table public.wellness_goal enable row level security;
alter table public.journal_entry enable row level security;
alter table public.saved_resource enable row level security;
alter table public.saved_affirmation enable row level security;
alter table public.favorite_tool enable row level security;
alter table public.crisis_plan enable row level security;
alter table public.wellness_circle enable row level security;
alter table public.circle_post enable row level security;
alter table public.support_group enable row level security;
alter table public.group_message enable row level security;
alter table public.group_session enable row level security;
alter table public.user_points enable row level security;
alter table public.user_achievement enable row level security;
alter table public.reward_log enable row level security;
alter table public.content_flag enable row level security;
alter table public.professional enable row level security;
alter table public.professional_profile enable row level security;
alter table public.consultation_request enable row level security;

create policy "public read disorder" on public.disorder for select using (true);
create policy "admin write disorder" on public.disorder for all using (public.is_admin()) with check (public.is_admin());

create policy "public read forum_thread" on public.forum_thread for select using (true);
create policy "owner admin write forum_thread" on public.forum_thread for all using (author_email = auth.email() or public.is_admin()) with check (author_email = auth.email() or public.is_admin());

create policy "public read forum_reply" on public.forum_reply for select using (true);
create policy "owner admin write forum_reply" on public.forum_reply for all using (author_email = auth.email() or public.is_admin()) with check (author_email = auth.email() or public.is_admin());

create policy "read own profile or admin" on public.user_profile for select using (user_email = auth.email() or public.is_admin() or true);
create policy "write own profile or admin" on public.user_profile for all using (user_email = auth.email() or public.is_admin()) with check (user_email = auth.email() or public.is_admin());

create policy "dm participants only" on public.direct_message for select using (sender_email = auth.email() or recipient_email = auth.email());
create policy "dm sender insert" on public.direct_message for insert with check (sender_email = auth.email());
create policy "dm participants update" on public.direct_message for update using (sender_email = auth.email() or recipient_email = auth.email()) with check (sender_email = auth.email() or recipient_email = auth.email());
create policy "dm sender delete" on public.direct_message for delete using (sender_email = auth.email() or public.is_admin());

create policy "read own notifications" on public.notification for select using (recipient_email = auth.email() or public.is_admin());
create policy "insert notifications by actor or admin" on public.notification for insert with check (actor_email = auth.email() or public.is_admin());
create policy "update own notifications" on public.notification for update using (recipient_email = auth.email() or public.is_admin()) with check (recipient_email = auth.email() or public.is_admin());
create policy "delete own notifications" on public.notification for delete using (recipient_email = auth.email() or public.is_admin());

create policy "follow read participants" on public.user_follow for select using (follower_email = auth.email() or following_email = auth.email() or public.is_admin());
create policy "follow write follower" on public.user_follow for all using (follower_email = auth.email() or public.is_admin()) with check (follower_email = auth.email() or public.is_admin());

create policy "wellness_goal own" on public.wellness_goal for all using (user_email = auth.email() or public.is_admin()) with check (user_email = auth.email() or public.is_admin());
create policy "journal own" on public.journal_entry for all using (user_email = auth.email() or public.is_admin()) with check (user_email = auth.email() or public.is_admin());
create policy "saved_resource own" on public.saved_resource for all using (user_email = auth.email() or public.is_admin()) with check (user_email = auth.email() or public.is_admin());
create policy "saved_affirmation own" on public.saved_affirmation for all using (user_email = auth.email() or public.is_admin()) with check (user_email = auth.email() or public.is_admin());
create policy "favorite_tool own" on public.favorite_tool for all using (user_email = auth.email() or public.is_admin()) with check (user_email = auth.email() or public.is_admin());
create policy "crisis_plan own" on public.crisis_plan for all using (user_email = auth.email() or public.is_admin()) with check (user_email = auth.email() or public.is_admin());
create policy "user_points own read/write or admin" on public.user_points for all using (user_email = auth.email() or public.is_admin()) with check (user_email = auth.email() or public.is_admin());
create policy "reward_log own write/read or admin" on public.reward_log for all using (user_email = auth.email() or public.is_admin()) with check (user_email = auth.email() or public.is_admin());
create policy "achievement own read admin write" on public.user_achievement for select using (user_email = auth.email() or public.is_admin());
create policy "achievement admin write" on public.user_achievement for all using (public.is_admin()) with check (public.is_admin());

create policy "public read support_group" on public.support_group for select using (true);
create policy "owner admin write support_group" on public.support_group for all using (created_by = auth.email() or public.is_admin()) with check (created_by = auth.email() or public.is_admin());
create policy "group_message read" on public.group_message for select using (true);
create policy "group_message write sender/admin" on public.group_message for all using (sender_email = auth.email() or public.is_admin()) with check (sender_email = auth.email() or public.is_admin());
create policy "group_session read" on public.group_session for select using (true);
create policy "group_session write facilitator/admin" on public.group_session for all using (facilitator_email = auth.email() or public.is_admin()) with check (facilitator_email = auth.email() or public.is_admin());

create policy "public read wellness_circle" on public.wellness_circle for select using (true);
create policy "creator admin write wellness_circle" on public.wellness_circle for all using (created_by = auth.email() or public.is_admin()) with check (created_by = auth.email() or public.is_admin());
create policy "public read circle_post" on public.circle_post for select using (true);
create policy "author admin write circle_post" on public.circle_post for all using (author_email = auth.email() or public.is_admin()) with check (author_email = auth.email() or public.is_admin());

create policy "content_flag write reporter/admin read admin" on public.content_flag for select using (public.is_admin());
create policy "content_flag insert reporter" on public.content_flag for insert with check (reporter_email = auth.email() or public.is_admin());
create policy "content_flag update admin" on public.content_flag for update using (public.is_admin()) with check (public.is_admin());

create policy "public read professional" on public.professional for select using (true);
create policy "admin write professional" on public.professional for all using (public.is_admin()) with check (public.is_admin());

create policy "public read professional_profile" on public.professional_profile for select using (true);
create policy "own or admin write professional_profile" on public.professional_profile for all using (user_email = auth.email() or public.is_admin()) with check (user_email = auth.email() or public.is_admin());

create policy "consultation own/pro/admin read" on public.consultation_request for select using (requester_email = auth.email() or professional_email = auth.email() or public.is_admin());
create policy "consultation requester insert" on public.consultation_request for insert with check (requester_email = auth.email() or public.is_admin());
create policy "consultation admin update" on public.consultation_request for update using (public.is_admin()) with check (public.is_admin());
create policy "consultation own/admin delete" on public.consultation_request for delete using (requester_email = auth.email() or public.is_admin());

