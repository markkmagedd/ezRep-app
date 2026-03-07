// ─────────────────────────────────────────────
//  ezRep — Shared TypeScript Types
//  Mirrors the Supabase PostgreSQL schema exactly
// ─────────────────────────────────────────────

// ─── User ────────────────────────────────────
export interface Profile {
  id: string; // UUID — matches auth.users.id
  username: string;
  display_name: string;
  avatar_url: string | null;
  total_volume_kg: number; // lifetime volume lifted
  total_sessions: number;
  created_at: string;
}

// ─── Exercises ───────────────────────────────
// (runtime representation; library is seeded server-side)
export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_groups: string[];
  equipment: string;
  created_by: string | null; // null = system; uuid = custom user exercise
}

// ─── Workout (solo) ──────────────────────────
export interface Workout {
  id: string;
  user_id: string;
  name: string;
  started_at: string;
  ended_at: string | null;
  total_volume_kg: number;
  notes: string | null;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  exercise_name: string; // denormalised for quick display
  order_index: number;
}

export interface WorkoutSet {
  id: string;
  workout_exercise_id: string;
  set_index: number; // 1-based
  reps: number | null;
  weight_kg: number | null;
  is_warmup: boolean;
  completed: boolean;
  logged_at: string | null;
}

// ─── Session (shared workout room) ───────────
export type SessionStatus = "lobby" | "active" | "completed" | "cancelled";

export interface Session {
  id: string;
  code: string; // 6-char invite code e.g. "ABC123"
  host_id: string;
  status: SessionStatus;
  workout_template_id: string | null; // optional preset
  current_exercise_index: number; // which exercise the group is on
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
}

export interface SessionParticipant {
  id: string;
  session_id: string;
  user_id: string;
  profile: Profile; // joined
  joined_at: string;
  is_ready: boolean; // ready to start from lobby
  left_at: string | null;
  color_index: number; // 0-5, maps to Colors.participants
}

// The exercise queue for a session (ordered list)
export interface SessionExercise {
  id: string;
  session_id: string;
  exercise_id: string;
  exercise_name: string;
  order_index: number;
  target_sets: number;
  target_reps: string; // e.g. "8-12" or "10"
}

// A logged set inside a session (per user)
export interface SessionSet {
  id: string;
  session_exercise_id: string;
  session_id: string;
  user_id: string;
  set_index: number;
  reps: number;
  weight_kg: number;
  logged_at: string;
}

// ─── Post-Session Stats ───────────────────────
export interface ParticipantStats {
  user_id: string;
  username: string;
  display_name: string;
  color_index: number;
  total_volume_kg: number;
  total_reps: number;
  total_sets: number;
  exercises: ExerciseStats[];
}

export interface ExerciseStats {
  exercise_id: string;
  exercise_name: string;
  volume_kg: number;
  total_reps: number;
  sets_logged: number;
  best_set_weight: number; // heaviest single set weight
  best_set_reps: number;
}

export interface SessionStats {
  session_id: string;
  duration_seconds: number;
  participants: ParticipantStats[];
  winner_user_id: string | null; // most total volume
  hardest_trainer_id: string | null;
}

// ─── Realtime Payloads ───────────────────────
// Shape of events broadcast over Supabase Realtime channels

export type RealtimeEventType =
  | "participant_joined"
  | "participant_ready"
  | "participant_left"
  | "set_logged"
  | "exercise_advanced"
  | "session_started"
  | "session_ended";

export interface RealtimeEvent<T = unknown> {
  type: RealtimeEventType;
  payload: T;
  user_id: string;
  timestamp: string;
}

// ─── Navigation param lists ───────────────────
export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppTabParamList = {
  HomeTab: undefined;
  SessionTab: undefined;
  WorkoutTab: undefined;
  ProfileTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  WorkoutLogger: { workoutId?: string };
  ExerciseSelector: { workoutId: string; workoutExerciseId?: string };
};

export type SessionStackParamList = {
  SessionHub: undefined;
  CreateSession: undefined;
  JoinSession: { code?: string };
  SessionLobby: { sessionId: string };
  ActiveSession: { sessionId: string };
  PostSessionStats: { sessionId: string };
};
