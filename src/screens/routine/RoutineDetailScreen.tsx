// ─────────────────────────────────────────────
//  ezRep — Routine Detail Screen
//  Shows all days in a routine with exercises.
//  Tapping "Start" on any day launches WorkoutLogger
//  pre-loaded with that day's exercise template.
// ─────────────────────────────────────────────

import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
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
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { useRoutineStore } from "@/store/routineStore";
import { useWorkoutStore } from "@/store/workoutStore";
import type { WorkoutStackParamList, RoutineDay } from "@/types";

type Props = NativeStackScreenProps<WorkoutStackParamList, "RoutineDetail">;

export default function RoutineDetailScreen({ navigation, route }: Props) {
  const { routineId } = route.params;

  const {
    routines,
    routineDetails,
    activeRoutine,
    loadRoutineDetail,
    setActiveRoutine,
    isLoading,
  } = useRoutineStore();
  const { startWorkout, activeWorkout } = useWorkoutStore();

  const routine = routines.find((r) => r.id === routineId);
  const days: RoutineDay[] = routineDetails[routineId] ?? [];
  const isActive = activeRoutine?.id === routineId;

  // Current day based on routine progress
  const currentDayIndex = routine
    ? routine.current_day_index % Math.max(days.length, 1)
    : 0;

  useEffect(() => {
    loadRoutineDetail(routineId);
  }, [routineId]);

  async function handleStartDay(day: RoutineDay) {
    if (activeWorkout) {
      Alert.alert(
        "Workout In Progress",
        "You already have an active workout. Finish or discard it first.",
      );
      return;
    }

    try {
      await startWorkout({
        name: day.name,
        routineDayId: day.id,
        routineId: routine?.id,
      });
    } catch {
      Alert.alert("Error", "Could not start workout. Please try again.");
    }
  }

  if (!routine) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {routine.name}
        </Text>
        {!isActive && (
          <TouchableOpacity
            style={styles.activateBtn}
            onPress={() =>
              Alert.alert(
                "Activate Routine",
                `Set "${routine.name}" as your active routine?`,
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Activate", onPress: () => setActiveRoutine(routineId) },
                ],
              )
            }
          >
            <Text style={styles.activateBtnText}>Activate</Text>
          </TouchableOpacity>
        )}
        {isActive && (
          <View style={styles.activePill}>
            <Text style={styles.activePillText}>Active</Text>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => loadRoutineDetail(routineId)}
            tintColor={Colors.accent}
          />
        }
      >
        {/* Routine summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{days.length}</Text>
            <Text style={styles.summaryLabel}>Days</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {days.reduce((a, d) => a + d.exercises.length, 0)}
            </Text>
            <Text style={styles.summaryLabel}>Exercises</Text>
          </View>
          {isActive && (
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: Colors.accent }]}>
                Day {currentDayIndex + 1}
              </Text>
              <Text style={styles.summaryLabel}>Next up</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Days</Text>

        {days.length === 0 && !isLoading && (
          <Card variant="flat" padding="lg" style={styles.emptyCard}>
            <Text style={styles.emptyText}>No days yet.</Text>
          </Card>
        )}

        {days.map((day, i) => {
          const isCurrent = isActive && i === currentDayIndex;

          return (
            <Card
              key={day.id}
              variant={isCurrent ? "accent" : "default"}
              padding="md"
              style={styles.dayCard}
            >
              {/* Day header */}
              <View style={styles.dayHeader}>
                <View style={styles.dayNumberCircle}>
                  <Text
                    style={[
                      styles.dayNumberText,
                      isCurrent && { color: Colors.accent },
                    ]}
                  >
                    {day.day_number}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.dayTitleRow}>
                    <Text
                      style={[
                        styles.dayName,
                        isCurrent && { color: Colors.accent },
                      ]}
                    >
                      {day.name}
                    </Text>
                    {isCurrent && (
                      <View style={styles.nextBadge}>
                        <Text style={styles.nextBadgeText}>TODAY</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.dayExCount}>
                    {day.exercises.length} exercise
                    {day.exercises.length !== 1 ? "s" : ""}
                  </Text>
                </View>

                <Button
                  label={isCurrent ? "Start" : "Run"}
                  onPress={() => handleStartDay(day)}
                  variant={isCurrent ? "primary" : "secondary"}
                  size="sm"
                />
              </View>

              {/* Exercise list */}
              {day.exercises.length > 0 && (
                <View style={styles.exList}>
                  {day.exercises.map((ex, ei) => (
                    <View key={ex.id} style={styles.exRow}>
                      <View style={styles.exOrderDot} />
                      <Text style={styles.exName}>{ex.exercise_name}</Text>
                      <Text style={styles.exTarget}>
                        {ex.target_sets}×{ex.target_reps}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          );
        })}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    flex: 1,
  },
  activateBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  activateBtnText: {
    color: Colors.accent,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  activePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: Colors.accentMuted,
  },
  activePillText: {
    color: Colors.accent,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },

  scroll: { padding: Spacing.md },

  summaryRow: {
    flexDirection: "row",
    gap: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  summaryItem: { alignItems: "center" },
  summaryValue: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
  },
  summaryLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },

  dayCard: { marginBottom: Spacing.sm },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  dayNumberCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bgSurface,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  dayNumberText: {
    color: Colors.textMuted,
    fontSize: FontSize.md,
    fontWeight: FontWeight.black,
  },
  dayTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  dayName: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  nextBadge: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.pill,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  nextBadgeText: {
    color: Colors.bg,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 1,
  },
  dayExCount: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    marginTop: 2,
  },

  exList: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 6,
  },
  exRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  exOrderDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accentDim,
    flexShrink: 0,
  },
  exName: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    flex: 1,
  },
  exTarget: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    fontVariant: ["tabular-nums"],
  },

  emptyCard: { alignItems: "center" },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.sm },
});
