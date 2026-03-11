// ─────────────────────────────────────────────
//  ezRep — Create Session Screen
//  Host picks a routine day to use as the workout template.
// ─────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
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
import { useSessionStore } from "@/store/sessionStore";
import type { Routine, RoutineDay, SessionStackParamList } from "@/types";

type Props = NativeStackScreenProps<SessionStackParamList, "CreateSession">;

export default function CreateSessionScreen({ navigation }: Props) {
  const {
    routines,
    routineDetails,
    isLoading: routineLoading,
    loadRoutines,
    loadRoutineDetail,
  } = useRoutineStore();
  const { createSession, isLoading: sessionLoading } = useSessionStore();

  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [selectedDay, setSelectedDay] = useState<RoutineDay | null>(null);

  useEffect(() => {
    loadRoutines();
  }, []);

  async function handleSelectRoutine(routine: Routine) {
    setSelectedRoutine(routine);
    setSelectedDay(null);
    if (!routineDetails[routine.id]) {
      await loadRoutineDetail(routine.id);
    }
  }

  async function handleCreate() {
    if (!selectedDay) {
      Alert.alert("No Day Selected", "Please select a workout day.");
      return;
    }
    if (selectedDay.exercises.length === 0) {
      Alert.alert("Empty Day", "This workout day has no exercises.");
      return;
    }
    try {
      const session = await createSession(
        selectedDay.exercises.map((ex) => ({
          id: ex.exercise_id,
          name: ex.exercise_name,
          targetSets: ex.target_sets,
          targetReps: String(ex.target_reps),
        })),
      );
      navigation.replace("SessionLobby", { sessionId: session.id });
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Failed to create session.");
    }
  }

  const days: RoutineDay[] = selectedRoutine
    ? (routineDetails[selectedRoutine.id] ?? [])
    : [];
  const loadingDays =
    selectedRoutine && !routineDetails[selectedRoutine.id] && routineLoading;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create Session</Text>
        <Text style={styles.subtitle}>
          Pick a routine and a day to use as the workout template.
        </Text>

        {/* ── Step 1: Choose Routine ── */}
        <Text style={styles.stepLabel}>1 — Choose a Routine</Text>

        {routineLoading && routines.length === 0 ? (
          <ActivityIndicator
            color={Colors.accent}
            style={{ marginVertical: Spacing.lg }}
          />
        ) : routines.length === 0 ? (
          <Card variant="default" padding="md" style={styles.emptyCard}>
            <Ionicons
              name="barbell-outline"
              size={32}
              color={Colors.textMuted}
            />
            <Text style={styles.emptyText}>
              You have no routines yet.{"\n"}Create one in the Routines tab
              first.
            </Text>
          </Card>
        ) : (
          routines.map((r) => {
            const active = selectedRoutine?.id === r.id;
            return (
              <TouchableOpacity
                key={r.id}
                activeOpacity={0.8}
                onPress={() => handleSelectRoutine(r)}
              >
                <Card
                  variant={active ? "accent" : "default"}
                  padding="md"
                  style={styles.routineCard}
                >
                  <View
                    style={[
                      styles.iconBox,
                      active && { backgroundColor: Colors.accentMuted },
                    ]}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={22}
                      color={active ? Colors.accent : Colors.textMuted}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.routineName,
                        active && { color: Colors.accent },
                      ]}
                    >
                      {r.name}
                    </Text>
                    {r.is_active && (
                      <Text style={styles.activeBadge}>Active routine</Text>
                    )}
                  </View>
                  {active && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={Colors.accent}
                    />
                  )}
                </Card>
              </TouchableOpacity>
            );
          })
        )}

        {/* ── Step 2: Choose Day ── */}
        {selectedRoutine && (
          <>
            <Text style={[styles.stepLabel, { marginTop: Spacing.xl }]}>
              2 — Choose a Day
            </Text>
            {loadingDays ? (
              <ActivityIndicator
                color={Colors.accent}
                style={{ marginVertical: Spacing.lg }}
              />
            ) : days.length === 0 ? (
              <Card variant="default" padding="md" style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  This routine has no days configured.
                </Text>
              </Card>
            ) : (
              days.map((day) => {
                const active = selectedDay?.id === day.id;
                return (
                  <TouchableOpacity
                    key={day.id}
                    activeOpacity={0.8}
                    onPress={() => setSelectedDay(day)}
                  >
                    <Card
                      variant={active ? "accent" : "default"}
                      padding="md"
                      style={styles.routineCard}
                    >
                      <View
                        style={[
                          styles.iconBox,
                          active && { backgroundColor: Colors.accentMuted },
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayNum,
                            active && { color: Colors.accent },
                          ]}
                        >
                          D{day.day_number}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.routineName,
                            active && { color: Colors.accent },
                          ]}
                        >
                          {day.name}
                        </Text>
                        <Text style={styles.activeBadge}>
                          {day.exercises.length} exercise
                          {day.exercises.length !== 1 ? "s" : ""}
                        </Text>
                      </View>
                      {active && (
                        <Ionicons
                          name="checkmark-circle"
                          size={22}
                          color={Colors.accent}
                        />
                      )}
                    </Card>
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}

        {/* ── Step 3: Preview ── */}
        {selectedDay && selectedDay.exercises.length > 0 && (
          <>
            <Text style={[styles.stepLabel, { marginTop: Spacing.xl }]}>
              3 — Exercises
            </Text>
            <Card variant="default" padding="none" style={styles.previewCard}>
              {selectedDay.exercises.map((ex, i) => (
                <View
                  key={ex.id}
                  style={[
                    styles.previewRow,
                    i > 0 && {
                      borderTopWidth: 1,
                      borderTopColor: Colors.border,
                    },
                  ]}
                >
                  <View style={styles.previewBadge}>
                    <Text style={styles.previewBadgeText}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.previewName}>{ex.exercise_name}</Text>
                    <Text style={styles.previewMeta}>
                      {ex.target_sets} sets × {ex.target_reps} reps
                      {ex.target_weight_kg ? ` @ ${ex.target_weight_kg}kg` : ""}
                    </Text>
                  </View>
                </View>
              ))}
            </Card>
          </>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.footer}>
        {selectedDay && (
          <Text style={styles.footerMeta}>
            {selectedDay.exercises.length} exercise
            {selectedDay.exercises.length !== 1 ? "s" : ""} •{" "}
            {selectedRoutine?.name} — {selectedDay.name}
          </Text>
        )}
        <Button
          label={sessionLoading ? "Creating…" : "Create Session →"}
          onPress={handleCreate}
          loading={sessionLoading}
          disabled={!selectedDay || sessionLoading}
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.md, paddingBottom: 140 },

  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
    letterSpacing: -0.5,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginBottom: Spacing.xl,
    lineHeight: 18,
  },
  stepLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  emptyCard: {
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: "center",
    lineHeight: 20,
  },

  routineCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  routineName: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  activeBadge: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
  dayNum: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.black,
  },

  previewCard: { overflow: "hidden", marginBottom: Spacing.sm },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
  },
  previewBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.accentMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  previewBadgeText: {
    color: Colors.accent,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
  },
  previewName: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  previewMeta: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.bg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.xs,
  },
  footerMeta: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: "center",
  },
});
