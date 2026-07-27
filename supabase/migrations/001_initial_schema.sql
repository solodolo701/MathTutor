-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  grade int not null check (grade between 9 and 12),
  birth_year int not null,
  parent_email text,
  consent_given_at timestamptz,
  avatar_config jsonb,
  subscription_status text not null default 'free' check (subscription_status in ('free', 'premium')),
  subscription_expires_at timestamptz,
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Skills
create table if not exists skills (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  name_hu text not null,
  grade int not null check (grade between 9 and 12),
  topic_area text not null,
  prerequisites uuid[] not null default '{}',
  difficulty_params jsonb,
  description_hu text,
  sort_order int not null default 0
);

-- Problems
create table if not exists problems (
  id uuid primary key default uuid_generate_v4(),
  skill_id uuid not null references skills(id) on delete cascade,
  type text not null check (type in ('fill_number', 'equation_input', 'multiple_choice', 'guided_steps')),
  content_latex text not null,
  solution_latex text,
  solution_numeric numeric,
  hints jsonb not null default '[]',
  difficulty float not null check (difficulty between 0.0 and 1.0),
  matura_relevant boolean not null default false,
  created_at timestamptz not null default now()
);

-- User skills (BKT state)
create table if not exists user_skills (
  user_id uuid not null references profiles(id) on delete cascade,
  skill_id uuid not null references skills(id) on delete cascade,
  p_know float not null default 0.10 check (p_know between 0.0 and 1.0),
  attempts_total int not null default 0,
  attempts_correct int not null default 0,
  next_review_at timestamptz,
  mastered_at timestamptz,
  primary key (user_id, skill_id)
);

-- Problem attempts
create table if not exists problem_attempts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  problem_id uuid not null references problems(id) on delete cascade,
  correct boolean not null,
  time_ms int not null default 0,
  hint_count int not null default 0,
  ai_hint_used boolean not null default false,
  created_at timestamptz not null default now()
);

-- XP events
create table if not exists xp_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  amount int not null,
  reason text not null,
  created_at timestamptz not null default now()
);

-- Streaks
create table if not exists streaks (
  user_id uuid primary key references profiles(id) on delete cascade,
  current int not null default 0,
  longest int not null default 0,
  last_active_date date,
  shields_available int not null default 0
);

-- Squads
create table if not exists squads (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  invite_code text not null unique,
  season_xp int not null default 0,
  created_at timestamptz not null default now()
);

-- Squad members
create table if not exists squad_members (
  squad_id uuid not null references squads(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (squad_id, user_id)
);

-- Seasons
create table if not exists seasons (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  start_date date not null,
  end_date date not null,
  theme jsonb not null default '{}',
  milestones jsonb not null default '[]'
);

-- Badges
create table if not exists badges (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  badge_type text not null,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_type)
);

-- AI hint log (for rate limiting)
create table if not exists ai_hint_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  problem_id uuid not null references problems(id) on delete cascade,
  hint_text text not null,
  created_at timestamptz not null default now()
);

-- Curriculum embeddings for RAG
create extension if not exists vector;
create table if not exists curriculum_embeddings (
  id uuid primary key default uuid_generate_v4(),
  skill_id uuid references skills(id) on delete cascade,
  content text not null,
  embedding vector(1536),
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_user_skills_user_id on user_skills(user_id);
create index if not exists idx_user_skills_review on user_skills(user_id, next_review_at);
create index if not exists idx_problem_attempts_user on problem_attempts(user_id, created_at);
create index if not exists idx_xp_events_user on xp_events(user_id, created_at);
create index if not exists idx_problems_skill on problems(skill_id, difficulty);
create index if not exists idx_badges_user on badges(user_id);
create index if not exists idx_ai_hint_log_user on ai_hint_log(user_id, created_at);

-- RLS: Enable on all tables
alter table profiles enable row level security;
alter table skills enable row level security;
alter table problems enable row level security;
alter table user_skills enable row level security;
alter table problem_attempts enable row level security;
alter table xp_events enable row level security;
alter table streaks enable row level security;
alter table squads enable row level security;
alter table squad_members enable row level security;
alter table seasons enable row level security;
alter table badges enable row level security;
alter table ai_hint_log enable row level security;
alter table curriculum_embeddings enable row level security;

-- RLS Policies

-- Profiles: users can read and update their own
create policy "users_own_profile_select" on profiles for select using (auth.uid() = id);
create policy "users_own_profile_update" on profiles for update using (auth.uid() = id);
create policy "users_own_profile_insert" on profiles for insert with check (auth.uid() = id);

-- Skills: all authenticated users can read
create policy "authenticated_read_skills" on skills for select using (auth.role() = 'authenticated');

-- Problems: all authenticated users can read
create policy "authenticated_read_problems" on problems for select using (auth.role() = 'authenticated');

-- Curriculum embeddings: all authenticated users can read
create policy "authenticated_read_embeddings" on curriculum_embeddings for select using (auth.role() = 'authenticated');

-- User skills: own rows only
create policy "users_own_user_skills_select" on user_skills for select using (auth.uid() = user_id);
create policy "users_own_user_skills_insert" on user_skills for insert with check (auth.uid() = user_id);
create policy "users_own_user_skills_update" on user_skills for update using (auth.uid() = user_id);

-- Problem attempts: own rows only
create policy "users_own_attempts_select" on problem_attempts for select using (auth.uid() = user_id);
create policy "users_own_attempts_insert" on problem_attempts for insert with check (auth.uid() = user_id);

-- XP events: own rows only
create policy "users_own_xp_select" on xp_events for select using (auth.uid() = user_id);
create policy "users_own_xp_insert" on xp_events for insert with check (auth.uid() = user_id);

-- Streaks: own rows only
create policy "users_own_streaks_select" on streaks for select using (auth.uid() = user_id);
create policy "users_own_streaks_insert" on streaks for insert with check (auth.uid() = user_id);
create policy "users_own_streaks_update" on streaks for update using (auth.uid() = user_id);

-- Squads: members can read
create policy "squad_members_read_squad" on squads for select
  using (exists (select 1 from squad_members where squad_id = squads.id and user_id = auth.uid()));

-- Squad members: can read own squad's members
create policy "squad_members_read" on squad_members for select
  using (exists (select 1 from squad_members sm where sm.squad_id = squad_members.squad_id and sm.user_id = auth.uid()));
create policy "squad_members_insert" on squad_members for insert with check (auth.uid() = user_id);

-- Seasons: all authenticated users can read
create policy "authenticated_read_seasons" on seasons for select using (auth.role() = 'authenticated');

-- Badges: own rows only
create policy "users_own_badges_select" on badges for select using (auth.uid() = user_id);
create policy "users_own_badges_insert" on badges for insert with check (auth.uid() = user_id);

-- AI hint log: own rows only
create policy "users_own_hints_select" on ai_hint_log for select using (auth.uid() = user_id);
create policy "users_own_hints_insert" on ai_hint_log for insert with check (auth.uid() = user_id);

-- Trigger: auto-update profiles.updated_at
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function handle_updated_at();

-- Trigger: auto-create profile on new user signup
create or replace function handle_new_user()
returns trigger as $$
begin
  -- Profile is inserted by the app after signup (with display_name, grade, etc.)
  return new;
end;
$$ language plpgsql security definer;
