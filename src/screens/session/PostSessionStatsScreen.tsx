// ─────────────────────────────────────────────
//  ezRep — Post-Session Stats Screen 🏆
//
//  Head-to-head breakdown after the session ends.
//  Shows:
//   • Winner banner (most total volume)
//   • Hardest trainer badge
//   • Per-participant totals (volume, reps, sets)
//   • Per-exercise comparison with coloured bars
//   • Summary duration
// ─────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  Radius,
  Shadow,
} from "@/constants/theme";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { useSessionStore } from "@/store/sessionStore";
import type {
  ParticipantStats,
  ExerciseStats,
  SessionStats,
  SessionStackParamList,
} from "@/types";

type Props = NativeStackScreenProps<SessionStackParamList, "PostSessionStats">;

export default function PostSessionStatsScreen({ navigation, route }: Props) {
  const { sessionId } = route.params;
  const { loadStats, stats, isLoading } = useSessionStore();

  useEffect(() => {
    loadStats(sessionId);
  }, [sessionId]);

  if (isLoading || !stats) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Calculating results…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const winner = stats.participants.find(
    (p) => p.user_id === stats.winner_user_id,
  );
  const hardest = stats.participants.find(
    (p) => p.user_id === stats.hardest_trainer_id,
  );

  const durationMins = Math.floor(stats.duration_seconds / 60);
  const durationSecs = stats.duration_seconds % 60;
  const durationStr = `${durationMins}:${durationSecs.toString().padStart(2, "0")}`;

  // Sort participants by volume descending for the leaderboard
  const ranked = [...stats.participants].sort(
    (a, b) => b.total_volume_kg - a.total_volume_kg,
  );

  // All exercise names (use first participant's list as reference)
  const exerciseNames =
    stats.participants[0]?.exercises.map((e) => e.exercise_name) ?? [];

  async function handleShare() {
    const lines = [
      "🏋️ ezRep Session Results",
      `Duration: ${durationStr}`,
      "",
      ...ranked.map(
        (p, i) =>
          `${i + 1}. ${p.display_name}: ${p.total_volume_kg.toFixed(0)}kg | ${p.total_reps} reps`,
      ),
    ];
    await Share.share({ message: lines.join("\n") });
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.popToTop()}
          style={styles.closeBtn}
        >
          <Ionicons name="close" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Session Results</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Ionicons name="share-outline" size={22} color={Colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* ── Winner banner ─────────────────────── */}
        {winner && (
          <View style={styles.winnerBanner}>
            <Text style={styles.winnerCrown}>🏆</Text>
            <Text style={styles.winnerLabel}>Most Volume</Text>
            <Text style={styles.winnerName}>{winner.display_name}</Text>
            <Text style={styles.winnerVolume}>
              {winner.total_volume_kg.toFixed(0)} kg
            </Text>
          </View>
        )}

        {/* Duration strip */}
        <View style={styles.durationRow}>
          <Ionicons name="time-outline" size={16} color={Colors.textMuted} />
          <Text style={styles.durationText}>
            Session duration: {durationStr}
          </Text>
        </View>

        {/* ── Rank Cards ────────────────────────── */}
        <Text style={styles.sectionTitle}>Leaderboard</Text>
        {ranked.map((p, i) => {
          const color = Colors.participants[p.color_index] ?? Colors.accent;
          const isWinner = p.user_id === stats.winner_user_id;
          const isHardest = p.user_id === stats.hardest_trainer_id;

          return (
            <Card
              key={p.user_id}
              variant={isWinner ? "accent" : "default"}
              style={styles.rankCard}
              padding="md"
            >
              {/* Rank number */}
              <View
                style={[styles.rankBadge, { backgroundColor: color + "22" }]}
              >
                <Text style={[styles.rankNumber, { color }]}>#{i + 1}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.rankNameRow}>
                  <Text style={[styles.rankName, { color }]}>
                    {p.display_name}
                  </Text>
                  {isWinner && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>🏆 Winner</Text>
                    </View>
                  )}
                  {isHardest && p.user_id !== stats.winner_user_id && (
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: Colors.warning + "22" },
                      ]}
                    >
                      <Text
                        style={[styles.badgeText, { color: Colors.warning }]}
                      >
                        🔥 Hardest
                      </Text>
                    </View>
                  )}
                </View>

                {/* Three stat pillars */}
                <View style={styles.statPillars}>
                  <StatPillar
                    label="Volume"
                    value={`${p.total_volume_kg.toFixed(0)}kg`}
                    color={color}
                  />
                  <StatPillar
                    label="Reps"
                    value={String(p.total_reps)}
                    color={color}
                  />
                  <StatPillar
                    label="Sets"
                    value={String(p.total_sets)}
                    color={color}
                  />
                </View>
              </View>
            </Card>
          );
        })}

        {/* ── Per-Exercise Breakdown ────────────── */}
        <Text style={styles.sectionTitle}>Exercise Breakdown</Text>
        {exerciseNames.map((exName) => (
          <ExerciseCompareCard
            key={exName}
            exerciseName={exName}
            participants={ranked}
          />
        ))}

        {/* ── Hardest Trainer ──────────────────── */}
        {hardest && (
          <Card variant="flat" style={styles.hardestCard} padding="lg">
            <Text style={styles.hardestEmoji}>🔥</Text>
            <View>
              <Text style={styles.hardestLabel}>Hardest Trainer</Text>
              <Text style={styles.hardestName}>{hardest.display_name}</Text>
              <Text style={styles.hardestDesc}>
                Best average weight per set.{" "}
                {hardest.total_sets > 0
                  ? `${(hardest.total_volume_kg / hardest.total_sets).toFixed(1)}kg avg/set`
                  : ""}
              </Text>
            </View>
          </Card>
        )}

        <Button
          label="Back to Home"
          onPress={() => navigation.popToTop()}
          variant="secondary"
          size="lg"
          style={{ marginTop: Spacing.xl }}
        />

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── ExerciseCompareCard ────────────────────────────────────────────────────────
// Per-exercise comparison: horizontal bar chart showing each participant's volume

function ExerciseCompareCard({
  exerciseName,
  participants,
}: {
  exerciseName: string;
  participants: ParticipantStats[];
}) {
  // Find this exercise's stats for each participant
  const rows = participants.map((p) => {
    const ex =
      p.exercises.find((e) => e.exercise_name === exerciseName) ?? null;
    return { p, ex };
  });

  const maxVolume = Math.max(...rows.map((r) => r.ex?.volume_kg ?? 0), 1);
  const winner = rows.reduce((best, r) =>
    (r.ex?.volume_kg ?? 0) > (best.ex?.volume_kg ?? 0) ? r : best,
  );

  return (
    <Card style={styles.exCompareCard} padding="md">
      <Text style={styles.exCompareName}>{exerciseName}</Text>

      {rows.map(({ p, ex }) => {
        const color = Colors.participants[p.color_index] ?? Colors.accent;
        const volume = ex?.volume_kg ?? 0;
        const barWidth = maxVolume > 0 ? (volume / maxVolume) * 100 : 0;
        const isWinner = p.user_id === winner.p.user_id && volume > 0;

        return (
          <View key={p.user_id} style={styles.exCompareRow}>
            <Text style={[styles.exCompareLabel, { color }]}>
              {p.display_name.length > 10
                ? p.display_name.slice(0, 10) + "…"
                : p.display_name}
            </Text>

            {/* Bar */}
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${barWidth}%` as any, backgroundColor: color },
                  isWinner && styles.barFillWinner,
                ]}
              />
            </View>

            <Text style={[styles.exCompareValue, isWinner && { color }]}>
              {volume.toFixed(0)}kg
            </Text>

            {/* Per-exercise detail */}
            {ex && (
              <Text style={styles.exCompareDetail}>
                {ex.sets_logged}s × {ex.total_reps}r
              </Text>
            )}
          </View>
        );
      })}
    </Card>
  );
}

// ── StatPillar ────────────────────────────────────────────────────────────────
function StatPillar({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.statPillarWrap}>
      <Text style={[styles.statPillarValue, { color }]}>{value}</Text>
      <Text style={styles.statPillarLabel}>{label}</Text>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  closeBtn: { padding: 4 },
  shareBtn: { padding: 4 },

  scroll: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  winnerBanner: {
    backgroundColor: Colors.accentMuted,
    borderRadius: Radius.xl,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: "center",
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.md,
    ...Shadow.accent,
  },
  winnerCrown: { fontSize: 48 },
  winnerLabel: {
    color: Colors.accentDim,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginTop: Spacing.sm,
  },
  winnerName: {
    color: Colors.accent,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
    marginTop: 4,
    letterSpacing: -0.5,
  },
  winnerVolume: {
    color: Colors.accentDim,
    fontSize: FontSize.lg,
    marginTop: 4,
  },

  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  durationText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
  },

  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },

  rankCard: {
    marginBottom: Spacing.sm,
    flexDirection: "row",
    gap: Spacing.md,
    alignItems: "center",
  },
  rankBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  rankNumber: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.black,
  },
  rankNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flexWrap: "wrap",
    marginBottom: Spacing.xs,
  },
  rankName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  badge: {
    backgroundColor: Colors.accentMuted,
    borderRadius: Radius.pill,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  badgeText: {
    color: Colors.accent,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  statPillars: {
    flexDirection: "row",
    gap: Spacing.xl,
  },
  statPillarWrap: { alignItems: "center" },
  statPillarValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
  },
  statPillarLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  exCompareCard: { marginBottom: Spacing.sm },
  exCompareName: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.sm,
  },
  exCompareRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: 6,
  },
  exCompareLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    width: 80,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.pill,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: Radius.pill,
    minWidth: 4,
  },
  barFillWinner: {
    opacity: 1,
  },
  exCompareValue: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    width: 50,
    textAlign: "right",
  },
  exCompareDetail: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    width: 50,
  },

  hardestCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.warning + "44",
  },
  hardestEmoji: { fontSize: 36 },
  hardestLabel: {
    color: Colors.warning,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  hardestName: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  hardestDesc: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
});
