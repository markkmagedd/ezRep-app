// ─────────────────────────────────────────────
//  ezRep — Supabase Client
//  Singleton client shared across the entire app
// ─────────────────────────────────────────────

import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

// ── SecureStore adapter for Supabase session persistence ────────────────────
// Supabase's default localStorage won't work in React Native, so we
// wire it up to Expo SecureStore for encrypted, on-device token storage.
const secureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// Pull credentials from Expo Constants (set via app.json extra or EAS Secrets)
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  (Constants.expoConfig?.extra?.supabaseUrl as string);

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  (Constants.expoConfig?.extra?.supabaseAnonKey as string);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "[ezRep] Missing Supabase credentials.\n" +
      "Copy .env.example → .env and fill in EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.",
  );
}

export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder",
  {
    auth: {
      storage: secureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

// ── Typed helpers ────────────────────────────────────────────────────────────

/** Insert a single row and return it (throws on error). */
export async function dbInsert<T>(table: string, row: Partial<T>): Promise<T> {
  const { data, error } = await supabase
    .from(table)
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return data as T;
}

/** Upsert a single row and return it (throws on error). */
export async function dbUpsert<T>(table: string, row: Partial<T>): Promise<T> {
  const { data, error } = await supabase
    .from(table)
    .upsert(row)
    .select()
    .single();
  if (error) throw error;
  return data as T;
}

/** Select rows with a simple equality filter. */
export async function dbSelect<T>(
  table: string,
  filters: Record<string, unknown> = {},
): Promise<T[]> {
  let query = supabase.from(table).select("*");
  for (const [col, val] of Object.entries(filters)) {
    query = query.eq(col, val);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as T[];
}

/** Update rows matching a filter and return the updated rows. */
export async function dbUpdate<T>(
  table: string,
  filters: Record<string, unknown>,
  updates: Partial<T>,
): Promise<T[]> {
  let query = supabase.from(table).update(updates).select();
  for (const [col, val] of Object.entries(filters)) {
    query = query.eq(col, val);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as T[];
}

// ── Realtime channel helpers ─────────────────────────────────────────────────

/**
 * Subscribe to Supabase Realtime broadcast events on a named channel.
 * Returns an unsubscribe function.
 */
export function subscribeToChannel(
  channelName: string,
  onEvent: (event: string, payload: unknown) => void,
) {
  const channel = supabase
    .channel(channelName)
    .on("broadcast", { event: "*" }, ({ event, payload }) => {
      onEvent(event, payload);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Broadcast an event to a named channel.
 */
export async function broadcastToChannel(
  channelName: string,
  event: string,
  payload: unknown,
) {
  const channel = supabase.channel(channelName);
  await channel.send({
    type: "broadcast",
    event,
    payload,
  });
}
