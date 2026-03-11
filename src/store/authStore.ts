// ─────────────────────────────────────────────
//  ezRep — Auth Store (Zustand)
//  Manages the current user session and profile.
//  Auth: Firebase Authentication
//  Data: Firestore /users/{uid}
// ─────────────────────────────────────────────

import { create } from "zustand";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  collection,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { Profile } from "@/types";

interface AuthState {
  // Firebase user (null when signed out)
  session: FirebaseUser | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;

  // Actions
  initialize: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function userDocRef(uid: string) {
  return doc(db, "users", uid);
}

async function fetchProfile(uid: string): Promise<Profile | null> {
  const snap = await getDoc(userDocRef(uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    id: uid,
    username: d.username,
    display_name: d.display_name,
    avatar_url: d.avatar_url ?? null,
    total_volume_kg: d.total_volume_kg ?? 0,
    total_sessions: d.total_sessions ?? 0,
    total_workouts: d.total_workouts ?? 0,
    total_training_seconds: d.total_training_seconds ?? 0,
    created_at:
      d.created_at?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  };
}

// ── Store ──────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  loading: true,
  error: null,

  // ── initialize ──────────────────────────────────────────────────────────
  // Call once on app mount. Sets up the Firebase auth listener which fires
  // immediately with the persisted user (from AsyncStorage) and on every
  // subsequent auth state change.
  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      set({ session: user });
      if (user) {
        try {
          const profile = await fetchProfile(user.uid);
          set({ profile, loading: false });
        } catch {
          set({ profile: null, loading: false });
        }
      } else {
        set({ profile: null, loading: false });
      }
    });
    // Return unsubscribe if needed; for app lifetime we don't bother.
    return unsubscribe;
  },

  // ── signIn ──────────────────────────────────────────────────────────────
  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged handles setting session + profile + loading: false
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },

  // ── signUp ──────────────────────────────────────────────────────────────
  signUp: async (email, password, username) => {
    set({ loading: true, error: null });
    try {
      const cleaned = username.toLowerCase().trim();

      // Check username uniqueness
      const q = query(
        collection(db, "users"),
        where("username", "==", cleaned),
      );
      const existing = await getDocs(q);
      if (!existing.empty) {
        const msg = "Username already taken. Pick another.";
        set({ error: msg, loading: false });
        throw new Error(msg);
      }

      // Create Firebase auth user
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Update Firebase Auth display name
      await firebaseUpdateProfile(user, { displayName: username });

      // Create Firestore profile document at /users/{uid}
      await setDoc(userDocRef(user.uid), {
        username: cleaned,
        display_name: username,
        avatar_url: null,
        email: user.email,
        total_volume_kg: 0,
        total_sessions: 0,
        total_workouts: 0,
        total_training_seconds: 0,
        created_at: serverTimestamp(),
      });
      // Explicitly load profile now that the doc exists.
      // onAuthStateChanged fires when the Auth user is created (before setDoc),
      // so fetchProfile would return null there. We overwrite it here.
      const profile = await fetchProfile(user.uid);
      set({ profile, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },

  // ── signOut ──────────────────────────────────────────────────────────────
  signOut: async () => {
    await firebaseSignOut(auth);
    set({ session: null, profile: null });
  },

  // ── updateProfile ────────────────────────────────────────────────────────
  updateProfile: async (updates) => {
    const user = auth.currentUser;
    const { profile } = get();
    if (!user || !profile) return;

    // Map snake_case Profile fields → Firestore fields
    const firestoreUpdates: Record<string, unknown> = {};
    if (updates.display_name !== undefined)
      firestoreUpdates.display_name = updates.display_name;
    if (updates.avatar_url !== undefined)
      firestoreUpdates.avatar_url = updates.avatar_url;
    if (updates.username !== undefined)
      firestoreUpdates.username = updates.username;

    await updateDoc(userDocRef(user.uid), firestoreUpdates);
    set({ profile: { ...profile, ...updates } });
  },
}));
