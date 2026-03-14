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
        "You already have an active workout. Finish or discard it first."
      );
      return;
    }

    try {
      await startWorkout({
        name: day.name,
        routineDayId: day.id,
        routineId: routine?.id,
      });
      navigation.navigate("WorkoutLogger", {
        routineDayId: day.id,
        routineDayName: day.name,
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
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {/* Header (Back Only) */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
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
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>{routine.name}</Text>
          {isActive ? (
            <View style={styles.activeBanner}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={Colors.accent}
              />
              <Text style={styles.activeBannerText}>
                Currently Active Routine
              </Text>
            </View>
          ) : (
            <Text style={styles.heroSub}>Inactive Routine</Text>
          )}
        </View>

        {/* Improved Summary Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.insightBox}>
            <Text style={styles.insightValue}>{days.length}</Text>
            <Text style={styles.insightLabel}>Days</Text>
          </View>
          <View style={styles.insightBox}>
            <Text style={styles.insightValue}>
              {days.reduce((a, d) => a + d.exercises.length, 0)}
            </Text>
            <Text style={styles.insightLabel}>Exercises</Text>
          </View>
          {isActive && (
            <View
              style={[styles.insightBox, { borderColor: Colors.accentDim }]}
            >
              <Text style={[styles.insightValue, { color: Colors.accent }]}>
                #{currentDayIndex + 1}
              </Text>
              <Text style={styles.insightLabel}>Next Up</Text>
            </View>
          )}
        </View>

        {/* Global Activate Button */}
        {!isActive && (
          <Button
            label="Set as Active Routine"
            onPress={() =>
              Alert.alert(
                "Activate Routine",
                `Set "${routine.name}" as your active routine?`,
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Activate",
                    onPress: () => setActiveRoutine(routineId),
                  },
                ]
              )
            }
            variant="primary"
            style={styles.globalActivateBtn}
          />
        )}

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
                      numberOfLines={1}
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
                  fullWidth={false}
                />
              </View>

              {/* Exercise list */}
              {day.exercises.length > 0 && (
                <View style={styles.exList}>
                  {day.exercises.map((ex, ei) => (
                    <View key={ex.id} style={styles.exRow}>
                      <View style={styles.exInfo}>
                        <Text style={styles.exName}>{ex.exercise_name}</Text>
                        <Text style={styles.exDetail}>
                          {ex.target_sets} sets × {ex.target_reps} reps
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={12}
                        color={Colors.textMuted}
                      />
                    </View>
                  ))}
                </View>
              )}
            </Card>
          );
        })}
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
    gap: Spacing.sm,
  },
  backBtn: {
    padding: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heroSection: {
    marginBottom: Spacing.xl,
  },
  heroTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.hero,
    fontWeight: FontWeight.black,
    lineHeight: 42,
  },
  heroSub: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    marginTop: 4,
  },
  activeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    backgroundColor: Colors.accentMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    alignSelf: "flex-start",
  },
  activeBannerText: {
    color: Colors.accent,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },

  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xl },

  statsGrid: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  insightBox: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  insightValue: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
  },
  insightLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },

  globalActivateBtn: {
    marginBottom: Spacing.xl,
  },

  sectionTitle: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: FontWeight.black,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: Spacing.md,
  },

  dayCard: {
    marginBottom: Spacing.md,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  dayNumberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bgSurface,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayNumberText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.black,
  },
  dayTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingRight: Spacing.md,
  },
  dayName: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    flexShrink: 1,
  },
  nextBadge: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.pill,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  nextBadgeText: {
    color: Colors.bg,
    fontSize: 8,
    fontWeight: FontWeight.black,
    letterSpacing: 1,
  },
  dayExCount: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    marginTop: 2,
  },

  exList: {
    marginTop: Spacing.lg,
    gap: Spacing.xs,
  },
  exRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bgSurface,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    gap: Spacing.sm,
  },
  exInfo: {
    flex: 1,
  },
  exName: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  exDetail: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 1,
  },

  emptyCard: { alignItems: "center" },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.sm },
});
