// ─────────────────────────────────────────────
//  ezRep — Shared TypeScript Types
// ─────────────────────────────────────────────

// ─── User ────────────────────────────────────
export interface Profile {
  id: string; // UUID — matches auth.users.id
  username: string;
  display_name: string;
  avatar_url: string | null;
  total_volume_kg: number; // lifetime volume lifted
  total_sessions: number;
  total_workouts: number;
  total_training_seconds: number;
  created_at: string;
}

// ─── Exercises ───────────────────────────────
export type ExerciseCategory =
  | "chest"
  | "back"
  | "shoulders"
  | "arms"
  | "legs"
  | "core"
  | "cardio"
  | "full_body";

export type ExerciseType = "STRENGTH" | "CARDIO" | "FLEXIBILITY";

export interface ExerciseRecord {
  exerciseId: string;
  name: string;
  imageUrl?: string;
  videoUrl?: string;
  equipments?: string[];
  bodyParts: string[];
  gender?: "male" | "female" | "unisex";
  exerciseType?: ExerciseType;
  targetMuscles: string[];
  secondaryMuscles?: string[];
  keywords?: string[];
  overview?: string;
  instructions: string[];
  exerciseTips?: string[];
  variations?: string[];
  relatedIds?: string[];
}

// (runtime representation; library is seeded server-side)
export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscle_groups: string[];
  equipment: string;
  created_by: string | null; // null = system; uuid = custom user exercise
}

export interface PendingWorkout {
  exerciseId: string;
  exerciseName: string;
  reps: string;
  sets: string;
}

// ─── Routines ────────────────────────────────
export interface Routine {
  id: string;
  user_id: string;
  name: string; // e.g. "Push Pull Legs"
  is_active: boolean; // only one routine is active at a time
  current_day_index: number; // 0-based index into routine_days
  created_at: string;
}

export interface RoutineDay {
  id: string;
  routine_id: string;
  day_number: number; // 1-based
  name: string; // e.g. "Legs", "Push", "Pull"
  exercises: RoutineDayExercise[];
}

export interface RoutineDayExercise {
  id: string;
  routine_day_id: string;
  exercise_id: string;
  exercise_name: string;
  order_index: number;
  target_sets: number;
  target_reps: number;
  target_weight_kg: number | null;
}

// ─── Workout (solo) ──────────────────────────
export interface Workout {
  id: string;
  user_id: string;
  routine_id: string | null; // linked routine (if any)
  routine_day_id: string | null; // which day was performed
  name: string;
  started_at: string;
  ended_at: string | null;
  total_volume_kg: number;
  notes: string | null;
  exercises?: any[]; // Embedded on completion for historical display
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
  WorkoutLogger: {
    workoutId?: string;
    routineDayId?: string;
    routineDayName?: string;
  };
  ExerciseSelector: { workoutId: string; workoutExerciseId?: string };
  ExerciseDetail: { exerciseId: string };
  YearlyConsistency: undefined;
};

export type WorkoutStackParamList = {
  RoutineList: undefined;
  CreateRoutine: { routineId?: string };
  RoutineDetail: { routineId: string };
  WorkoutLogger: { routineDayId?: string; routineDayName?: string };
  ExerciseSelector: { workoutId: string };
  ExerciseDetail: { exerciseId: string };
};

export type SessionStackParamList = {
  SessionHub: undefined;
  CreateSession: undefined;
  JoinSession: { code?: string };
  SessionLobby: { sessionId: string };
  ActiveSession: { sessionId: string };
  PostSessionStats: { sessionId: string };
  SessionHistory: undefined;
};
