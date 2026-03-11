// ─────────────────────────────────────────────
//  ezRep — Routine Store (Zustand)
//  Manages training routines: Routine → Days → Exercises
//  Data: Firestore /users/{uid}/routines/{routineId}
//
//  Each routine is stored as a single Firestore doc.
//  The `days` field is an embedded array where each day
//  contains an `exercises` sub-array (no sub-collections needed).
// ─────────────────────────────────────────────

import { create } from "zustand";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { Routine, RoutineDay, RoutineDayExercise } from "@/types";

// ── Types ────────────────────────────────────────────────────────────────────

export interface DraftDayExercise {
  exercise_id: string;
  exercise_name: string;
  order_index: number;
  target_sets: number;
  target_reps: number;
  target_weight_kg: number | null;
}

export interface DraftDay {
  name: string; // "Push", "Legs", etc.
  exercises: DraftDayExercise[];
}

interface RoutineState {
  routines: Routine[];
  activeRoutine: Routine | null;
  // Loaded day details keyed by routineId
  routineDetails: Record<string, RoutineDay[]>;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadRoutines: () => Promise<void>;
  loadRoutineDetail: (routineId: string) => Promise<void>;
  createRoutine: (name: string, days: DraftDay[]) => Promise<string>;
  setActiveRoutine: (routineId: string) => Promise<void>;
  advanceDay: (routineId: string) => Promise<void>;
  deleteRoutine: (routineId: string) => Promise<void>;
  updateDayExercises: (
    routineDayId: string,
    exercises: DraftDayExercise[],
  ) => Promise<void>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

let _idCtr = 0;
const localId = () => `id_${Date.now()}_${_idCtr++}`;

function docToRoutine(id: string, data: Record<string, any>): Routine {
  return {
    id,
    user_id: data.user_id,
    name: data.name,
    is_active: data.is_active ?? false,
    current_day_index: data.current_day_index ?? 0,
    created_at:
      data.created_at?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  };
}

function docToDays(routineId: string, data: Record<string, any>): RoutineDay[] {
  return (data.days ?? []).map((d: any) => ({
    id: d.id,
    routine_id: routineId,
    day_number: d.day_number,
    name: d.name,
    exercises: (d.exercises ?? []).map(
      (ex: any) =>
        ({
          id: ex.id,
          routine_day_id: d.id,
          exercise_id: ex.exercise_id,
          exercise_name: ex.exercise_name,
          order_index: ex.order_index,
          target_sets: ex.target_sets,
          target_reps: ex.target_reps,
          target_weight_kg: ex.target_weight_kg ?? null,
        }) as RoutineDayExercise,
    ),
  }));
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useRoutineStore = create<RoutineState>((set, get) => ({
  routines: [],
  activeRoutine: null,
  routineDetails: {},
  isLoading: false,
  error: null,

  // ── loadRoutines ──────────────────────────────────────────────────────────
  // Loads all routines and caches their embedded days in routineDetails.
  loadRoutines: async () => {
    const user = auth.currentUser;
    if (!user) return;

    set({ isLoading: true, error: null });
    try {
      const snap = await getDocs(
        query(
          collection(db, "users", user.uid, "routines"),
          orderBy("created_at", "desc"),
        ),
      );

      const routines: Routine[] = [];
      const details: Record<string, RoutineDay[]> = {};

      snap.docs.forEach((d) => {
        const data = d.data();
        routines.push(docToRoutine(d.id, data));
        details[d.id] = docToDays(d.id, data);
      });

      const active = routines.find((r) => r.is_active) ?? null;
      set({ routines, activeRoutine: active, routineDetails: details });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ isLoading: false });
    }
  },

  // ── loadRoutineDetail ─────────────────────────────────────────────────────
  // Days are embedded in the routine doc — re-fetch only if not cached.
  loadRoutineDetail: async (routineId) => {
    const user = auth.currentUser;
    if (!user) return;

    if (get().routineDetails[routineId]) return; // already cached

    set({ isLoading: true, error: null });
    try {
      const snap = await getDoc(
        doc(db, "users", user.uid, "routines", routineId),
      );
      if (snap.exists()) {
        const days = docToDays(routineId, snap.data());
        set((s) => ({
          routineDetails: { ...s.routineDetails, [routineId]: days },
        }));
      }
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ isLoading: false });
    }
  },

  // ── createRoutine ─────────────────────────────────────────────────────────
  // Creates a single Firestore doc with all days + exercises embedded.
  createRoutine: async (name, draftDays) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    set({ isLoading: true, error: null });
    try {
      const routineRef = doc(collection(db, "users", user.uid, "routines"));
      const routineId = routineRef.id;

      const days = draftDays.map((d, i) => ({
        id: localId(),
        day_number: i + 1,
        name: d.name,
        exercises: d.exercises.map((ex) => ({
          id: localId(),
          exercise_id: ex.exercise_id,
          exercise_name: ex.exercise_name,
          order_index: ex.order_index,
          target_sets: ex.target_sets,
          target_reps: ex.target_reps,
          target_weight_kg: ex.target_weight_kg ?? null,
        })),
      }));

      await setDoc(routineRef, {
        user_id: user.uid,
        name,
        is_active: false,
        current_day_index: 0,
        created_at: serverTimestamp(),
        days,
      });

      await get().loadRoutines();
      return routineId;
    } catch (e: any) {
      set({ error: e.message });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  // ── setActiveRoutine ──────────────────────────────────────────────────────
  // Uses a batch to deactivate all other routines then activate the target.
  setActiveRoutine: async (routineId) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const snap = await getDocs(collection(db, "users", user.uid, "routines"));
      const batch = writeBatch(db);
      snap.docs.forEach((d) => {
        batch.update(d.ref, { is_active: false });
      });
      batch.update(doc(db, "users", user.uid, "routines", routineId), {
        is_active: true,
      });
      await batch.commit();
      await get().loadRoutines();
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  // ── advanceDay ────────────────────────────────────────────────────────────
  // Moves current_day_index to the next day (wraps around).
  advanceDay: async (routineId) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const routineRef = doc(db, "users", user.uid, "routines", routineId);
      const snap = await getDoc(routineRef);
      if (!snap.exists()) return;

      const data = snap.data();
      const total = (data.days ?? []).length;
      const next = total > 0 ? (data.current_day_index + 1) % total : 0;
      await updateDoc(routineRef, { current_day_index: next });
      await get().loadRoutines();
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  // ── deleteRoutine ─────────────────────────────────────────────────────────
  deleteRoutine: async (routineId) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await deleteDoc(doc(db, "users", user.uid, "routines", routineId));
      set((s) => {
        const routines = s.routines.filter((r) => r.id !== routineId);
        const { [routineId]: _, ...rest } = s.routineDetails;
        return {
          routines,
          activeRoutine:
            s.activeRoutine?.id === routineId ? null : s.activeRoutine,
          routineDetails: rest,
        };
      });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  // ── updateDayExercises ────────────────────────────────────────────────────
  // Finds the routine owning the day, replaces its exercises in the embedded array.
  updateDayExercises: async (routineDayId, exercises) => {
    const user = auth.currentUser;
    if (!user) return;

    const { routines, routineDetails } = get();
    let routineId: string | null = null;
    for (const r of routines) {
      if ((routineDetails[r.id] ?? []).some((d) => d.id === routineDayId)) {
        routineId = r.id;
        break;
      }
    }
    if (!routineId) return;

    try {
      const routineRef = doc(db, "users", user.uid, "routines", routineId);
      const snap = await getDoc(routineRef);
      if (!snap.exists()) return;

      const data = snap.data();
      const updatedDays = (data.days ?? []).map((d: any) => {
        if (d.id !== routineDayId) return d;
        return {
          ...d,
          exercises: exercises.map((ex) => ({
            id: localId(),
            exercise_id: ex.exercise_id,
            exercise_name: ex.exercise_name,
            order_index: ex.order_index,
            target_sets: ex.target_sets,
            target_reps: ex.target_reps,
            target_weight_kg: ex.target_weight_kg ?? null,
          })),
        };
      });

      await updateDoc(routineRef, { days: updatedDays });
      await get().loadRoutines();
    } catch (e: any) {
      set({ error: e.message });
    }
  },
}));
