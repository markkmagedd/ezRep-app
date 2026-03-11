// ─────────────────────────────────────────────
//  ezRep — Routine List Screen
//  Shows all user routines. The active routine
//  is highlighted with today's day at the top.
// ─────────────────────────────────────────────

import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
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
import type { WorkoutStackParamList, Routine } from "@/types";

type Props = NativeStackScreenProps<WorkoutStackParamList, "RoutineList">;

export default function RoutineListScreen({ navigation }: Props) {
  const {
    routines,
    activeRoutine,
    routineDetails,
    loadRoutines,
    loadRoutineDetail,
    setActiveRoutine,
    deleteRoutine,
    isLoading,
  } = useRoutineStore();
  const { startWorkout, activeWorkout } = useWorkoutStore();

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadRoutines();
  }, []);

  // Load day details for all routines so we can show previews
  useEffect(() => {
    for (const r of routines) {
      if (!routineDetails[r.id]) {
        loadRoutineDetail(r.id);
      }
    }
  }, [routines]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadRoutines();
    setRefreshing(false);
  }

  function handleActivate(routine: Routine) {
    Alert.alert(
      "Set Active Routine",
      `Make "${routine.name}" your current routine?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Activate",
          onPress: () => setActiveRoutine(routine.id),
        },
      ],
    );
  }

  function handleDelete(routine: Routine) {
    Alert.alert(
      "Delete Routine",
      `Delete "${routine.name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteRoutine(routine.id),
        },
      ],
    );
  }

  async function handleStartToday() {
    if (!activeRoutine) return;
    const days = routineDetails[activeRoutine.id] ?? [];
    if (days.length === 0) return;

    const dayIndex = activeRoutine.current_day_index % days.length;
    const today = days[dayIndex];

    try {
      await startWorkout({
        name: today.name,
        routineDayId: today.id,
        routineId: activeRoutine.id,
      });
      navigation.navigate("WorkoutLogger", {
        routineDayId: today.id,
        routineDayName: today.name,
      });
    } catch {
      Alert.alert("Error", "Could not start workout. Please try again.");
    }
  }

  // ── Active routine hero ────────────────────────────────────────────────
  const activeDays = activeRoutine
    ? (routineDetails[activeRoutine.id] ?? [])
    : [];
  const todayIndex = activeRoutine
    ? activeRoutine.current_day_index % Math.max(activeDays.length, 1)
    : 0;
  const todayDay = activeDays[todayIndex];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Routines</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate("CreateRoutine", {})}
        >
          <Ionicons name="add" size={26} color={Colors.accent} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={routines}
        keyExtractor={(r) => r.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.accent}
          />
        }
        ListHeaderComponent={
          <>
            {/* ── Today's Workout widget ──────────────────────────── */}
            {activeRoutine && (
              <Card variant="accent" padding="lg" style={styles.todayCard}>
                <View style={styles.todayBadge}>
                  <Text style={styles.todayBadgeText}>ACTIVE ROUTINE</Text>
                </View>
                <Text style={styles.todayRoutineName}>
                  {activeRoutine.name}
                </Text>

                {todayDay ? (
                  <>
                    <View style={styles.todayDayRow}>
                      <Text style={styles.todayDayLabel}>
                        Day {todayIndex + 1} of {activeDays.length}
                      </Text>
                      <Text style={styles.todayDayName}>{todayDay.name}</Text>
                    </View>
                    <Text style={styles.todayExCount}>
                      {todayDay.exercises.length} exercise
                      {todayDay.exercises.length !== 1 ? "s" : ""}
                    </Text>

                    <Button
                      label={
                        activeWorkout
                          ? "Resume Workout"
                          : `Start ${todayDay.name}`
                      }
                      onPress={
                        activeWorkout
                          ? () => navigation.navigate("WorkoutLogger", {})
                          : handleStartToday
                      }
                      variant="primary"
                      size="lg"
                      style={{ marginTop: Spacing.md }}
                    />
                  </>
                ) : (
                  <Text style={styles.todayNoDays}>
                    Add days to this routine to get started.
                  </Text>
                )}
              </Card>
            )}

            {routines.length === 0 && !isLoading && (
              <Card variant="flat" padding="lg" style={styles.emptyCard}>
                <Ionicons
                  name="barbell-outline"
                  size={48}
                  color={Colors.textMuted}
                />
                <Text style={styles.emptyTitle}>No Routines Yet</Text>
                <Text style={styles.emptyBody}>
                  Create a routine to organise your training into structured
                  days and exercises.
                </Text>
                <Button
                  label="Create Routine"
                  onPress={() => navigation.navigate("CreateRoutine", {})}
                  variant="primary"
                  size="md"
                  style={{ marginTop: Spacing.lg }}
                />
              </Card>
            )}

            {routines.length > 0 && (
              <Text style={styles.sectionTitle}>All Routines</Text>
            )}
          </>
        }
        renderItem={({ item: routine }) => {
          const days = routineDetails[routine.id] ?? [];
          const isActive = routine.id === activeRoutine?.id;

          return (
            <Card
              variant={isActive ? "accent" : "default"}
              padding="md"
              style={styles.routineCard}
            >
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("RoutineDetail", {
                    routineId: routine.id,
                  })
                }
                activeOpacity={0.7}
                style={{ flex: 1 }}
              >
                <View style={styles.routineCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.routineName,
                        isActive && { color: Colors.accent },
                      ]}
                    >
                      {routine.name}
                    </Text>
                    <Text style={styles.routineMeta}>
                      {days.length} day{days.length !== 1 ? "s" : ""}
                      {days.length > 0 &&
                        ` · ${days.map((d) => d.name).join(" / ")}`}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={Colors.textMuted}
                  />
                </View>

                {isActive && (
                  <View style={styles.activeBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color={Colors.accent}
                    />
                    <Text style={styles.activeBadgeText}>Active</Text>
                    <Text style={styles.activeDayText}>
                      · Day{" "}
                      {(routine.current_day_index % Math.max(days.length, 1)) +
                        1}{" "}
                      next
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Card actions */}
              <View style={styles.cardActions}>
                {!isActive && (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleActivate(routine)}
                  >
                    <Ionicons
                      name="radio-button-on-outline"
                      size={18}
                      color={Colors.textMuted}
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleDelete(routine)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={Colors.danger}
                  />
                </TouchableOpacity>
              </View>
            </Card>
          );
        }}
        contentContainerStyle={styles.list}
        ListFooterComponent={
          isLoading ? (
            <ActivityIndicator
              color={Colors.accent}
              style={{ marginTop: Spacing.xl }}
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  addBtn: { padding: 4 },

  list: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  todayCard: { marginBottom: Spacing.lg },
  todayBadge: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.pill,
    paddingVertical: 2,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
    marginBottom: Spacing.sm,
  },
  todayBadgeText: {
    color: Colors.bg,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 1,
  },
  todayRoutineName: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.sm,
  },
  todayDayRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.sm,
  },
  todayDayLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
  },
  todayDayName: {
    color: Colors.accent,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
  },
  todayExCount: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  todayNoDays: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    marginTop: Spacing.sm,
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

  routineCard: {
    marginBottom: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
  },
  routineCardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  routineName: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  routineMeta: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: Spacing.xs,
  },
  activeBadgeText: {
    color: Colors.accent,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  activeDayText: {
    color: Colors.accentDim,
    fontSize: FontSize.xs,
  },
  cardActions: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  actionBtn: { padding: 6 },

  emptyCard: {
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  emptyBody: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: "center",
    lineHeight: 20,
  },
});
