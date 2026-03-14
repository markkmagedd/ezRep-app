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

  // ── Weekly Insights Logic ───────────────────────────────────────────────
  const today = new Date();
  const diffToMon = (today.getDay() + 6) % 7; // 0=Mon, 1=Tue... 6=Sun
  const startOfThisWeek = new Date(today);
  startOfThisWeek.setDate(today.getDate() - diffToMon);
  startOfThisWeek.setHours(0, 0, 0, 0);

  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);
  
  const endOfLastWeek = new Date(startOfThisWeek);
  endOfLastWeek.setMilliseconds(-1);

  let thisWeekWorkouts = 0;
  let thisWeekVolume = 0;
  let lastWeekWorkouts = 0;
  let lastWeekVolume = 0;

  for (const w of recentWorkouts) {
    const d = new Date(w.started_at);
    if (d >= startOfThisWeek) {
      thisWeekWorkouts++;
      thisWeekVolume += w.total_volume_kg;
    } else if (d >= startOfLastWeek && d <= endOfLastWeek) {
      lastWeekWorkouts++;
      lastWeekVolume += w.total_volume_kg;
    }
  }

  const volDiff = thisWeekVolume - lastWeekVolume;
  const volPct = lastWeekVolume > 0 ? Math.round((Math.abs(volDiff) / lastWeekVolume) * 100) : 100;
  const isVolUp = volDiff >= 0;
  const volTrendText = lastWeekVolume === 0 && thisWeekVolume === 0 
    ? "No volume yet" 
    : lastWeekVolume === 0 
      ? "↑ New volume!" 
      : `${isVolUp ? '↑' : '↓'} ${volPct}% from last week`;
  const volTrendColor = lastWeekVolume === 0 && thisWeekVolume === 0 ? Colors.textMuted : isVolUp ? Colors.success : Colors.danger;

  const woDiff = thisWeekWorkouts - lastWeekWorkouts;
  const isWoUp = woDiff >= 0;
  const woTrendText = lastWeekWorkouts === 0 && thisWeekWorkouts === 0
    ? "No workouts yet"
    : lastWeekWorkouts === 0
      ? "↑ Started training!"
      : `${isWoUp ? '↑' : '↓'} ${Math.abs(woDiff)} from last week`;
  const woTrendColor = lastWeekWorkouts === 0 && thisWeekWorkouts === 0 ? Colors.textMuted : isWoUp ? Colors.success : Colors.danger;

  // ── Dashboard Helpers ───────────────────────────────────────────────────
  
  // 1. Grid Consistency (Calendar Aligned 4-Week Grid)
  const diffToMonday = (today.getDay() + 6) % 7; // 0=Mon, 1=Tue... 6=Sun
  const startOfGrid = new Date(today);
  startOfGrid.setDate(today.getDate() - diffToMonday - 21); // Start 3 weeks ago Monday

  const gridDays = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(startOfGrid);
    d.setDate(startOfGrid.getDate() + i);
    return d;
  });

  const workoutDayStrings = recentWorkouts.map(w => new Date(w.started_at).toDateString());
  const todayStr = today.toDateString();

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

        {/* Weekly Insights Widget */}
        <View style={styles.insightsRow}>
          <View style={styles.insightBox}>
            <View style={styles.insightHeader}>
              <Ionicons name="fitness" size={16} color={Colors.accent} />
              <Text style={styles.insightTitle}>This Week</Text>
            </View>
            <Text style={styles.insightValue}>{thisWeekWorkouts}</Text>
            <Text style={styles.insightSub}>Workouts</Text>
            <Text style={[styles.insightTrend, { color: woTrendColor }]}>{woTrendText}</Text>
          </View>

          <View style={styles.statsDivider} />

          <View style={styles.insightBox}>
            <View style={styles.insightHeader}>
              <Ionicons name="barbell" size={16} color={Colors.cyan} />
              <Text style={styles.insightTitle}>Volume</Text>
            </View>
            <Text style={styles.insightValue}>{thisWeekVolume.toFixed(0)} <Text style={{ fontSize: FontSize.sm, color: Colors.textMuted }}>kg</Text></Text>
            <Text style={styles.insightSub}>Total Lifted</Text>
            <Text style={[styles.insightTrend, { color: volTrendColor }]}>{volTrendText}</Text>
          </View>
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

        {/* Consistency Grid (GitHub Style) */}
        <View style={styles.gridContainer}>
          <Text style={styles.gridLabel}>LAST 4 WEEKS MOMENTUM</Text>
          
          <View style={styles.gridWrapper}>
            {/* Day Labels */}
            <View style={styles.dayLabels}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <Text key={i} style={styles.dayLabelText}>{day}</Text>
              ))}
            </View>

            <View style={styles.grid}>
              {gridDays.map((date, i) => {
                const isWorkout = workoutDayStrings.includes(date.toDateString());
                const isFuture = date > today;
                const isToday = date.toDateString() === todayStr;

                return (
                  <View 
                    key={i} 
                    style={[
                      styles.gridBox, 
                      isWorkout && styles.gridBoxActive,
                      isFuture && styles.gridBoxFuture,
                      isToday && styles.gridBoxToday
                    ]} 
                  />
                );
              })}
            </View>
          </View>
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
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            snapToInterval={280 + Spacing.md}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContent}
          >
            {recentWorkouts.map((w) => (
              <WorkoutCarouselCard key={w.id} workout={w} />
            ))}
          </ScrollView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

 // Sub-components ────────────────────────────────────────────────────────────

function WorkoutCarouselCard({ workout }: { workout: Workout }) {
  const date = new Date(workout.started_at).toLocaleDateString("en-US", {
    weekday: "short",
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

  // Extract top 3 exercises
  const exercises = (workout as any).exercises || [];
  const exerciseNames = exercises.slice(0, 3).map((ex: any) => ex.exercise_name);
  const extCount = exercises.length - 3;

  return (
    <Card style={styles.carouselCard} padding="md">
      <View style={styles.carouselHeader}>
        <View style={styles.carouselIconWrap}>
          <Ionicons name="barbell" size={16} color={Colors.accent} />
        </View>
        <Text style={styles.carouselDate}>{date}</Text>
      </View>
      
      <Text style={styles.carouselName} numberOfLines={1}>{workout.name}</Text>
      
      <View style={styles.carouselStatsRow}>
        {duration !== null && (
          <View style={styles.carouselStat}>
            <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.carouselStatText}>{duration} min</Text>
          </View>
        )}
        <View style={styles.carouselStat}>
          <Ionicons name="stats-chart" size={14} color={Colors.accent} />
          <Text style={[styles.carouselStatText, { color: Colors.accent, fontWeight: "bold" }]}>
            {workout.total_volume_kg.toFixed(0)} kg
          </Text>
        </View>
      </View>

      <View style={styles.carouselLine} />

      <View style={styles.carouselExercises}>
        {exerciseNames.length > 0 ? (
          <>
            {exerciseNames.map((name: string, i: number) => (
              <Text key={i} style={styles.carouselExerciseLine} numberOfLines={1}>
                • {name}
              </Text>
            ))}
            {extCount > 0 && (
              <Text style={styles.carouselExerciseMore}>+ {extCount} more</Text>
            )}
          </>
        ) : (
          <Text style={styles.carouselExerciseLine}>No exercises logged</Text>
        )}
      </View>
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

  insightsRow: {
    flexDirection: "row",
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  insightBox: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: Spacing.sm,
  },
  insightTitle: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  insightValue: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
    lineHeight: 32,
  },
  insightSub: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginBottom: Spacing.sm,
  },
  insightTrend: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  statsDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },

  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.sm,
  },

  // Consistency Grid
  gridContainer: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gridLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: FontWeight.black,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: (14 + 6) * 7, // 7 columns * (width + gap)
    gap: 6,
  },
  gridWrapper: {
    alignItems: "center",
  },
  dayLabels: {
    flexDirection: "row",
    width: (14 + 6) * 7,
    justifyContent: "space-between",
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  dayLabelText: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: FontWeight.bold,
    width: 14,
    textAlign: "center",
  },
  gridBox: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gridBoxActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  gridBoxFuture: {
    opacity: 0.2,
    borderColor: 'transparent',
  },
  gridBoxToday: {
    borderColor: Colors.accent,
    borderWidth: 1.5,
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

  carouselContent: {
    gap: Spacing.md,
    paddingRight: Spacing.md, // extra padding at end of scroll
  },
  carouselCard: {
    width: 280,
    backgroundColor: Colors.bgCard,
  },
  carouselHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  carouselIconWrap: {
    backgroundColor: Colors.accentMuted,
    padding: 6,
    borderRadius: Radius.sm,
  },
  carouselDate: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    textTransform: "uppercase",
  },
  carouselName: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.sm,
  },
  carouselStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  carouselStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  carouselStatText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  carouselLine: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  carouselExercises: {
    gap: 2,
  },
  carouselExerciseLine: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
  },
  carouselExerciseMore: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontStyle: "italic",
    marginTop: 2,
  },
});
