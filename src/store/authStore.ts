// ─────────────────────────────────────────────
//  ezRep — Auth Store (Zustand)
//  Manages the current user session and profile.
// ─────────────────────────────────────────────

import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";

interface AuthState {
  // State
  session:
    | Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]
    | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>(
  (set, get) =>
    ({
      session: null,
      profile: null,
      loading: true,
      error: null,

      // ── initialize ───────────────────────────────────────────────────────────
      // Called once on app mount. Restores any persisted session and subscribes
      // to future auth state changes (token refresh, sign-out from another tab, etc.)
      initialize: async () => {
        // Restore session from SecureStore
        const {
          data: { session },
        } = await supabase.auth.getSession();
        set({ session });

        if (session?.user) {
          await get()._fetchProfile(session.user.id);
        }

        // Listen for future auth changes
        supabase.auth.onAuthStateChange(async (event, session) => {
          set({ session });
          if (session?.user) {
            await get()._fetchProfile(session.user.id);
          } else {
            set({ profile: null });
          }
        });

        set({ loading: false });
      },

      // ── signIn ───────────────────────────────────────────────────────────────
      signIn: async (email, password) => {
        set({ loading: true, error: null });
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
        set({ loading: false });
      },

      // ── signUp ───────────────────────────────────────────────────────────────
      signUp: async (email, password, username) => {
        set({ loading: true, error: null });

        // Check username uniqueness
        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", username.toLowerCase())
          .maybeSingle();

        if (existing) {
          const msg = "Username already taken. Pick another.";
          set({ error: msg, loading: false });
          throw new Error(msg);
        }

        // Create auth user
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          set({ error: error.message, loading: false });
          throw error;
        }

        if (data.user) {
          // Insert public profile row (handled by DB trigger too, but we set username here)
          await supabase.from("profiles").upsert({
            id: data.user.id,
            username: username.toLowerCase(),
            display_name: username,
            total_volume_kg: 0,
            total_sessions: 0,
          });
        }

        set({ loading: false });
      },

      // ── signOut ──────────────────────────────────────────────────────────────
      signOut: async () => {
        await supabase.auth.signOut();
        set({ session: null, profile: null });
      },

      // ── updateProfile ────────────────────────────────────────────────────────
      updateProfile: async (updates) => {
        const { profile } = get();
        if (!profile) return;

        const { data, error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", profile.id)
          .select()
          .single();

        if (error) throw error;
        set({ profile: data as Profile });
      },

      // ── private helpers ──────────────────────────────────────────────────────
      _fetchProfile: async (userId: string) => {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        if (data) set({ profile: data as Profile });
      },
    }) as AuthState & { _fetchProfile: (id: string) => Promise<void> },
);
