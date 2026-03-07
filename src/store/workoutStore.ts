// ─────────────────────────────────────────────
//  ezRep — Workout Store (Zustand)
//  Manages the active solo workout session in-memory,
//  then persists to Supabase on completion.
// ─────────────────────────────────────────────

import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Workout, WorkoutExercise, WorkoutSet } from "@/types";
import { useAuthStore } from "./authStore";

// ── Local draft types (in-progress workout) ──────────────────────────────────

export interface DraftSet {
  id: string; // local UUID (no server sync until save)
  set_index: number;
  reps: number | null;
  weight_kg: number | null;
  is_warmup: boolean;
  completed: boolean;
}

export interface DraftExercise {
  id: string; // workoutExercise id
  exercise_id: string;
  exercise_name: string;
  order_index: number;
  sets: DraftSet[];
}

interface WorkoutState {
  // Active workout
  activeWorkout: Workout | null;
  exercises: DraftExercise[];
  startedAt: Date | null;
  isLoading: boolean;
  error: string | null;

  // Recent workouts list
  recentWorkouts: Workout[];

  // Actions
  startWorkout: (name?: string) => Promise<string>; // returns workoutId
  addExercise: (exerciseId: string, exerciseName: string) => string;
  removeExercise: (workoutExerciseId: string) => void;
  reorderExercises: (from: number, to: number) => void;

  addSet: (workoutExerciseId: string) => void;
  updateSet: (
    workoutExerciseId: string,
    setId: string,
    updates: Partial<DraftSet>,
  ) => void;
  removeSet: (workoutExerciseId: string, setId: string) => void;
  completeSet: (workoutExerciseId: string, setId: string) => void;

  finishWorkout: () => Promise<void>;
  discardWorkout: () => void;

  loadRecentWorkouts: (limit?: number) => Promise<void>;
  loadWorkout: (workoutId: string) => Promise<void>;
}

let _setCounter = 0;
const uid = () => `local_${Date.now()}_${_setCounter++}`;

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  activeWorkout: null,
  exercises: [],
  startedAt: null,
  isLoading: false,
  error: null,
  recentWorkouts: [],

  // ── startWorkout ─────────────────────────────────────────────────────────
  startWorkout: async (name = "Workout") => {
    const profile = useAuthStore.getState().profile;
    if (!profile) throw new Error("Not authenticated");

    const startedAt = new Date();
    const { data, error } = await supabase
      .from("workouts")
      .insert({
        user_id: profile.id,
        name,
        started_at: startedAt.toISOString(),
        total_volume_kg: 0,
      })
      .select()
      .single();

    if (error) throw error;

    set({
      activeWorkout: data as Workout,
      exercises: [],
      startedAt,
      error: null,
    });

    return data.id;
  },

  // ── addExercise ──────────────────────────────────────────────────────────
  addExercise: (exerciseId, exerciseName) => {
    const { exercises } = get();
    const id = uid();

    const newExercise: DraftExercise = {
      id,
      exercise_id: exerciseId,
      exercise_name: exerciseName,
      order_index: exercises.length,
      sets: [
        {
          id: uid(),
          set_index: 1,
          reps: null,
          weight_kg: null,
          is_warmup: false,
          completed: false,
        },
      ],
    };

    set({ exercises: [...exercises, newExercise] });
    return id;
  },

  // ── removeExercise ───────────────────────────────────────────────────────
  removeExercise: (workoutExerciseId) => {
    set((s) => ({
      exercises: s.exercises
        .filter((e) => e.id !== workoutExerciseId)
        .map((e, i) => ({ ...e, order_index: i })),
    }));
  },

  // ── reorderExercises ─────────────────────────────────────────────────────
  reorderExercises: (from, to) => {
    set((s) => {
      const list = [...s.exercises];
      const [moved] = list.splice(from, 1);
      list.splice(to, 0, moved);
      return { exercises: list.map((e, i) => ({ ...e, order_index: i })) };
    });
  },

  // ── addSet ───────────────────────────────────────────────────────────────
  addSet: (workoutExerciseId) => {
    set((s) => ({
      exercises: s.exercises.map((e) => {
        if (e.id !== workoutExerciseId) return e;
        const lastSet = e.sets[e.sets.length - 1];
        return {
          ...e,
          sets: [
            ...e.sets,
            {
              id: uid(),
              set_index: e.sets.length + 1,
              // Pre-fill from last set for convenience
              reps: lastSet?.reps ?? null,
              weight_kg: lastSet?.weight_kg ?? null,
              is_warmup: false,
              completed: false,
            },
          ],
        };
      }),
    }));
  },

  // ── updateSet ────────────────────────────────────────────────────────────
  updateSet: (workoutExerciseId, setId, updates) => {
    set((s) => ({
      exercises: s.exercises.map((e) => {
        if (e.id !== workoutExerciseId) return e;
        return {
          ...e,
          sets: e.sets.map((s) => (s.id === setId ? { ...s, ...updates } : s)),
        };
      }),
    }));
  },

  // ── removeSet ────────────────────────────────────────────────────────────
  removeSet: (workoutExerciseId, setId) => {
    set((s) => ({
      exercises: s.exercises.map((e) => {
        if (e.id !== workoutExerciseId) return e;
        return {
          ...e,
          sets: e.sets
            .filter((s) => s.id !== setId)
            .map((s, i) => ({ ...s, set_index: i + 1 })),
        };
      }),
    }));
  },

  // ── completeSet ──────────────────────────────────────────────────────────
  completeSet: (workoutExerciseId, setId) => {
    get().updateSet(workoutExerciseId, setId, { completed: true });
  },

  // ── finishWorkout ────────────────────────────────────────────────────────
  // Persist all exercises and completed sets to Supabase
  finishWorkout: async () => {
    const { activeWorkout, exercises } = get();
    if (!activeWorkout) return;

    set({ isLoading: true });

    try {
      const endedAt = new Date().toISOString();

      // Calculate total volume from completed sets
      let totalVolume = 0;
      for (const ex of exercises) {
        for (const s of ex.sets) {
          if (s.completed && s.reps && s.weight_kg) {
            totalVolume += s.reps * s.weight_kg;
          }
        }
      }

      // Persist workout exercises
      for (const ex of exercises) {
        const { data: weRow } = await supabase
          .from("workout_exercises")
          .insert({
            workout_id: activeWorkout.id,
            exercise_id: ex.exercise_id,
            exercise_name: ex.exercise_name,
            order_index: ex.order_index,
          })
          .select()
          .single();

        if (!weRow) continue;

        // Persist completed sets
        const completedSets = ex.sets
          .filter((s) => s.completed)
          .map((s) => ({
            workout_exercise_id: weRow.id,
            set_index: s.set_index,
            reps: s.reps,
            weight_kg: s.weight_kg,
            is_warmup: s.is_warmup,
            completed: true,
            logged_at: endedAt,
          }));

        if (completedSets.length > 0) {
          await supabase.from("workout_sets").insert(completedSets);
        }
      }

      // Finalise workout row
      await supabase
        .from("workouts")
        .update({ ended_at: endedAt, total_volume_kg: totalVolume })
        .eq("id", activeWorkout.id);

      // Increment user lifetime stats
      const profile = useAuthStore.getState().profile;
      if (profile) {
        await supabase.rpc("increment_user_stats", {
          p_user_id: profile.id,
          p_volume: totalVolume,
          p_sessions: 0, // solo workout, not a session
        });
      }

      set({
        activeWorkout: null,
        exercises: [],
        startedAt: null,
        isLoading: false,
      });
    } catch (err: unknown) {
      set({ error: String(err), isLoading: false });
      throw err;
    }
  },

  // ── discardWorkout ───────────────────────────────────────────────────────
  discardWorkout: () => {
    const { activeWorkout } = get();
    // Delete the empty workout row to keep the DB clean
    if (activeWorkout) {
      supabase
        .from("workouts")
        .delete()
        .eq("id", activeWorkout.id)
        .then(() => {});
    }
    set({ activeWorkout: null, exercises: [], startedAt: null, error: null });
  },

  // ── loadRecentWorkouts ───────────────────────────────────────────────────
  loadRecentWorkouts: async (limit = 10) => {
    const profile = useAuthStore.getState().profile;
    if (!profile) return;

    const { data } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", profile.id)
      .not("ended_at", "is", null)
      .order("started_at", { ascending: false })
      .limit(limit);

    set({ recentWorkouts: (data ?? []) as Workout[] });
  },

  // ── loadWorkout ──────────────────────────────────────────────────────────
  // Load a past workout for read-only display
  loadWorkout: async (workoutId) => {
    set({ isLoading: true });
    const { data } = await supabase
      .from("workouts")
      .select("*")
      .eq("id", workoutId)
      .single();
    if (data) {
      set({ activeWorkout: data as Workout, isLoading: false });
    }
  },
}));
