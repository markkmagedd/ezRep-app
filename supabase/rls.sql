-- ══════════════════════════════════════════════════════════════════════════════
--  ezRep — RLS Policies, Auth Trigger & Realtime
--
--  Run this ONCE in the Supabase SQL Editor AFTER running:
--    npx prisma db push
--
--  Safe to re-run — all statements use IF NOT EXISTS / OR REPLACE / DROP IF EXISTS.
-- ══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
--  Auth trigger: auto-create a profile row when a user signs up
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, username, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
--  Username format constraint (lowercase, alphanumeric + underscore, 3–20 chars)
-- ─────────────────────────────────────────────────────────────────────────────
alter table profiles
  drop constraint if exists profiles_username_format;
alter table profiles
  add constraint profiles_username_format
  check (username ~ '^[a-z0-9_]{3,20}$');

-- ─────────────────────────────────────────────────────────────────────────────
--  RLS — profiles
-- ─────────────────────────────────────────────────────────────────────────────
alter table profiles enable row level security;

drop policy if exists "profiles: public read"   on profiles;
drop policy if exists "profiles: owner update"  on profiles;

create policy "profiles: public read"
  on profiles for select using (true);

create policy "profiles: owner update"
  on profiles for update using (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────────────────────
--  RLS — workouts
-- ─────────────────────────────────────────────────────────────────────────────
alter table workouts enable row level security;

drop policy if exists "workouts: owner all" on workouts;

create policy "workouts: owner all"
  on workouts for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
--  RLS — workout_exercises
-- ─────────────────────────────────────────────────────────────────────────────
alter table workout_exercises enable row level security;

drop policy if exists "workout_exercises: owner all" on workout_exercises;

create policy "workout_exercises: owner all"
  on workout_exercises for all
  using (
    exists (
      select 1 from workouts w
      where w.id = workout_exercises.workout_id and w.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
--  RLS — workout_sets
-- ─────────────────────────────────────────────────────────────────────────────
alter table workout_sets enable row level security;

drop policy if exists "workout_sets: owner all" on workout_sets;

create policy "workout_sets: owner all"
  on workout_sets for all
  using (
    exists (
      select 1
      from workout_exercises we
      join workouts w on w.id = we.workout_id
      where we.id = workout_sets.workout_exercise_id and w.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
--  RLS — sessions
-- ─────────────────────────────────────────────────────────────────────────────
alter table sessions enable row level security;

drop policy if exists "sessions: participant read" on sessions;
drop policy if exists "sessions: host insert"      on sessions;
drop policy if exists "sessions: host update"      on sessions;

create policy "sessions: participant read"
  on sessions for select using (
    host_id = auth.uid()
    or exists (
      select 1 from session_participants sp
      where sp.session_id = sessions.id and sp.user_id = auth.uid()
    )
  );

create policy "sessions: host insert"
  on sessions for insert with check (auth.uid() = host_id);

create policy "sessions: host update"
  on sessions for update using (auth.uid() = host_id);

-- ─────────────────────────────────────────────────────────────────────────────
--  RLS — session_participants
-- ─────────────────────────────────────────────────────────────────────────────
alter table session_participants enable row level security;

drop policy if exists "session_participants: read"         on session_participants;
drop policy if exists "session_participants: insert self"  on session_participants;
drop policy if exists "session_participants: update self"  on session_participants;

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

-- ─────────────────────────────────────────────────────────────────────────────
--  RLS — session_exercises
-- ─────────────────────────────────────────────────────────────────────────────
alter table session_exercises enable row level security;

drop policy if exists "session_exercises: participant read" on session_exercises;
drop policy if exists "session_exercises: host insert"      on session_exercises;

create policy "session_exercises: participant read"
  on session_exercises for select using (
    exists (
      select 1 from session_participants sp
      where sp.session_id = session_exercises.session_id and sp.user_id = auth.uid()
    )
  );

create policy "session_exercises: host insert"
  on session_exercises for insert with check (
    exists (
      select 1 from sessions s
      where s.id = session_exercises.session_id and s.host_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
--  RLS — session_sets
-- ─────────────────────────────────────────────────────────────────────────────
alter table session_sets enable row level security;

drop policy if exists "session_sets: participant read" on session_sets;
drop policy if exists "session_sets: insert own"       on session_sets;

create policy "session_sets: participant read"
  on session_sets for select using (
    exists (
      select 1 from session_participants sp
      where sp.session_id = session_sets.session_id and sp.user_id = auth.uid()
    )
  );

create policy "session_sets: insert own"
  on session_sets for insert with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
--  RLS — routines
-- ─────────────────────────────────────────────────────────────────────────────
alter table routines enable row level security;

drop policy if exists "routines: owner all" on routines;

create policy "routines: owner all"
  on routines for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
--  RLS — routine_days
-- ─────────────────────────────────────────────────────────────────────────────
alter table routine_days enable row level security;

drop policy if exists "routine_days: owner all" on routine_days;

create policy "routine_days: owner all"
  on routine_days for all using (
    exists (
      select 1 from routines r
      where r.id = routine_days.routine_id and r.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
--  RLS — routine_day_exercises
-- ─────────────────────────────────────────────────────────────────────────────
alter table routine_day_exercises enable row level security;

drop policy if exists "routine_day_exercises: owner all" on routine_day_exercises;

create policy "routine_day_exercises: owner all"
  on routine_day_exercises for all using (
    exists (
      select 1 from routine_days rd
      join routines r on r.id = rd.routine_id
      where rd.id = routine_day_exercises.routine_day_id
        and r.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
--  RPC: increment_user_stats
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
--  RPC: advance_routine_day
-- ─────────────────────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────────────────────
--  Realtime publications
-- ─────────────────────────────────────────────────────────────────────────────
alter publication supabase_realtime add table sessions;
alter publication supabase_realtime add table session_participants;
alter publication supabase_realtime add table session_sets;
