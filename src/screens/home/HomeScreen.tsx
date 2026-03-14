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
import { useRoutineStore } from "@/store/routineStore";
import type { HomeStackParamList, Workout } from "@/types";

type Props = NativeStackScreenProps<HomeStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const { profile } = useAuthStore();
  const { recentWorkouts, loadRecentWorkouts, startWorkout } =
    useWorkoutStore();
  const { activeRoutine, routineDetails, loadRoutines, loadRoutineDetail } =
    useRoutineStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadRecentWorkouts();
    loadRoutines();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await Promise.all([loadRecentWorkouts(), loadRoutines()]);
    setRefreshing(false);
  }

  async function handleStartWorkout() {
    const workoutId = await startWorkout({});
    navigation.navigate("WorkoutLogger", { workoutId });
  }

  // ── Active routine helpers ──────────────────────────────────────────────
  const activeDays = activeRoutine
    ? (routineDetails[activeRoutine.id] ?? [])
    : [];
  const todayIdx = activeRoutine
    ? activeRoutine.current_day_index % Math.max(activeDays.length, 1)
    : 0;
  const todayDay = activeDays[todayIdx];

  async function handleStartRoutineDay() {
    if (!activeRoutine || !todayDay) return;
    await startWorkout({
      name: todayDay.name,
      routineDayId: todayDay.id,
      routineId: activeRoutine.id,
    });
    navigation.navigate("WorkoutLogger", {});
  }

  const totalSessions = profile?.total_sessions ?? 0;
  const totalWorkouts = profile?.total_workouts ?? 0;
  const totalTrainingSecs = profile?.total_training_seconds ?? 0;
  const trainingHours = Math.floor(totalTrainingSecs / 3600);
  const trainingMins = Math.floor((totalTrainingSecs % 3600) / 60);
  const trainingLabel = trainingHours > 0 ? `${trainingHours}h ${trainingMins}m` : `${trainingMins}m`;

  // ── Dashboard Helpers ───────────────────────────────────────────────────
  
  // 1. Weekly Consistency (Last 7 Days)
  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    return d;
  });
  const workoutDayStrings = recentWorkouts.map(w => new Date(w.started_at).toDateString());
  const weeklyConsistency = weekDays.map(d => workoutDayStrings.includes(d.toDateString()));

  // 2. Personal Best Spotlight (Top lift from recent history)
  // We scan the recent workouts for the heaviest set ever logged.
  const allExercises = recentWorkouts.flatMap(w => (w as any).exercises || []);
  const allSets = allExercises.flatMap(ex => ex.sets || []);
  const bestSet = allSets.reduce((prev: any, curr: any) => 
    (curr.weight_kg ?? 0) > (prev?.weight_kg ?? 0) ? curr : prev
  , null);

  let prTitle = "No PRs yet";
  let prSub = "Start lifting to set records";
  if (bestSet) {
    const prExercise = allExercises.find(ex => (ex.sets || []).some((s: any) => s.id === bestSet.id));
    prTitle = `${bestSet.weight_kg}kg ${prExercise?.exercise_name}`;
    prSub = `Your heaviest lift in recent history`;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
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
            label="Time Trained"
            value={trainingLabel}
            icon="time"
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
            value={String(totalWorkouts)}
            icon="fitness"
          />
        </View>

        {/* Active routine widget */}
        {activeRoutine && todayDay && (
          <Card
            variant="accent"
            padding="md"
            style={{ marginBottom: Spacing.md }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <Ionicons name="barbell" size={16} color={Colors.accent} />
              <Text
                style={{
                  color: Colors.textMuted,
                  fontSize: FontSize.xs,
                  fontWeight: FontWeight.bold,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                Today's Routine
              </Text>
            </View>
            <Text
              style={{
                color: Colors.textPrimary,
                fontSize: FontSize.xl,
                fontWeight: FontWeight.black,
              }}
            >
              {todayDay.name}
            </Text>
            <Text
              style={{
                color: Colors.accentDim,
                fontSize: FontSize.sm,
                marginBottom: Spacing.sm,
              }}
            >
              {activeRoutine.name} · Day {todayIdx + 1} of {activeDays.length}
            </Text>
            <Button
              label={`Start ${todayDay.name}`}
              onPress={handleStartRoutineDay}
              variant="primary"
              size="sm"
            />
          </Card>
        )}

        {/* Weekly Consistency Bar */}
        <View style={styles.consistencyRow}>
          {weekDays.map((date, i) => (
            <View key={i} style={styles.dayCol}>
              <View 
                style={[
                  styles.dayOrb, 
                  weeklyConsistency[i] && styles.dayOrbActive
                ]} 
              />
              <Text style={styles.dayInit}>
                {date.toLocaleDateString("en-US", { weekday: "narrow" })}
              </Text>
            </View>
          ))}
        </View>

        {/* PR Spotlight Card */}
        <Card variant="default" padding="md" style={styles.prCard}>
          <View style={styles.prHeader}>
            <Ionicons name="trophy" size={16} color={Colors.warning} />
            <Text style={styles.prLabel}>PERSONAL BEST SPOTLIGHT</Text>
          </View>
          <Text style={styles.prTitle}>{prTitle}</Text>
          <Text style={styles.prSub}>{prSub}</Text>
          <View style={styles.prGlow} />
        </Card>

        {/* Compact Quick Actions */}
        <View style={styles.compactActions}>
          <TouchableOpacity 
            style={[styles.compactBtn, { backgroundColor: Colors.bgCard }]}
            onPress={handleStartWorkout}
          >
            <Ionicons name="barbell" size={20} color={Colors.accent} />
            <Text style={styles.compactBtnText}>Solo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.compactBtn, { backgroundColor: Colors.bgCard }]}
            onPress={() => navigation.navigate("SessionTab" as any)}
          >
            <Ionicons name="people" size={20} color={Colors.cyan} />
            <Text style={styles.compactBtnText}>Group</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.compactBtn, { backgroundColor: Colors.bgCard }]}
            onPress={() => navigation.navigate("WorkoutTab" as any)}
          >
            <Ionicons name="list" size={20} color={Colors.textSecondary} />
            <Text style={styles.compactBtnText}>Routines</Text>
          </TouchableOpacity>
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
    marginTop: 0,
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

  // Consistency Bar
  consistencyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayCol: { alignItems: "center", gap: 6 },
  dayOrb: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayOrbActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  dayInit: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },

  // PR Card
  prCard: {
    marginBottom: Spacing.lg,
    overflow: "hidden",
    position: "relative",
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  prHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  prLabel: {
    color: Colors.warning,
    fontSize: 10,
    fontWeight: FontWeight.black,
    letterSpacing: 1,
  },
  prTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
  },
  prSub: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  prGlow: {
    position: "absolute",
    right: -20,
    bottom: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.warning + "11",
  },

  // Compact Actions
  compactActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  compactBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  compactBtnText: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
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
