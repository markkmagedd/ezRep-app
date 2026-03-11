// ─────────────────────────────────────────────
//  ezRep — Session Hub Screen
//  Entry point: create or join a session
// ─────────────────────────────────────────────

import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  Radius,
} from "@/constants/theme";
import { Card } from "@/components/common/Card";
import { useSessionStore } from "@/store/sessionStore";
import type { SessionStackParamList } from "@/types";

type Props = NativeStackScreenProps<SessionStackParamList, "SessionHub">;

function formatDuration(
  startedAt: string | null,
  endedAt: string | null,
): string {
  if (!startedAt || !endedAt) return "";
  const secs = Math.round(
    (new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000,
  );
  const m = Math.floor(secs / 60);
  const h = Math.floor(m / 60);
  return h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SessionHubScreen({ navigation }: Props) {
  const { history, isLoading, loadHistory } = useSessionStore();
  const recent = history.slice(0, 3);

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ──────────────────────────────────────────── */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Sessions</Text>
        <Text style={styles.heroSub}>
          Train together, compete harder.{"\n"}Real-time shared workouts.
        </Text>
      </View>

      {/* ── Action cards ────────────────────────────────────── */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate("CreateSession")}
      >
        <Card variant="accent" style={styles.bigCard}>
          <View
            style={[
              styles.bigCardIcon,
              { backgroundColor: Colors.accentMuted },
            ]}
          >
            <Ionicons name="add-circle" size={40} color={Colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bigCardTitle}>Create Session</Text>
            <Text style={styles.bigCardSub}>
              Build the workout queue, invite friends, and host the party.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={Colors.accent} />
        </Card>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate("JoinSession", {})}
        style={{ marginTop: Spacing.md }}
      >
        <Card style={styles.bigCard}>
          <View
            style={[styles.bigCardIcon, { backgroundColor: Colors.bgSurface }]}
          >
            <Ionicons name="enter-outline" size={40} color={Colors.cyan} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bigCardTitle}>Join Session</Text>
            <Text style={styles.bigCardSub}>
              Enter a 6-character invite code to join a friend's session.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={Colors.textMuted} />
        </Card>
      </TouchableOpacity>

      {/* ── Past Sessions ────────────────────────────────────── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Past Sessions</Text>
        {history.length > 3 && (
          <TouchableOpacity
            onPress={() => navigation.navigate("SessionHistory")}
          >
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? null : recent.length === 0 ? (
        <Text style={styles.emptyText}>No completed sessions yet.</Text>
      ) : (
        recent.map((s) => (
          <TouchableOpacity
            key={s.id}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate("PostSessionStats", { sessionId: s.id })
            }
            style={{ marginBottom: Spacing.sm }}
          >
            <Card variant="default" padding="md" style={styles.historyRow}>
              <View style={styles.historyIcon}>
                <Ionicons
                  name="trophy-outline"
                  size={20}
                  color={Colors.accent}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyDate}>
                  {formatDate(s.ended_at ?? s.created_at)}
                </Text>
                {s.started_at && s.ended_at && (
                  <Text style={styles.historyMeta}>
                    Duration: {formatDuration(s.started_at, s.ended_at)}
                  </Text>
                )}
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={Colors.textMuted}
              />
            </Card>
          </TouchableOpacity>
        ))
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg, padding: Spacing.md },

  hero: { marginTop: Spacing.sm, marginBottom: Spacing.xl },
  heroTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.hero,
    fontWeight: FontWeight.black,
    letterSpacing: -1,
  },
  heroSub: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    marginTop: Spacing.sm,
    lineHeight: 22,
  },

  bigCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
  },
  bigCardIcon: {
    width: 64,
    height: 64,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  bigCardTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginBottom: 4,
  },
  bigCardSub: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    lineHeight: 18,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  seeAll: {
    color: Colors.accent,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: "center",
    marginTop: Spacing.md,
  },

  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  historyIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: Colors.accentMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  historyDate: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  historyMeta: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
});
