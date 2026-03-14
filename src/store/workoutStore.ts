// ─────────────────────────────────────────────
//  ezRep — Workout Store (Zustand)
//  Manages the active solo workout in-memory,
//  then persists to Firestore on completion.
//  Data: Firestore /users/{uid}/workouts/{workoutId}
//  Each workout doc embeds its exercises + completed sets as arrays.
// ─────────────────────────────────────────────

import { create } from "zustand";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as fsLimit,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { Workout } from "@/types";
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

export interface StartWorkoutOptions {
  name?: string;
  routineDayId?: string; // if set, pre-loads exercises from this routine day
  routineId?: string; // the parent routine (for day advancement after finish)
}

interface WorkoutState {
  // Active workout
  activeWorkout: Workout | null;
  exercises: DraftExercise[];
  startedAt: Date | null;
  linkedRoutineId: string | null;
  workoutMinimized: boolean;
  isPaused: boolean;
  pausedMs: number;
  pauseStartedAt: number | null;
  isLoading: boolean;
  error: string | null;

  // Recent workouts list
  recentWorkouts: Workout[];

  // Actions
  startWorkout: (options?: StartWorkoutOptions) => Promise<string>; // returns workoutId
  addExercise: (exerciseId: string, exerciseName: string) => string;
  addExercises: (items: { id: string; name: string }[]) => void;
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
  minimizeWorkout: () => void;
  resumeWorkout: () => void;
  pauseWorkout: () => void;
  unpauseWorkout: () => void;

  loadRecentWorkouts: (limit?: number) => Promise<void>;
  loadWorkout: (workoutId: string) => Promise<void>;
}

let _setCounter = 0;
const uid = () => `local_${Date.now()}_${_setCounter++}`;

/** Map a Firestore document to the Workout type. */
function docToWorkout(id: string, data: Record<string, any>): Workout {
  return {
    id,
    user_id: data.user_id,
    routine_id: data.routine_id ?? null,
    routine_day_id: data.routine_day_id ?? null,
    name: data.name,
    started_at:
      data.started_at?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    ended_at: data.ended_at?.toDate?.()?.toISOString() ?? null,
    total_volume_kg: data.total_volume_kg ?? 0,
    notes: data.notes ?? null,
    exercises: data.exercises ?? [],
  };
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  activeWorkout: null,
  exercises: [],
  startedAt: null,
  linkedRoutineId: null,
  workoutMinimized: false,
  isPaused: false,
  pausedMs: 0,
  pauseStartedAt: null,
  isLoading: false,
  error: null,
  recentWorkouts: [],

  // ── startWorkout ─────────────────────────────────────────────────────────
  startWorkout: async (options = {}) => {
    const { name = "Workout", routineDayId, routineId } = options;
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    const startedAt = new Date();

    const docRef = await addDoc(collection(db, "users", user.uid, "workouts"), {
      user_id: user.uid,
      name,
      started_at: serverTimestamp(),
      ended_at: null,
      total_volume_kg: 0,
      routine_id: routineId ?? null,
      routine_day_id: routineDayId ?? null,
      notes: null,
    });

    const workout: Workout = {
      id: docRef.id,
      user_id: user.uid,
      routine_id: routineId ?? null,
      routine_day_id: routineDayId ?? null,
      name,
      started_at: startedAt.toISOString(),
      ended_at: null,
      total_volume_kg: 0,
      notes: null,
    };

    set({
      activeWorkout: workout,
      exercises: [],
      startedAt,
      linkedRoutineId: routineId ?? null,
      error: null,
    });

    // Pre-load exercises from the embedded routine day, if applicable
    if (routineDayId && routineId) {
      const routineSnap = await getDoc(
        doc(db, "users", user.uid, "routines", routineId),
      );
      if (routineSnap.exists()) {
        const routineData = routineSnap.data();
        const targetDay = (routineData.days ?? []).find(
          (d: any) => d.id === routineDayId,
        );
        if (targetDay) {
          const preloaded: DraftExercise[] = (targetDay.exercises ?? []).map(
            (ex: any, i: number) => ({
              id: uid(),
              exercise_id: ex.exercise_id,
              exercise_name: ex.exercise_name,
              order_index: i,
              sets: Array.from({ length: ex.target_sets }, (_, si) => ({
                id: uid(),
                set_index: si + 1,
                reps: ex.target_reps,
                weight_kg: ex.target_weight_kg ?? null,
                is_warmup: false,
                completed: false,
              })),
            }),
          );
          set({ exercises: preloaded });
        }
      }
    }

    return docRef.id;
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

  // ── addExercises ─────────────────────────────────────────────────────────
  addExercises: (items) => {
    const { exercises } = get();
    const newDrafts: DraftExercise[] = items.map((item, i) => ({
      id: uid(),
      exercise_id: item.id,
      exercise_name: item.name,
      order_index: exercises.length + i,
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
    }));

    set({ exercises: [...exercises, ...newDrafts] });
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
  // Persists the workout as a single Firestore doc update.
  // Exercises and completed sets are embedded as arrays within the workout doc.
  finishWorkout: async () => {
    const { activeWorkout, exercises, linkedRoutineId } = get();
    if (!activeWorkout) return;
    const user = auth.currentUser;
    if (!user) return;

    set({ isLoading: true });
    try {
      const endedAt = new Date();
      let totalVolume = 0;
      const durationSeconds = activeWorkout.started_at
        ? Math.round(
            (endedAt.getTime() - new Date(activeWorkout.started_at).getTime()) /
              1000,
          )
        : 0;

      const exercisesPayload = exercises.map((ex) => {
        const completedSets = ex.sets.filter((s) => s.completed);
        for (const s of completedSets) {
          if (s.reps && s.weight_kg) totalVolume += s.reps * s.weight_kg;
        }
        return {
          id: ex.id,
          exercise_id: ex.exercise_id,
          exercise_name: ex.exercise_name,
          order_index: ex.order_index,
          sets: completedSets.map((s) => ({
            id: s.id,
            set_index: s.set_index,
            reps: s.reps,
            weight_kg: s.weight_kg,
            is_warmup: s.is_warmup,
            logged_at: endedAt.toISOString(),
          })),
        };
      });

      // Update workout doc: mark complete and embed exercises
      await updateDoc(
        doc(db, "users", user.uid, "workouts", activeWorkout.id),
        {
          ended_at: serverTimestamp(),
          total_volume_kg: totalVolume,
          exercises: exercisesPayload,
        },
      );

      // Increment lifetime stats on the user profile doc
      await updateDoc(doc(db, "users", user.uid), {
        total_volume_kg: increment(totalVolume),
        total_workouts: increment(1),
        total_training_seconds: increment(durationSeconds),
      });

      // Advance the linked routine to the next day (wraps around)
      if (linkedRoutineId) {
        const routineRef = doc(
          db,
          "users",
          user.uid,
          "routines",
          linkedRoutineId,
        );
        const routineSnap = await getDoc(routineRef);
        if (routineSnap.exists()) {
          const data = routineSnap.data();
          const total = (data.days ?? []).length;
          const next = total > 0 ? (data.current_day_index + 1) % total : 0;
          await updateDoc(routineRef, { current_day_index: next });
        }
      }

      set({
        activeWorkout: null,
        exercises: [],
        startedAt: null,
        linkedRoutineId: null,
        workoutMinimized: false,
        isPaused: false,
        pausedMs: 0,
        pauseStartedAt: null,
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
    const user = auth.currentUser;
    if (activeWorkout && user) {
      deleteDoc(doc(db, "users", user.uid, "workouts", activeWorkout.id)).catch(
        () => {},
      );
    }
    set({
      activeWorkout: null,
      exercises: [],
      startedAt: null,
      linkedRoutineId: null,
      workoutMinimized: false,
      isPaused: false,
      pausedMs: 0,
      pauseStartedAt: null,
      error: null,
    });
  },

  minimizeWorkout: () => set({ workoutMinimized: true }),
  resumeWorkout: () => set({ workoutMinimized: false }),
  pauseWorkout: () => set({ isPaused: true, pauseStartedAt: Date.now() }),
  unpauseWorkout: () => {
    const { pausedMs, pauseStartedAt } = get();
    const extra = pauseStartedAt !== null ? Date.now() - pauseStartedAt : 0;
    set({ isPaused: false, pausedMs: pausedMs + extra, pauseStartedAt: null });
  },

  // ── loadRecentWorkouts ───────────────────────────────────────────────────
  loadRecentWorkouts: async (n = 10) => {
    const user = auth.currentUser;
    if (!user) return;

    const snap = await getDocs(
      query(
        collection(db, "users", user.uid, "workouts"),
        where("ended_at", "!=", null),
        orderBy("ended_at", "desc"),
        fsLimit(n),
      ),
    );
    set({ recentWorkouts: snap.docs.map((d) => docToWorkout(d.id, d.data())) });
  },

  // ── loadWorkout ──────────────────────────────────────────────────────────
  loadWorkout: async (workoutId) => {
    const user = auth.currentUser;
    if (!user) return;

    set({ isLoading: true });
    const snap = await getDoc(
      doc(db, "users", user.uid, "workouts", workoutId),
    );
    if (snap.exists()) {
      set({
        activeWorkout: docToWorkout(snap.id, snap.data()),
        isLoading: false,
      });
    } else {
      set({ isLoading: false });
    }
  },
}));
