// ─────────────────────────────────────────────
//  ezRep — Session Store (Zustand)
//  Core state machine for the real-time shared workout Session.
//
//  Architecture:
//  ─────────────
//  Each session is a Firestore document at /sessions/{sessionId}.
//  Sub-collections hold participants, exercises, and sets.
//  Real-time sync uses Firestore onSnapshot.
//
//  State machine: lobby → active → completed
// ─────────────────────────────────────────────

import { create } from "zustand";
import {
  doc,
  collection,
  collectionGroup,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  increment,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type {
  Session,
  SessionParticipant,
  SessionExercise,
  SessionSet,
  SessionStats,
  ParticipantStats,
  ExerciseStats,
  Profile,
} from "@/types";
import { useAuthStore } from "./authStore";

/** Get the current user's profile — use store cache or fetch from Firestore. */
async function requireProfile(user: { uid: string }): Promise<Profile> {
  const cached = useAuthStore.getState().profile;
  if (cached) return cached;
  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists())
    throw new Error("Profile not found. Please complete registration.");
  const d = snap.data();
  const profile: Profile = {
    id: user.uid,
    username: d.username ?? "",
    display_name: d.display_name ?? "",
    avatar_url: d.avatar_url ?? null,
    total_volume_kg: d.total_volume_kg ?? 0,
    total_sessions: d.total_sessions ?? 0,
    total_workouts: d.total_workouts ?? 0,
    total_training_seconds: d.total_training_seconds ?? 0,
    created_at:
      d.created_at?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  };
  // Populate the auth store so subsequent calls are instant
  useAuthStore.setState({ profile });
  return profile;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Generate a random 6-char invite code (digits + uppercase letters). */
function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

/** Convert a Firestore Timestamp / date value to an ISO string. */
function tsToIso(ts: any): string {
  if (!ts) return new Date().toISOString();
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  if (typeof ts === "string") return ts;
  return new Date().toISOString();
}

function docToSession(id: string, data: Record<string, any>): Session {
  return {
    id,
    code: data.code,
    host_id: data.host_id,
    status: data.status,
    workout_template_id: data.workout_template_id ?? null,
    current_exercise_index: data.current_exercise_index ?? 0,
    created_at: tsToIso(data.created_at),
    started_at: data.started_at ? tsToIso(data.started_at) : null,
    ended_at: data.ended_at ? tsToIso(data.ended_at) : null,
  };
}

/** Map a Firestore participant doc to the SessionParticipant type.
 *  Username + displayName are denormalized into the participant doc so
 *  we never need a JOIN to the user profile. */
function docToParticipant(
  sessionId: string,
  docId: string,
  data: Record<string, any>,
): SessionParticipant {
  return {
    id: docId,
    session_id: sessionId,
    user_id: data.user_id,
    // Reconstruct a Profile-shaped object from denormalized fields
    profile: {
      id: data.user_id,
      username: data.username ?? "",
      display_name: data.display_name ?? "",
      avatar_url: data.avatar_url ?? null,
      total_volume_kg: 0,
      total_sessions: 0,
      total_workouts: 0,
      total_training_seconds: 0,
      created_at: "",
    },
    joined_at: tsToIso(data.joined_at),
    is_ready: data.is_ready ?? false,
    left_at: data.left_at ? tsToIso(data.left_at) : null,
    color_index: data.color_index ?? 0,
  };
}

function docToExercise(
  sessionId: string,
  docId: string,
  data: Record<string, any>,
): SessionExercise {
  return {
    id: docId,
    session_id: sessionId,
    exercise_id: data.exercise_id,
    exercise_name: data.exercise_name,
    order_index: data.order_index,
    target_sets: data.target_sets,
    target_reps: data.target_reps,
  };
}

function docToSet(docId: string, data: Record<string, any>): SessionSet {
  return {
    id: docId,
    session_exercise_id: data.session_exercise_id,
    session_id: data.session_id,
    user_id: data.user_id,
    set_index: data.set_index,
    reps: data.reps,
    weight_kg: data.weight_kg,
    logged_at: tsToIso(data.logged_at),
  };
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
  session: Session | null;
  participants: SessionParticipant[];
  exercises: SessionExercise[];
  allSets: SessionSet[];
  stats: SessionStats | null;
  history: Session[];

  currentExerciseIndex: number;
  isHost: boolean;
  isLoading: boolean;
  error: string | null;

  // Firestore onSnapshot unsubscribers
  _unsubListeners: (() => void)[];

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
  startSession: () => Promise<void>;

  logSet: (
    sessionExerciseId: string,
    reps: number,
    weightKg: number,
  ) => Promise<void>;
  advanceExercise: () => Promise<void>;

  endSession: () => Promise<void>;
  loadStats: (sessionId: string) => Promise<SessionStats>;
  loadHistory: () => Promise<void>;

  _subscribe: (sessionId: string) => void;
  _unsubscribe: () => void;
}

// ── Store implementation ──────────────────────────────────────────────────────

export const useSessionStore = create<SessionState>((set, get) => ({
  session: null,
  participants: [],
  exercises: [],
  allSets: [],
  stats: null,
  history: [],
  currentExerciseIndex: 0,
  isHost: false,
  isLoading: false,
  error: null,
  _unsubListeners: [],

  // ── createSession ─────────────────────────────────────────────────────────
  createSession: async (exerciseDefs) => {
    const user = auth.currentUser;
    if (!user) throw new Error("You must be signed in to create a session.");
    const profile = await requireProfile(user);

    set({ isLoading: true, error: null });

    // Generate a unique invite code
    let code = generateCode();
    const codeCheck = await getDocs(
      query(collection(db, "sessions"), where("code", "==", code)),
    );
    if (!codeCheck.empty) code = generateCode();

    // Create session document
    const sessionRef = await addDoc(collection(db, "sessions"), {
      code,
      host_id: user.uid,
      status: "lobby",
      current_exercise_index: 0,
      workout_template_id: null,
      created_at: serverTimestamp(),
      started_at: null,
      ended_at: null,
    });
    const sessionId = sessionRef.id;

    // Add exercises as sub-collection docs
    const exerciseRefs: SessionExercise[] = [];
    for (let i = 0; i < exerciseDefs.length; i++) {
      const e = exerciseDefs[i];
      const exRef = await addDoc(
        collection(db, "sessions", sessionId, "exercises"),
        {
          exercise_id: e.id,
          exercise_name: e.name,
          order_index: i,
          target_sets: e.targetSets,
          target_reps: e.targetReps,
        },
      );
      exerciseRefs.push({
        id: exRef.id,
        session_id: sessionId,
        exercise_id: e.id,
        exercise_name: e.name,
        order_index: i,
        target_sets: e.targetSets,
        target_reps: e.targetReps,
      });
    }

    // Add self as host participant (denormalize username + display_name)
    await setDoc(doc(db, "sessions", sessionId, "participants", user.uid), {
      user_id: user.uid,
      username: profile.username,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url ?? null,
      color_index: 0,
      is_ready: false,
      joined_at: serverTimestamp(),
      left_at: null,
    });

    const now = new Date().toISOString();
    const session: Session = {
      id: sessionId,
      code,
      host_id: user.uid,
      status: "lobby",
      workout_template_id: null,
      current_exercise_index: 0,
      created_at: now,
      started_at: null,
      ended_at: null,
    };

    const selfParticipant: SessionParticipant = {
      id: user.uid,
      session_id: sessionId,
      user_id: user.uid,
      profile: {
        id: user.uid,
        username: profile.username,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        total_volume_kg: profile.total_volume_kg,
        total_sessions: profile.total_sessions,
        total_workouts: profile.total_workouts,
        total_training_seconds: profile.total_training_seconds,
        created_at: profile.created_at,
      },
      joined_at: now,
      is_ready: false,
      left_at: null,
      color_index: 0,
    };

    set({
      session,
      exercises: exerciseRefs,
      participants: [selfParticipant],
      allSets: [],
      currentExerciseIndex: 0,
      isHost: true,
      isLoading: false,
    });

    get()._subscribe(sessionId);
    return session;
  },

  // ── joinSession ───────────────────────────────────────────────────────────
  joinSession: async (code) => {
    const user = auth.currentUser;
    if (!user) throw new Error("You must be signed in to join a session.");
    const profile = await requireProfile(user);

    set({ isLoading: true, error: null });

    const snap = await getDocs(
      query(
        collection(db, "sessions"),
        where("code", "==", code.toUpperCase()),
      ),
    );
    const activeDoc = snap.docs.find((d) => {
      const s = d.data().status;
      return s === "lobby" || s === "active";
    });

    if (!activeDoc) {
      const msg = "Session not found or already finished.";
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }

    const sessionId = activeDoc.id;
    const session = docToSession(sessionId, activeDoc.data());

    // Determine next available color_index
    const participantsSnap = await getDocs(
      collection(db, "sessions", sessionId, "participants"),
    );
    const usedColors = new Set(
      participantsSnap.docs
        .filter((d) => !d.data().left_at)
        .map((d) => d.data().color_index as number),
    );
    let colorIndex = 0;
    while (usedColors.has(colorIndex)) colorIndex++;

    // Add self as participant
    await setDoc(doc(db, "sessions", sessionId, "participants", user.uid), {
      user_id: user.uid,
      username: profile.username,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url ?? null,
      color_index: colorIndex,
      is_ready: false,
      joined_at: serverTimestamp(),
      left_at: null,
    });

    // Fetch exercises and existing sets in parallel
    const [exercisesSnap, setsSnap] = await Promise.all([
      getDocs(
        query(
          collection(db, "sessions", sessionId, "exercises"),
          orderBy("order_index"),
        ),
      ),
      getDocs(collection(db, "sessions", sessionId, "sets")),
    ]);

    const participants = participantsSnap.docs.map((d) =>
      docToParticipant(sessionId, d.id, d.data()),
    );
    // Ensure self appears in participants (setDoc fires asynchronously)
    if (!participants.some((p) => p.user_id === user.uid)) {
      participants.push({
        id: user.uid,
        session_id: sessionId,
        user_id: user.uid,
        profile: {
          id: user.uid,
          username: profile.username,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          total_volume_kg: profile.total_volume_kg,
          total_sessions: profile.total_sessions,
          total_workouts: profile.total_workouts,
          total_training_seconds: profile.total_training_seconds,
          created_at: profile.created_at,
        },
        joined_at: new Date().toISOString(),
        is_ready: false,
        left_at: null,
        color_index: colorIndex,
      });
    }

    set({
      session,
      participants,
      exercises: exercisesSnap.docs.map((d) =>
        docToExercise(sessionId, d.id, d.data()),
      ),
      allSets: setsSnap.docs.map((d) => docToSet(d.id, d.data())),
      currentExerciseIndex: session.current_exercise_index,
      isHost: session.host_id === user.uid,
      isLoading: false,
    });

    get()._subscribe(sessionId);
    return session;
  },

  // ── leaveSession ──────────────────────────────────────────────────────────
  leaveSession: async () => {
    const { session } = get();
    const user = auth.currentUser;
    if (!session || !user) return;

    await updateDoc(doc(db, "sessions", session.id, "participants", user.uid), {
      left_at: serverTimestamp(),
    });

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
  // Writes to Firestore; onSnapshot propagates the change to all clients.
  setReady: async () => {
    const { session } = get();
    const user = auth.currentUser;
    if (!session || !user) return;

    await updateDoc(doc(db, "sessions", session.id, "participants", user.uid), {
      is_ready: true,
    });
  },

  // ── startSession ──────────────────────────────────────────────────────────
  startSession: async () => {
    const { session, isHost } = get();
    if (!session || !isHost) return;

    await updateDoc(doc(db, "sessions", session.id), {
      status: "active",
      started_at: serverTimestamp(),
    });
    // onSnapshot updates all participants
  },

  // ── logSet ────────────────────────────────────────────────────────────────
  // Write to Firestore; onSnapshot on /sets delivers it to everyone in real time.
  logSet: async (sessionExerciseId, reps, weightKg) => {
    const { session, allSets } = get();
    const user = auth.currentUser;
    if (!session || !user) return;

    const existingForExercise = allSets.filter(
      (s) =>
        s.session_exercise_id === sessionExerciseId && s.user_id === user.uid,
    );
    const setIndex = existingForExercise.length + 1;

    const setRef = await addDoc(
      collection(db, "sessions", session.id, "sets"),
      {
        session_exercise_id: sessionExerciseId,
        session_id: session.id,
        user_id: user.uid,
        set_index: setIndex,
        reps,
        weight_kg: weightKg,
        logged_at: serverTimestamp(),
      },
    );

    // Optimistic update so the logger sees instant feedback
    const optimistic: SessionSet = {
      id: setRef.id,
      session_exercise_id: sessionExerciseId,
      session_id: session.id,
      user_id: user.uid,
      set_index: setIndex,
      reps,
      weight_kg: weightKg,
      logged_at: new Date().toISOString(),
    };
    set((s) => ({
      allSets: s.allSets.some((x) => x.id === setRef.id)
        ? s.allSets
        : [...s.allSets, optimistic],
    }));
  },

  // ── advanceExercise ───────────────────────────────────────────────────────
  advanceExercise: async () => {
    const { session, exercises, currentExerciseIndex, isHost } = get();
    if (!session || !isHost) return;

    const nextIndex = currentExerciseIndex + 1;
    if (nextIndex >= exercises.length) {
      await get().endSession();
      return;
    }

    await updateDoc(doc(db, "sessions", session.id), {
      current_exercise_index: nextIndex,
    });
    // onSnapshot propagates to all participants
  },

  // ── endSession ────────────────────────────────────────────────────────────
  endSession: async () => {
    const { session, isHost } = get();
    if (!session || !isHost) return;

    await updateDoc(doc(db, "sessions", session.id), {
      status: "completed",
      ended_at: serverTimestamp(),
    });
  },

  // ── loadStats ─────────────────────────────────────────────────────────────
  loadStats: async (sessionId) => {
    set({ isLoading: true });

    const [sessionSnap, participantsSnap, exercisesSnap, setsSnap] =
      await Promise.all([
        getDoc(doc(db, "sessions", sessionId)),
        getDocs(collection(db, "sessions", sessionId, "participants")),
        getDocs(
          query(
            collection(db, "sessions", sessionId, "exercises"),
            orderBy("order_index"),
          ),
        ),
        getDocs(collection(db, "sessions", sessionId, "sets")),
      ]);

    const session = docToSession(sessionId, sessionSnap.data()!);
    const participants = participantsSnap.docs.map((d) =>
      docToParticipant(sessionId, d.id, d.data()),
    );
    const exercises = exercisesSnap.docs.map((d) =>
      docToExercise(sessionId, d.id, d.data()),
    );
    const sets = setsSnap.docs.map((d) => docToSet(d.id, d.data()));

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

    // Tally stats into the user's profile — once per session per user
    const user = auth.currentUser;
    if (user && session.status === "completed") {
      const participantRef = doc(
        db,
        "sessions",
        sessionId,
        "participants",
        user.uid,
      );
      const participantSnap2 = await getDoc(participantRef);
      if (participantSnap2.exists() && !participantSnap2.data().stats_tallied) {
        const myStats = stats.participants.find((p) => p.user_id === user.uid);
        const myVolume = myStats?.total_volume_kg ?? 0;
        await Promise.all([
          updateDoc(doc(db, "users", user.uid), {
            total_sessions: increment(1),
            total_volume_kg: increment(myVolume),
            total_training_seconds: increment(durationSeconds),
          }),
          updateDoc(participantRef, { stats_tallied: true }),
        ]);
        // Refresh in-memory profile
        const { profile } = useAuthStore.getState();
        if (profile) {
          useAuthStore.setState({
            profile: {
              ...profile,
              total_sessions: profile.total_sessions + 1,
              total_volume_kg: profile.total_volume_kg + myVolume,
              total_training_seconds:
                profile.total_training_seconds + durationSeconds,
            },
          });
        }
      }
    }

    return stats;
  },

  // ── loadHistory ───────────────────────────────────────────────────────────
  // Finds all completed sessions the current user participated in by querying
  // the participants collectionGroup, then fetches each session doc.
  loadHistory: async () => {
    const user = auth.currentUser;
    if (!user) return;

    set({ isLoading: true });
    try {
      const sessionIds = new Set<string>();

      // 1. Sessions the user hosted — simple single-field query, no index needed
      const hostedSnap = await getDocs(
        query(collection(db, "sessions"), where("host_id", "==", user.uid)),
      );
      hostedSnap.docs.forEach((d) => sessionIds.add(d.id));

      // 2. Sessions the user joined as a participant — collectionGroup requires
      //    a Firestore index. If the index doesn't exist yet this throws, and we
      //    fall back gracefully (hosted sessions are still shown above).
      try {
        const participantSnap = await getDocs(
          query(
            collectionGroup(db, "participants"),
            where("user_id", "==", user.uid),
          ),
        );
        participantSnap.docs.forEach((d) => {
          const sid = d.ref.parent.parent?.id;
          if (sid) sessionIds.add(sid);
        });
      } catch (indexErr: any) {
        console.warn(
          "[loadHistory] collectionGroup participants query failed — " +
            "create a Firestore collection-group index on field 'user_id' " +
            "for the 'participants' collection group.\n" +
            indexErr.message,
        );
      }

      if (sessionIds.size === 0) {
        set({ history: [], isLoading: false });
        return;
      }

      // Fetch all session docs in parallel
      const sessionSnaps = await Promise.all(
        [...sessionIds].map((id) => getDoc(doc(db, "sessions", id))),
      );

      const history = sessionSnaps
        .filter((s) => s.exists())
        .map((s) => docToSession(s.id, s.data()!))
        .sort(
          (a, b) =>
            new Date(b.ended_at ?? b.created_at).getTime() -
            new Date(a.ended_at ?? a.created_at).getTime(),
        );

      set({ history, isLoading: false });
    } catch (e: any) {
      console.error("[loadHistory] error:", e);
      set({ error: e.message, isLoading: false });
    }
  },

  // ── _subscribe ────────────────────────────────────────────────────────────
  // Set up three Firestore onSnapshot listeners:
  //  1. Session doc       → status, current_exercise_index
  //  2. Participants sub  → ready states, new joiners
  //  3. Sets sub          → live set feed (ordered by logged_at asc)
  _subscribe: (sessionId) => {
    const unsubs: (() => void)[] = [];

    // 1. Session document
    unsubs.push(
      onSnapshot(doc(db, "sessions", sessionId), (snap) => {
        if (!snap.exists()) return;
        const session = docToSession(sessionId, snap.data());
        set({ session, currentExerciseIndex: session.current_exercise_index });
      }),
    );

    // 2. Participants sub-collection
    unsubs.push(
      onSnapshot(
        collection(db, "sessions", sessionId, "participants"),
        (snap) => {
          set({
            participants: snap.docs.map((d) =>
              docToParticipant(sessionId, d.id, d.data()),
            ),
          });
        },
      ),
    );

    // 3. Sets sub-collection — the live workout feed
    unsubs.push(
      onSnapshot(
        query(
          collection(db, "sessions", sessionId, "sets"),
          orderBy("logged_at", "asc"),
        ),
        (snap) => {
          set({ allSets: snap.docs.map((d) => docToSet(d.id, d.data())) });
        },
      ),
    );

    set({ _unsubListeners: unsubs });
  },

  // ── _unsubscribe ──────────────────────────────────────────────────────────
  _unsubscribe: () => {
    get()._unsubListeners.forEach((fn) => fn());
    set({ _unsubListeners: [] });
  },
}));
