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

  // ── Filter out active routine from list (it's shown in the card above) ──
  const filteredRoutines = React.useMemo(() => {
    if (!activeRoutine) return routines;
    return routines.filter((r) => r.id !== activeRoutine.id);
  }, [routines, activeRoutine?.id]);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
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

      {/* ── Today's Workout widget (Fixed at top) ── */}
      {activeRoutine && (
        <View style={{ paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, marginTop: Spacing.md }}>
          <Card variant="accent" padding="lg" style={styles.todayCard}>
            <View style={styles.todayHeaderRow}>
              <View style={styles.todayHeaderRight}>
                <View style={styles.todayBadge}>
                  <Text style={styles.todayBadgeText}>ACTIVE ROUTINE</Text>
                </View>
                <Text style={styles.todayRoutineName}>{activeRoutine.name.toUpperCase()}</Text>
              </View>
            </View>

            {todayDay ? (
              <>
                <View style={styles.todayDivider} />
                <Text style={styles.todayWorkoutLabel}>TODAY'S WORKOUT</Text>
                <Text style={styles.todayDayName}>{todayDay.name}</Text>
                <Text style={styles.todayDayLabel}>
                  Day {todayIndex + 1} of {activeDays.length} · {todayDay.exercises.length} exercise{todayDay.exercises.length !== 1 ? "s" : ""}
                </Text>

                <Button
                  label={activeWorkout ? "Resume Workout" : `Start ${todayDay.name}`}
                  onPress={
                    activeWorkout
                      ? () => navigation.navigate("WorkoutLogger", {})
                      : handleStartToday
                  }
                  variant="primary"
                  size="lg"
                  style={{ marginTop: Spacing.md }}
                />
                <TouchableOpacity
                  onPress={() => navigation.navigate("RoutineDetail", { routineId: activeRoutine.id })}
                  style={{ alignSelf: "center", marginTop: Spacing.sm }}
                >
                  <Text style={{ color: Colors.textMuted, fontSize: FontSize.sm }}>View Details</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.todayNoDays}>
                Add days to this routine to get started.
              </Text>
            )}
          </Card>
        </View>
      )}

      {/* ── Section Title (Fixed at top) ── */}
      {routines.length > 0 && (
        <Text style={[styles.sectionTitle, { paddingHorizontal: Spacing.md, marginTop: activeRoutine ? 0 : Spacing.md }]}>
          All Routines
        </Text>
      )}

      <FlatList
        data={filteredRoutines}
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

          </>
        }
        renderItem={({ item: routine }) => {
          const days = routineDetails[routine.id] ?? [];
          const isActive = routine.id === activeRoutine?.id;

          return (
            <Card
              variant="default"
              padding="md"
              style={styles.routineCard}
            >
              <View style={styles.routineCardInner}>
                {/* Left: info (clickable) */}
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("RoutineDetail", {
                      routineId: routine.id,
                    })
                  }
                  activeOpacity={0.7}
                  style={styles.routineCardContent}
                >
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

                {/* Right: actions */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => !isActive && handleActivate(routine)}
                  >
                    <Ionicons
                      name={isActive ? "star" : "star-outline"}
                      size={22}
                      color={isActive ? Colors.accent : Colors.textMuted}
                    />
                  </TouchableOpacity>
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
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  addBtn: { padding: 4 },

  list: { paddingBottom: Spacing.xxl },

  todayCard: { marginBottom: Spacing.lg },
  todayHeaderRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: Spacing.sm,
  },
  todayHeaderRight: {
    alignItems: "center",
    gap: 3,
    width: "100%",
  },
  todayBadge: {
    backgroundColor: Colors.accent + "33",
    borderRadius: Radius.pill,
    paddingVertical: 2,
    paddingHorizontal: 6,
    alignSelf: "flex-start",
  },
  todayBadgeText: {
    color: Colors.accent,
    fontSize: 8,
    fontWeight: FontWeight.black,
    letterSpacing: 1,
  },
  todayRoutineName: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
  },
  todayDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginTop: 4,
    marginBottom: Spacing.sm,
  },
  todayWorkoutLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  todayDayRow: {
    flexDirection: "column",
    gap: 2,
  },
  todayDayLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: 2,
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
    marginHorizontal: Spacing.md,
  },
  routineCardInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  routineCardContent: {
    flex: 1,
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
    alignItems: "center",
    gap: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  activateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.accent,
    borderRadius: Radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  activateBtnText: {
    color: Colors.bg,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
  },
  activateBtnPlaceholder: {
    height: 24,
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
