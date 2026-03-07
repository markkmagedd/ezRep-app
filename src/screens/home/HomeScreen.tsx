// ─────────────────────────────────────────────
//  ezRep — Home Screen
//  Dashboard: quick actions + recent workout history
// ─────────────────────────────────────────────

import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
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
} from "@/constants/theme";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { useAuthStore } from "@/store/authStore";
import { useWorkoutStore } from "@/store/workoutStore";
import type { HomeStackParamList, Workout } from "@/types";

type Props = NativeStackScreenProps<HomeStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const { profile } = useAuthStore();
  const { recentWorkouts, loadRecentWorkouts, startWorkout } =
    useWorkoutStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadRecentWorkouts();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await loadRecentWorkouts();
    setRefreshing(false);
  }

  async function handleStartWorkout() {
    const workoutId = await startWorkout();
    navigation.navigate("WorkoutLogger", { workoutId });
  }

  const totalVolume = profile?.total_volume_kg ?? 0;
  const totalSessions = profile?.total_sessions ?? 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.accent}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hey, {profile?.display_name ?? "Lifter"} 👋
            </Text>
            <Text style={styles.subGreeting}>Ready to lift?</Text>
          </View>
          <TouchableOpacity style={styles.avatarBtn} onPress={() => {}}>
            <Ionicons name="person-circle" size={40} color={Colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Stats strip */}
        <View style={styles.statsRow}>
          <StatPill
            label="Total Volume"
            value={`${(totalVolume / 1000).toFixed(1)}t`}
            icon="barbell"
          />
          <View style={styles.statsDivider} />
          <StatPill
            label="Sessions"
            value={String(totalSessions)}
            icon="people"
          />
          <View style={styles.statsDivider} />
          <StatPill
            label="Workouts"
            value={String(recentWorkouts.length)}
            icon="fitness"
          />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Start</Text>
        <View style={styles.quickRow}>
          <QuickCard
            icon="barbell-outline"
            label="Solo Workout"
            sub="Log your own session"
            accent={Colors.accent}
            onPress={handleStartWorkout}
          />
          <QuickCard
            icon="people-outline"
            label="Start Session"
            sub="Train with friends"
            accent={Colors.cyan}
            onPress={() =>
              (navigation as any).navigate("SessionTab", {
                screen: "CreateSession",
              })
            }
          />
        </View>

        {/* Recent Workouts */}
        <Text style={styles.sectionTitle}>Recent Workouts</Text>
        {recentWorkouts.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons
              name="barbell-outline"
              size={36}
              color={Colors.textMuted}
            />
            <Text style={styles.emptyText}>No workouts yet.</Text>
            <Text style={styles.emptySubText}>
              Start your first session above!
            </Text>
          </Card>
        ) : (
          recentWorkouts.map((w) => (
            <WorkoutHistoryRow key={w.id} workout={w} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatPill({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.statPill}>
      <Ionicons name={icon} size={16} color={Colors.accent} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QuickCard({
  icon,
  label,
  sub,
  accent,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sub: string;
  accent: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.quickCard, { borderColor: accent }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View
        style={[styles.quickIconCircle, { backgroundColor: accent + "22" }]}
      >
        <Ionicons name={icon} size={26} color={accent} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
      <Text style={styles.quickSub}>{sub}</Text>
    </TouchableOpacity>
  );
}

function WorkoutHistoryRow({ workout }: { workout: Workout }) {
  const date = new Date(workout.started_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const duration = workout.ended_at
    ? Math.round(
        (new Date(workout.ended_at).getTime() -
          new Date(workout.started_at).getTime()) /
          60000,
      )
    : null;

  return (
    <Card style={styles.historyRow} padding="md">
      <View style={styles.historyLeft}>
        <View style={styles.historyDateBadge}>
          <Text style={styles.historyDateText}>{date}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.historyName}>{workout.name}</Text>
          {duration !== null && (
            <Text style={styles.historyMeta}>{duration} min</Text>
          )}
        </View>
      </View>
      <Text style={styles.historyVolume}>
        {workout.total_volume_kg.toFixed(0)}{" "}
        <Text style={styles.historyUnit}>kg</Text>
      </Text>
    </Card>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  greeting: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  subGreeting: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    marginTop: 2,
  },
  avatarBtn: { padding: 4 },

  statsRow: {
    flexDirection: "row",
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  statPill: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statsDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  statValue: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginTop: 4,
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    textAlign: "center",
  },

  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.sm,
  },

  quickRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  quickCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    padding: Spacing.md,
    alignItems: "flex-start",
  },
  quickIconCircle: {
    width: 48,
    height: 48,
    borderRadius: Radius.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  quickLabel: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    marginBottom: 2,
  },
  quickSub: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
  },

  emptyCard: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  emptySubText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
  },

  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  historyLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
  },
  historyDateBadge: {
    backgroundColor: Colors.accentMuted,
    borderRadius: Radius.sm,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  historyDateText: {
    color: Colors.accent,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  historyName: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  historyMeta: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  historyVolume: {
    color: Colors.accent,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  historyUnit: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
  },
});
