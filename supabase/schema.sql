-- ══════════════════════════════════════════════════════════════════════════════
--  ezRep — Supabase Schema
--  Run this in your Supabase project's SQL editor to set up all tables,
--  relationships, row-level security (RLS), and realtime publications.
-- ══════════════════════════════════════════════════════════════════════════════

-- Enable the pgcrypto extension (for gen_random_uuid if needed)
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
--  1. PROFILES
--     Mirrors auth.users 1-to-1. Created automatically by the trigger below.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  username          text not null unique,
  display_name      text,
  avatar_url        text,
  total_volume_kg   numeric(12, 2) not null default 0,
  total_sessions    integer        not null default 0,
  email             text,
  created_at        timestamptz    not null default now()
);

-- Enforce lowercase, alphanumeric + underscore, 3-20 chars
alter table profiles
  add constraint profiles_username_format
  check (username ~ '^[a-z0-9_]{3,20}$');

-- Auto-create profile on auth.users insert
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, username, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
--  2. WORKOUTS  (solo sessions)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists workouts (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references profiles (id) on delete cascade,
  name             text        not null default 'Workout',
  started_at       timestamptz not null default now(),
  ended_at         timestamptz,
  total_volume_kg  numeric(12, 2) not null default 0,
  notes            text,
  created_at       timestamptz not null default now()
);

create table if not exists workout_exercises (
  id            uuid    primary key default gen_random_uuid(),
  workout_id    uuid    not null references workouts (id) on delete cascade,
  exercise_id   text    not null,
  exercise_name text    not null,
  order_index   integer not null default 0
);

create table if not exists workout_sets (
  id                  uuid        primary key default gen_random_uuid(),
  workout_exercise_id uuid        not null references workout_exercises (id) on delete cascade,
  set_index           integer     not null,
  reps                integer     not null default 0,
  weight_kg           numeric(8, 2) not null default 0,
  is_warmup           boolean     not null default false,
  completed           boolean     not null default false,
  logged_at           timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
--  3. SESSIONS  (real-time group workouts)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists sessions (
  id                     uuid        primary key default gen_random_uuid(),
  code                   char(6)     not null unique,
  host_id                uuid        not null references profiles (id),
  status                 text        not null default 'lobby'
                                     check (status in ('lobby', 'active', 'completed')),
  current_exercise_index integer     not null default 0,
  created_at             timestamptz not null default now(),
  started_at             timestamptz,
  ended_at               timestamptz
);

create index if not exists sessions_code_idx on sessions (code);

create table if not exists session_participants (
  id          uuid        primary key default gen_random_uuid(),
  session_id  uuid        not null references sessions (id) on delete cascade,
  user_id     uuid        not null references profiles (id),
  color_index integer     not null default 0,
  is_ready    boolean     not null default false,
  joined_at   timestamptz not null default now(),
  left_at     timestamptz,
  unique (session_id, user_id)
);

create table if not exists session_exercises (
  id            uuid    primary key default gen_random_uuid(),
  session_id    uuid    not null references sessions (id) on delete cascade,
  exercise_id   text    not null,
  exercise_name text    not null,
  order_index   integer not null default 0,
  target_sets   integer not null default 3,
  target_reps   integer not null default 10
);

create table if not exists session_sets (
  id                  uuid          primary key default gen_random_uuid(),
  session_exercise_id uuid          not null references session_exercises (id) on delete cascade,
  session_id          uuid          not null references sessions (id) on delete cascade,
  user_id             uuid          not null references profiles (id),
  set_index           integer       not null,
  reps                integer       not null default 0,
  weight_kg           numeric(8, 2) not null default 0,
  logged_at           timestamptz   not null default now()
);

create index if not exists session_sets_session_idx on session_sets (session_id);
create index if not exists session_sets_user_idx    on session_sets (user_id);

-- ─────────────────────────────────────────────────────────────────────────────
--  4. RPC — increment_user_stats
--     Called after a session ends to bump aggregate counters on profiles.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function increment_user_stats(
  p_user_id  uuid,
  p_volume   numeric,
  p_sessions integer default 1
)
returns void language plpgsql security definer as $$
begin
  update profiles
  set
    total_volume_kg = total_volume_kg + p_volume,
    total_sessions  = total_sessions  + p_sessions
  where id = p_user_id;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
--  5. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

-- ── profiles ────────────────────────────────────────────────────────────────
alter table profiles enable row level security;

-- Anyone can read any profile (for leaderboard / session participant names)
create policy "profiles: public read"
  on profiles for select using (true);

-- Only owner can update own profile
create policy "profiles: owner update"
  on profiles for update using (auth.uid() = id);

-- ── workouts ─────────────────────────────────────────────────────────────────
alter table workouts enable row level security;

create policy "workouts: owner all"
  on workouts for all using (auth.uid() = user_id);

-- ── workout_exercises ─────────────────────────────────────────────────────────
alter table workout_exercises enable row level security;

create policy "workout_exercises: owner all"
  on workout_exercises for all
  using (
    exists (
      select 1 from workouts w
      where w.id = workout_exercises.workout_id
        and w.user_id = auth.uid()
    )
  );

-- ── workout_sets ──────────────────────────────────────────────────────────────
alter table workout_sets enable row level security;

create policy "workout_sets: owner all"
  on workout_sets for all
  using (
    exists (
      select 1
      from workout_exercises we
      join workouts w on w.id = we.workout_id
      where we.id = workout_sets.workout_exercise_id
        and w.user_id = auth.uid()
    )
  );

-- ── sessions ─────────────────────────────────────────────────────────────────
alter table sessions enable row level security;

-- Participants can read sessions they belong to; everyone can read by code (for join)
create policy "sessions: participant read"
  on sessions for select using (
    -- Allow reading if the user is a participant OR the record is being looked up by code
    exists (
      select 1 from session_participants sp
      where sp.session_id = sessions.id
        and sp.user_id = auth.uid()
    )
    or host_id = auth.uid()
  );

create policy "sessions: host insert"
  on sessions for insert with check (auth.uid() = host_id);

create policy "sessions: host update"
  on sessions for update using (auth.uid() = host_id);

-- ── session_participants ──────────────────────────────────────────────────────
alter table session_participants enable row level security;

create policy "session_participants: read"
  on session_participants for select using (
    exists (
      select 1 from session_participants sp2
      where sp2.session_id = session_participants.session_id
        and sp2.user_id = auth.uid()
    )
  );

create policy "session_participants: insert self"
  on session_participants for insert with check (auth.uid() = user_id);

create policy "session_participants: update self"
  on session_participants for update using (auth.uid() = user_id);

-- ── session_exercises ─────────────────────────────────────────────────────────
alter table session_exercises enable row level security;

create policy "session_exercises: participant read"
  on session_exercises for select using (
    exists (
      select 1 from session_participants sp
      where sp.session_id = session_exercises.session_id
        and sp.user_id = auth.uid()
    )
  );

create policy "session_exercises: host insert"
  on session_exercises for insert with check (
    exists (
      select 1 from sessions s
      where s.id = session_exercises.session_id
        and s.host_id = auth.uid()
    )
  );

-- ── session_sets ──────────────────────────────────────────────────────────────
alter table session_sets enable row level security;

create policy "session_sets: participant read"
  on session_sets for select using (
    exists (
      select 1 from session_participants sp
      where sp.session_id = session_sets.session_id
        and sp.user_id = auth.uid()
    )
  );

create policy "session_sets: insert own"
  on session_sets for insert with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
--  6. REALTIME PUBLICATIONS
--     Enable Supabase Realtime for tables that need live row-level events.
--     The app primarily uses Broadcast (not row events) for session sync,
--     but enabling these lets you use postgres_changes if needed later.
-- ─────────────────────────────────────────────────────────────────────────────
alter publication supabase_realtime add table sessions;
alter publication supabase_realtime add table session_participants;
alter publication supabase_realtime add table session_sets;

-- ─────────────────────────────────────────────────────────────────────────────
--  7. ROUTINES  (structured training programs)
--
--  Hierarchy:
--    Routine  →  RoutineDay  →  RoutineDayExercise
--    e.g. "Push Pull Legs" → "Legs (Day 3)" → Hamstring Curl · 4×10
--
--  When a user does a workout linked to a routine day, the completed workout
--  is stored in workouts (routine_id + routine_day_id), and current_day_index
--  on the routine advances automatically.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists routines (
  id                 uuid        primary key default gen_random_uuid(),
  user_id            uuid        not null references profiles (id) on delete cascade,
  name               text        not null,             -- e.g. "Push Pull Legs"
  is_active          boolean     not null default false,
  current_day_index  integer     not null default 0,  -- 0-based index into routine_days
  created_at         timestamptz not null default now()
);

create table if not exists routine_days (
  id          uuid    primary key default gen_random_uuid(),
  routine_id  uuid    not null references routines (id) on delete cascade,
  day_number  integer not null,  -- 1-based (Day 1, Day 2 …)
  name        text    not null,  -- e.g. "Push", "Pull", "Legs"
  unique (routine_id, day_number)
);

create table if not exists routine_day_exercises (
  id               uuid          primary key default gen_random_uuid(),
  routine_day_id   uuid          not null references routine_days (id) on delete cascade,
  exercise_id      text          not null,
  exercise_name    text          not null,
  order_index      integer       not null default 0,
  target_sets      integer       not null default 3,
  target_reps      integer       not null default 10,
  target_weight_kg numeric(8, 2)           -- optional hint; null = user decides
);

-- Link workouts back to the routine day that generated them
alter table workouts
  add column if not exists routine_id      uuid references routines (id) on delete set null,
  add column if not exists routine_day_id  uuid references routine_days (id) on delete set null;

-- ── RLS for routine tables ────────────────────────────────────────────────────

alter table routines enable row level security;
create policy "routines: owner all"
  on routines for all using (auth.uid() = user_id);

alter table routine_days enable row level security;
create policy "routine_days: owner all"
  on routine_days for all
  using (
    exists (
      select 1 from routines r
      where r.id = routine_days.routine_id and r.user_id = auth.uid()
    )
  );

alter table routine_day_exercises enable row level security;
create policy "routine_day_exercises: owner all"
  on routine_day_exercises for all
  using (
    exists (
      select 1 from routine_days rd
      join routines r on r.id = rd.routine_id
      where rd.id = routine_day_exercises.routine_day_id
        and r.user_id = auth.uid()
    )
  );

-- ── RPC: advance the active routine to the next day (wraps around) ────────────
create or replace function advance_routine_day(p_routine_id uuid)
returns void language plpgsql security definer as $$
declare
  v_total_days integer;
  v_current    integer;
begin
  select count(*) into v_total_days
  from routine_days where routine_id = p_routine_id;

  if v_total_days = 0 then return; end if;

  select current_day_index into v_current
  from routines where id = p_routine_id;

  update routines
  set current_day_index = (v_current + 1) % v_total_days
  where id = p_routine_id;
end;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
--  DONE — schema is ready. Now set your EXPO_PUBLIC_SUPABASE_URL and
--  EXPO_PUBLIC_SUPABASE_ANON_KEY in .env (see .env.example).
-- ══════════════════════════════════════════════════════════════════════════════
