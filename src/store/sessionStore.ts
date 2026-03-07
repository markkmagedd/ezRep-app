// ─────────────────────────────────────────────
//  ezRep — Session Store (Zustand)
//  Core state machine for the real-time shared workout Session.
//
//  Architecture summary:
//  ─────────────────────
//  Each session has a Supabase Realtime channel named "session:{sessionId}".
//  All participants subscribe to this channel; the host also writes to it.
//
//  Postgres DB tables track persistent state (participants, logged sets, etc.)
//  Realtime Broadcast handles ephemeral / low-latency events (set_logged, etc.)
//
//  State machine: lobby → active → completed
// ─────────────────────────────────────────────

import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type {
  Session,
  SessionParticipant,
  SessionExercise,
  SessionSet,
  SessionStats,
  ParticipantStats,
  ExerciseStats,
} from "@/types";
import { useAuthStore } from "./authStore";
import type { RealtimeChannel } from "@supabase/supabase-js";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Generate a random 6-char invite code (digits + uppercase letters). */
function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

/** Compute per-user aggregate stats from raw session sets. */
function buildStats(
  participants: SessionParticipant[],
  exercises: SessionExercise[],
  allSets: SessionSet[],
  durationSeconds: number,
): SessionStats {
  const participantStats: ParticipantStats[] = participants.map((p) => {
    const userSets = allSets.filter((s) => s.user_id === p.user_id);

    const exerciseStats: ExerciseStats[] = exercises.map((ex) => {
      const exSets = userSets.filter((s) => s.session_exercise_id === ex.id);
      const volume = exSets.reduce((acc, s) => acc + s.reps * s.weight_kg, 0);
      const totalReps = exSets.reduce((acc, s) => acc + s.reps, 0);
      const bestSet = exSets.reduce(
        (best, s) => (s.weight_kg > best.weight_kg ? s : best),
        exSets[0] ?? { weight_kg: 0, reps: 0 },
      );
      return {
        exercise_id: ex.exercise_id,
        exercise_name: ex.exercise_name,
        volume_kg: volume,
        total_reps: totalReps,
        sets_logged: exSets.length,
        best_set_weight: bestSet?.weight_kg ?? 0,
        best_set_reps: bestSet?.reps ?? 0,
      };
    });

    const totalVolume = exerciseStats.reduce((a, e) => a + e.volume_kg, 0);
    const totalReps = exerciseStats.reduce((a, e) => a + e.total_reps, 0);
    const totalSets = exerciseStats.reduce((a, e) => a + e.sets_logged, 0);

    return {
      user_id: p.user_id,
      username: p.profile.username,
      display_name: p.profile.display_name,
      color_index: p.color_index,
      total_volume_kg: totalVolume,
      total_reps: totalReps,
      total_sets: totalSets,
      exercises: exerciseStats,
    };
  });

  // Winner = most total volume
  const sorted = [...participantStats].sort(
    (a, b) => b.total_volume_kg - a.total_volume_kg,
  );
  const winner = sorted[0] ?? null;

  // Hardest trainer = best average weight × total sets ratio
  const hardest =
    [...participantStats].sort((a, b) => {
      const scoreA = a.total_volume_kg / Math.max(a.total_sets, 1);
      const scoreB = b.total_volume_kg / Math.max(b.total_sets, 1);
      return scoreB - scoreA;
    })[0] ?? null;

  return {
    session_id: participants[0]?.session_id ?? "",
    duration_seconds: durationSeconds,
    participants: participantStats,
    winner_user_id: winner?.user_id ?? null,
    hardest_trainer_id: hardest?.user_id ?? null,
  };
}

// ── Store interface ──────────────────────────────────────────────────────────

interface SessionState {
  // Current session data
  session: Session | null;
  participants: SessionParticipant[];
  exercises: SessionExercise[];
  // All sets logged by ALL participants (the "live feed")
  allSets: SessionSet[];
  // Post-session computed stats
  stats: SessionStats | null;

  // Live UI state (ephemeral)
  currentExerciseIndex: number;
  isHost: boolean;
  isLoading: boolean;
  error: string | null;

  // Internal channel reference (not serialised)
  _channel: RealtimeChannel | null;

  // Actions
  createSession: (
    exercises: Array<{
      id: string;
      name: string;
      targetSets: number;
      targetReps: string;
    }>,
  ) => Promise<Session>;
  joinSession: (code: string) => Promise<Session>;
  leaveSession: () => Promise<void>;

  setReady: () => Promise<void>;
  startSession: () => Promise<void>; // host only

  logSet: (
    sessionExerciseId: string,
    reps: number,
    weightKg: number,
  ) => Promise<void>;
  advanceExercise: () => Promise<void>; // host only — move to next exercise

  endSession: () => Promise<void>;
  loadStats: (sessionId: string) => Promise<SessionStats>;

  // Internal
  _subscribe: (sessionId: string) => void;
  _unsubscribe: () => void;
  _applyBroadcast: (event: string, payload: unknown) => void;
}

// ── Store implementation ──────────────────────────────────────────────────────

export const useSessionStore = create<SessionState>((set, get) => ({
  session: null,
  participants: [],
  exercises: [],
  allSets: [],
  stats: null,
  currentExerciseIndex: 0,
  isHost: false,
  isLoading: false,
  error: null,
  _channel: null,

  // ── createSession ─────────────────────────────────────────────────────────
  createSession: async (exerciseDefs) => {
    const profile = useAuthStore.getState().profile;
    if (!profile) throw new Error("Not authenticated");

    set({ isLoading: true, error: null });

    let code = generateCode();
    // Ensure uniqueness (retry once on collision — astronomically rare)
    const { data: existing } = await supabase
      .from("sessions")
      .select("id")
      .eq("code", code)
      .maybeSingle();
    if (existing) code = generateCode();

    // Insert session row
    const { data: sessionRow, error: sessionErr } = await supabase
      .from("sessions")
      .insert({
        code,
        host_id: profile.id,
        status: "lobby",
        current_exercise_index: 0,
      })
      .select()
      .single();

    if (sessionErr || !sessionRow)
      throw sessionErr ?? new Error("Session creation failed");
    const session = sessionRow as Session;

    // Insert exercise queue
    const exerciseRows = exerciseDefs.map((e, i) => ({
      session_id: session.id,
      exercise_id: e.id,
      exercise_name: e.name,
      order_index: i,
      target_sets: e.targetSets,
      target_reps: e.targetReps,
    }));
    const { data: exRows } = await supabase
      .from("session_exercises")
      .insert(exerciseRows)
      .select();

    // Join as host participant (color_index 0 = accent lime)
    const { data: participantRow } = await supabase
      .from("session_participants")
      .insert({
        session_id: session.id,
        user_id: profile.id,
        color_index: 0,
        is_ready: false,
      })
      .select(
        `
        *,
        profile:profiles(*)
      `,
      )
      .single();

    set({
      session,
      exercises: (exRows ?? []) as SessionExercise[],
      participants: participantRow
        ? [participantRow as SessionParticipant]
        : [],
      allSets: [],
      currentExerciseIndex: 0,
      isHost: true,
      isLoading: false,
    });

    get()._subscribe(session.id);
    return session;
  },

  // ── joinSession ───────────────────────────────────────────────────────────
  joinSession: async (code) => {
    const profile = useAuthStore.getState().profile;
    if (!profile) throw new Error("Not authenticated");

    set({ isLoading: true, error: null });

    // Find session by code
    const { data: sessionRow, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("code", code.toUpperCase())
      .in("status", ["lobby", "active"])
      .single();

    if (error || !sessionRow) {
      const msg = "Session not found or already finished.";
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
    const session = sessionRow as Session;

    // Determine next color_index
    const { data: existingParticipants } = await supabase
      .from("session_participants")
      .select("color_index")
      .eq("session_id", session.id)
      .is("left_at", null);

    const usedColors = new Set(
      (existingParticipants ?? []).map((p: any) => p.color_index),
    );
    let colorIndex = 0;
    while (usedColors.has(colorIndex)) colorIndex++;

    // Insert participant
    const { data: participantRow } = await supabase
      .from("session_participants")
      .insert({
        session_id: session.id,
        user_id: profile.id,
        color_index: colorIndex,
        is_ready: false,
      })
      .select(`*, profile:profiles(*)`)
      .single();

    // Fetch full participant list and exercise queue
    const [
      { data: allParticipants },
      { data: allExercises },
      { data: existingSets },
    ] = await Promise.all([
      supabase
        .from("session_participants")
        .select("*, profile:profiles(*)")
        .eq("session_id", session.id)
        .is("left_at", null),
      supabase
        .from("session_exercises")
        .select("*")
        .eq("session_id", session.id)
        .order("order_index"),
      supabase.from("session_sets").select("*").eq("session_id", session.id),
    ]);

    set({
      session,
      participants: (allParticipants ?? []) as SessionParticipant[],
      exercises: (allExercises ?? []) as SessionExercise[],
      allSets: (existingSets ?? []) as SessionSet[],
      currentExerciseIndex: session.current_exercise_index,
      isHost: session.host_id === profile.id,
      isLoading: false,
    });

    get()._subscribe(session.id);

    // Broadcast join event so others update their participant list
    await supabase.channel(`session:${session.id}`).send({
      type: "broadcast",
      event: "participant_joined",
      payload: { participant: participantRow },
    });

    return session;
  },

  // ── leaveSession ──────────────────────────────────────────────────────────
  leaveSession: async () => {
    const { session, _channel } = get();
    const profile = useAuthStore.getState().profile;
    if (!session || !profile) return;

    await supabase
      .from("session_participants")
      .update({ left_at: new Date().toISOString() })
      .eq("session_id", session.id)
      .eq("user_id", profile.id);

    get()._unsubscribe();
    set({
      session: null,
      participants: [],
      exercises: [],
      allSets: [],
      stats: null,
      currentExerciseIndex: 0,
      isHost: false,
    });
  },

  // ── setReady ──────────────────────────────────────────────────────────────
  setReady: async () => {
    const { session } = get();
    const profile = useAuthStore.getState().profile;
    if (!session || !profile) return;

    await supabase
      .from("session_participants")
      .update({ is_ready: true })
      .eq("session_id", session.id)
      .eq("user_id", profile.id);

    // Broadcast so UI updates instantly without DB polling
    await supabase.channel(`session:${session.id}`).send({
      type: "broadcast",
      event: "participant_ready",
      payload: { user_id: profile.id },
    });

    set((s) => ({
      participants: s.participants.map((p) =>
        p.user_id === profile.id ? { ...p, is_ready: true } : p,
      ),
    }));
  },

  // ── startSession ──────────────────────────────────────────────────────────
  startSession: async () => {
    const { session, isHost } = get();
    if (!session || !isHost) return;

    const startedAt = new Date().toISOString();

    await supabase
      .from("sessions")
      .update({ status: "active", started_at: startedAt })
      .eq("id", session.id);

    await supabase.channel(`session:${session.id}`).send({
      type: "broadcast",
      event: "session_started",
      payload: { started_at: startedAt },
    });

    set((s) => ({
      session: s.session
        ? { ...s.session, status: "active", started_at: startedAt }
        : null,
    }));
  },

  // ── logSet ────────────────────────────────────────────────────────────────
  // The most performance-critical path: user logs a set, it broadcasts to ALL
  logSet: async (sessionExerciseId, reps, weightKg) => {
    const { session, allSets } = get();
    const profile = useAuthStore.getState().profile;
    if (!session || !profile) return;

    const logged_at = new Date().toISOString();

    // Determine set index (how many sets this user has already logged for this exercise)
    const existingSets = allSets.filter(
      (s) =>
        s.session_exercise_id === sessionExerciseId && s.user_id === profile.id,
    );
    const setIndex = existingSets.length + 1;

    // Persist to DB
    const { data: setRow, error } = await supabase
      .from("session_sets")
      .insert({
        session_exercise_id: sessionExerciseId,
        session_id: session.id,
        user_id: profile.id,
        set_index: setIndex,
        reps,
        weight_kg: weightKg,
        logged_at,
      })
      .select()
      .single();

    if (error) throw error;

    const newSet = setRow as SessionSet;

    // Optimistic update local state immediately
    set((s) => ({ allSets: [...s.allSets, newSet] }));

    // Broadcast to all other participants
    await supabase.channel(`session:${session.id}`).send({
      type: "broadcast",
      event: "set_logged",
      payload: {
        set: newSet,
        user_id: profile.id,
        username: profile.username,
      },
    });
  },

  // ── advanceExercise ───────────────────────────────────────────────────────
  advanceExercise: async () => {
    const { session, exercises, currentExerciseIndex, isHost } = get();
    if (!session || !isHost) return;

    const nextIndex = currentExerciseIndex + 1;

    // Check if this is the last exercise
    if (nextIndex >= exercises.length) {
      await get().endSession();
      return;
    }

    await supabase
      .from("sessions")
      .update({ current_exercise_index: nextIndex })
      .eq("id", session.id);

    await supabase.channel(`session:${session.id}`).send({
      type: "broadcast",
      event: "exercise_advanced",
      payload: { exercise_index: nextIndex },
    });

    set({ currentExerciseIndex: nextIndex });
  },

  // ── endSession ────────────────────────────────────────────────────────────
  endSession: async () => {
    const { session, isHost } = get();
    if (!session || !isHost) return;

    const endedAt = new Date().toISOString();

    await supabase
      .from("sessions")
      .update({ status: "completed", ended_at: endedAt })
      .eq("id", session.id);

    await supabase.channel(`session:${session.id}`).send({
      type: "broadcast",
      event: "session_ended",
      payload: { ended_at: endedAt },
    });

    set((s) => ({
      session: s.session
        ? { ...s.session, status: "completed", ended_at: endedAt }
        : null,
    }));
  },

  // ── loadStats ─────────────────────────────────────────────────────────────
  loadStats: async (sessionId) => {
    set({ isLoading: true });

    const [
      { data: sessionRow },
      { data: allParticipants },
      { data: allExercises },
      { data: allSets },
    ] = await Promise.all([
      supabase.from("sessions").select("*").eq("id", sessionId).single(),
      supabase
        .from("session_participants")
        .select("*, profile:profiles(*)")
        .eq("session_id", sessionId),
      supabase
        .from("session_exercises")
        .select("*")
        .eq("session_id", sessionId)
        .order("order_index"),
      supabase.from("session_sets").select("*").eq("session_id", sessionId),
    ]);

    const session = sessionRow as Session;
    const participants = (allParticipants ?? []) as SessionParticipant[];
    const exercises = (allExercises ?? []) as SessionExercise[];
    const sets = (allSets ?? []) as SessionSet[];

    const durationSeconds =
      session.started_at && session.ended_at
        ? Math.round(
            (new Date(session.ended_at).getTime() -
              new Date(session.started_at).getTime()) /
              1000,
          )
        : 0;

    const stats = buildStats(participants, exercises, sets, durationSeconds);

    set({
      stats,
      session,
      participants,
      exercises,
      allSets: sets,
      isLoading: false,
    });

    return stats;
  },

  // ── _subscribe ────────────────────────────────────────────────────────────
  // Open a Supabase Realtime channel and wire up broadcast listeners.
  _subscribe: (sessionId) => {
    const channel = supabase
      .channel(`session:${sessionId}`)
      .on("broadcast", { event: "*" }, ({ event, payload }) => {
        get()._applyBroadcast(event, payload);
      })
      .subscribe();

    set({ _channel: channel });
  },

  // ── _unsubscribe ──────────────────────────────────────────────────────────
  _unsubscribe: () => {
    const { _channel } = get();
    if (_channel) {
      supabase.removeChannel(_channel);
      set({ _channel: null });
    }
  },

  // ── _applyBroadcast ───────────────────────────────────────────────────────
  // Immutably patch local state from incoming Realtime events.
  // This is the "receiving" side for all participants (including the sender,
  // who already applies optimistic updates before broadcasting).
  _applyBroadcast: (event, payload: any) => {
    switch (event) {
      case "participant_joined": {
        set((s) => {
          // Avoid duplicates (the joining user already set their own state)
          if (
            s.participants.some(
              (p) => p.user_id === payload.participant?.user_id,
            )
          ) {
            return {};
          }
          return { participants: [...s.participants, payload.participant] };
        });
        break;
      }

      case "participant_ready": {
        set((s) => ({
          participants: s.participants.map((p) =>
            p.user_id === payload.user_id ? { ...p, is_ready: true } : p,
          ),
        }));
        break;
      }

      case "participant_left": {
        set((s) => ({
          participants: s.participants.map((p) =>
            p.user_id === payload.user_id
              ? { ...p, left_at: payload.left_at }
              : p,
          ),
        }));
        break;
      }

      case "set_logged": {
        // Only apply if we don't already have this set (idempotency)
        set((s) => {
          if (s.allSets.some((ss) => ss.id === payload.set?.id)) return {};
          return { allSets: [...s.allSets, payload.set] };
        });
        break;
      }

      case "exercise_advanced": {
        set({ currentExerciseIndex: payload.exercise_index });
        break;
      }

      case "session_started": {
        set((s) => ({
          session: s.session
            ? { ...s.session, status: "active", started_at: payload.started_at }
            : null,
        }));
        break;
      }

      case "session_ended": {
        set((s) => ({
          session: s.session
            ? { ...s.session, status: "completed", ended_at: payload.ended_at }
            : null,
        }));
        break;
      }
    }
  },
}));
