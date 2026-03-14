// ─────────────────────────────────────────────
//  ezRep — Workout Logger Screen
//  Session-style solo workout tracker:
//  one exercise at a time, big inputs, set pills
// ─────────────────────────────────────────────

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  Radius,
  Shadow,
} from "@/constants/theme";
import { Card } from "@/components/common/Card";
import { RestTimer } from "@/components/workout/RestTimer";
import { useWorkoutStore } from "@/store/workoutStore";
import type { HomeStackParamList } from "@/types";

type Props = NativeStackScreenProps<HomeStackParamList, "WorkoutLogger">;

export default function WorkoutLoggerScreen({ navigation, route }: Props) {
  const {
    activeWorkout,
    exercises,
    startedAt,
    isPaused,
    pausedMs,
    addSet,
    updateSet,
    removeSet,
    completeSet,
    removeExercise,
    finishWorkout,
    discardWorkout,
    minimizeWorkout,
    resumeWorkout,
    pauseWorkout,
    unpauseWorkout,
    isLoading,
  } = useWorkoutStore();

  // Track whether finish/discard was intentionally triggered
  const intentionalExitRef = useRef(false);

  // Auto-minimize on blur, resume on focus
  useFocusEffect(
    useCallback(() => {
      resumeWorkout();
      intentionalExitRef.current = false;
      return () => {
        if (!intentionalExitRef.current) {
          minimizeWorkout();
        }
      };
    }, [])
  );

  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);

  function handlePauseResume() {
    if (isPaused) {
      unpauseWorkout();
    } else {
      pauseWorkout();
    }
  }

  // Elapsed timer — stops while paused
  useEffect(() => {
    if (!startedAt || isPaused) return;
    const interval = setInterval(() => {
      setElapsed(
        Math.floor((Date.now() - startedAt.getTime() - pausedMs) / 1000)
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt, isPaused, pausedMs]);

  // Clamp currentExIndex when exercises change
  useEffect(() => {
    if (currentExIndex >= exercises.length && exercises.length > 0) {
      setCurrentExIndex(exercises.length - 1);
    }
  }, [exercises.length]);

  const formatElapsed = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const currentExercise = exercises[currentExIndex] ?? null;
  const completedSets = currentExercise
    ? currentExercise.sets.filter((s) => s.completed)
    : [];
  const totalCompletedAll = exercises.reduce(
    (a, e) => a + e.sets.filter((s) => s.completed).length,
    0,
  );
  const totalVolume = exercises.reduce(
    (a, e) =>
      a +
      e.sets
        .filter((s) => s.completed)
        .reduce((acc, s) => acc + (s.reps ?? 0) * (s.weight_kg ?? 0), 0),
    0,
  );

  // ── Handlers ───────────────────────────────────────────────

  function handleLogSet() {
    if (!currentExercise) return;
    const w = parseFloat(weight);
    const r = parseInt(reps, 10);
    if (!w || !r || w <= 0 || r <= 0) {
      Alert.alert("Invalid Input", "Enter weight and reps greater than 0.");
      return;
    }

    // Find next incomplete set, or add a new one
    let targetSet = currentExercise.sets.find((s) => !s.completed);
    if (!targetSet) {
      addSet(currentExercise.id);
      const updated = useWorkoutStore.getState().exercises;
      const ex = updated.find((e) => e.id === currentExercise.id);
      targetSet = ex?.sets.find((s) => !s.completed);
    }
    if (!targetSet) return;

    updateSet(currentExercise.id, targetSet.id, { weight_kg: w, reps: r });
    completeSet(currentExercise.id, targetSet.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setWeight("");
    setReps("");
    setShowRestTimer(true);
  }

  function handleRemoveLastSet() {
    if (!currentExercise || completedSets.length === 0) return;
    const last = completedSets[completedSets.length - 1];
    Alert.alert(
      "Undo Last Set?",
      `Remove ${last.weight_kg}kg × ${last.reps}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeSet(currentExercise.id, last.id),
        },
      ],
    );
  }

  function handleRemoveExercise() {
    if (!currentExercise) return;
    Alert.alert(
      "Remove Exercise?",
      `Remove ${currentExercise.exercise_name} and all its sets?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeExercise(currentExercise.id),
        },
      ],
    );
  }

  function confirmDiscard() {
    Alert.alert("Discard Workout?", "All progress will be lost.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Discard",
        style: "destructive",
        onPress: () => {
          intentionalExitRef.current = true;
          discardWorkout();
          navigation.goBack();
        },
      },
    ]);
  }

  async function handleFinish() {
    if (totalCompletedAll === 0) {
      Alert.alert(
        "No Sets Logged",
        "Complete at least one set before finishing.",
      );
      return;
    }
    try {
      intentionalExitRef.current = true;
      await finishWorkout();
      navigation.goBack();
    } catch {
      Alert.alert("Error", "Failed to save workout. Please try again.");
    }
  }

  // ── Render ─────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={60}
      >
        {/* ── Top Bar ────────────────────────────── */}
        <View style={styles.topBar}>
          <View style={styles.topLeft}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.minimizeBtn}
            >
              <Ionicons
                name="chevron-down"
                size={22}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
            <Text style={styles.timer}>{formatElapsed(elapsed)}</Text>
          </View>

          {/* Exercise progress dots */}
          <View style={styles.progressDots}>
            {exercises.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => setCurrentExIndex(i)}>
                <View
                  style={[
                    styles.dot,
                    i === currentExIndex && styles.dotActive,
                    i < currentExIndex && styles.dotDone,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.topRight}>
            <TouchableOpacity
              style={styles.pauseBtn}
              onPress={handlePauseResume}
            >
              <Ionicons name={isPaused ? "play" : "pause"} size={16} color={Colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.discardBtn}
              onPress={confirmDiscard}
            >
              <Ionicons name="close" size={18} color={Colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── No exercises state ────────────────── */}
          {exercises.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons
                name="add-circle-outline"
                size={48}
                color={Colors.textMuted}
              />
              <Text style={styles.emptyTitle}>No Exercises Yet</Text>
              <Text style={styles.emptySubtitle}>
                Add your first exercise to get started.
              </Text>
            </View>
          )}

          {/* ── Current Exercise Card ─────────────── */}
          {currentExercise && (
            <>
              <Card variant="accent" style={styles.exCard} padding="lg">
                <View style={styles.exCardTop}>
                  <Text style={styles.exIndexLabel}>
                    Exercise {currentExIndex + 1} of {exercises.length}
                  </Text>
                  <TouchableOpacity
                    onPress={handleRemoveExercise}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={16}
                      color={Colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.exName}>
                  {currentExercise.exercise_name}
                </Text>
                <Text style={styles.exTarget}>
                  {currentExercise.sets.length} sets ·{" "}
                  {completedSets.length} completed
                </Text>
              </Card>

              {/* ── Completed Set Pills ────────────── */}
              {completedSets.length > 0 && (
                <>
                  <Text style={styles.sectionLabel}>Logged Sets</Text>
                  <View style={styles.setPills}>
                    {completedSets.map((s) => (
                      <View key={s.id} style={styles.setPill}>
                        <Text style={styles.setPillText}>
                          {s.weight_kg}×{s.reps}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={styles.undoBtn}
                    onPress={handleRemoveLastSet}
                  >
                    <Ionicons
                      name="arrow-undo-outline"
                      size={14}
                      color={Colors.textMuted}
                    />
                    <Text style={styles.undoBtnText}>Undo Last Set</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* ── Set Logger ─────────────────────── */}
              <Text style={styles.sectionLabel}>Log Set</Text>
              <Card style={styles.loggerCard} padding="lg">
                <Text style={styles.loggerHint}>
                  Set {completedSets.length + 1}
                  {completedSets.length > 0 && (
                    <Text style={styles.loggerPrev}>
                      {" "}
                      (last: {completedSets[completedSets.length - 1].weight_kg}
                      kg × {completedSets[completedSets.length - 1].reps})
                    </Text>
                  )}
                </Text>

                <View style={styles.loggerInputs}>
                  {/* Weight */}
                  <View style={styles.loggerInputGroup}>
                    <Text style={styles.loggerInputLabel}>Weight (kg)</Text>
                    <TextInput
                      style={styles.loggerInput}
                      keyboardType="decimal-pad"
                      placeholder={
                        completedSets.length > 0
                          ? completedSets[
                              completedSets.length - 1
                            ].weight_kg?.toString() ?? "0"
                          : "0"
                      }
                      placeholderTextColor={Colors.textMuted}
                      value={weight}
                      onChangeText={setWeight}
                      returnKeyType="next"
                      selectionColor={Colors.accent}
                    />
                  </View>

                  <Text style={styles.loggerSeparator}>×</Text>

                  {/* Reps */}
                  <View style={styles.loggerInputGroup}>
                    <Text style={styles.loggerInputLabel}>Reps</Text>
                    <TextInput
                      style={styles.loggerInput}
                      keyboardType="number-pad"
                      placeholder={
                        completedSets.length > 0
                          ? completedSets[
                              completedSets.length - 1
                            ].reps?.toString() ?? "0"
                          : "0"
                      }
                      placeholderTextColor={Colors.textMuted}
                      value={reps}
                      onChangeText={setReps}
                      returnKeyType="done"
                      onSubmitEditing={handleLogSet}
                      selectionColor={Colors.accent}
                    />
                  </View>

                  {/* Log button */}
                  <TouchableOpacity
                    style={[
                      styles.logBtn,
                      (!weight || !reps) && { opacity: 0.4 },
                    ]}
                    onPress={handleLogSet}
                    disabled={!weight || !reps}
                  >
                    <Ionicons name="checkmark" size={28} color={Colors.bg} />
                  </TouchableOpacity>
                </View>
              </Card>

              {/* ── Exercise navigation ────────────── */}
              <View style={styles.exNav}>
                <TouchableOpacity
                  style={[
                    styles.exNavBtn,
                    currentExIndex === 0 && styles.exNavBtnDisabled,
                  ]}
                  disabled={currentExIndex === 0}
                  onPress={() => setCurrentExIndex((i) => i - 1)}
                >
                  <Ionicons
                    name="chevron-back"
                    size={18}
                    color={
                      currentExIndex === 0
                        ? Colors.textMuted
                        : Colors.textPrimary
                    }
                  />
                  <Text
                    style={[
                      styles.exNavBtnText,
                      currentExIndex === 0 && styles.exNavBtnTextDisabled,
                    ]}
                  >
                    Previous
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.exNavBtn,
                    currentExIndex >= exercises.length - 1 &&
                      styles.exNavBtnDisabled,
                  ]}
                  disabled={currentExIndex >= exercises.length - 1}
                  onPress={() => setCurrentExIndex((i) => i + 1)}
                >
                  <Text
                    style={[
                      styles.exNavBtnText,
                      currentExIndex >= exercises.length - 1 &&
                        styles.exNavBtnTextDisabled,
                    ]}
                  >
                    Next
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={
                      currentExIndex >= exercises.length - 1
                        ? Colors.textMuted
                        : Colors.textPrimary
                    }
                  />
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* ── Add Exercise ──────────────────────── */}
          <TouchableOpacity
            style={styles.addExBtn}
            onPress={() =>
              navigation.navigate("ExerciseSelector", {
                workoutId: activeWorkout?.id ?? "",
              })
            }
          >
            <Ionicons name="add-circle" size={20} color={Colors.accent} />
            <Text style={styles.addExText}>Add Exercise</Text>
          </TouchableOpacity>

          {/* ── Rest timer trigger ────────────────── */}
          <TouchableOpacity
            style={styles.restTimerTrigger}
            onPress={() => setShowRestTimer(true)}
          >
            <Ionicons
              name="timer-outline"
              size={18}
              color={Colors.textMuted}
            />
            <Text style={styles.restTimerText}>Rest Timer</Text>
          </TouchableOpacity>

          {/* ── Volume summary ────────────────────── */}
          {totalCompletedAll > 0 && (
            <View style={styles.volumeSummary}>
              <Ionicons name="barbell" size={14} color={Colors.accent} />
              <Text style={styles.volumeText}>
                {totalVolume.toFixed(0)} kg total · {totalCompletedAll} sets
              </Text>
            </View>
          )}

          {/* ── Finish button ─────────────────────── */}
          {totalCompletedAll > 0 && (
            <TouchableOpacity
              style={styles.finishBtn}
              onPress={handleFinish}
              disabled={isLoading}
            >
              <Ionicons name="checkmark-circle" size={20} color={Colors.bg} />
              <Text style={styles.finishBtnText}>Finish Workout</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: Spacing.xxl }} />
        </ScrollView>

        {/* ── Rest Timer Modal ────────────────────── */}
        <Modal
          visible={showRestTimer}
          animationType="slide"
          transparent
          onRequestClose={() => setShowRestTimer(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowRestTimer(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.modalSheet}
              onPress={(e) => e.stopPropagation()}
            >
              <RestTimer onDismiss={() => setShowRestTimer(false)} />
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  topLeft: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  minimizeBtn: { padding: 2 },
  timer: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontVariant: ["tabular-nums"],
  },
  progressDots: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.accent,
    width: 20,
    borderRadius: 4,
  },
  dotDone: { backgroundColor: Colors.accentDim },
  menuBtn: { padding: 4 },
  topRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pauseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent + "22",
    borderWidth: 1,
    borderColor: Colors.accent + "66",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  discardBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.danger + "22",
    borderWidth: 1,
    borderColor: Colors.danger + "66",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },

  scroll: { padding: Spacing.md },

  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  emptySubtitle: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
  },

  exCard: { marginBottom: Spacing.lg },
  exCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  exIndexLabel: {
    color: Colors.accentDim,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  exName: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  exTarget: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
  },

  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },

  setPills: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    marginBottom: Spacing.xs,
  },
  setPill: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + "22",
    paddingVertical: 4,
    paddingHorizontal: 10,
    minWidth: 60,
    alignItems: "center",
  },
  setPillText: {
    color: Colors.accent,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    fontVariant: ["tabular-nums"],
  },

  undoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingVertical: 4,
    marginBottom: Spacing.sm,
  },
  undoBtnText: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
  },

  loggerCard: { marginBottom: Spacing.sm },
  loggerHint: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.md,
  },
  loggerPrev: {
    color: Colors.textMuted,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.sm,
  },
  loggerInputs: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  loggerInputGroup: { flex: 1, alignItems: "center", gap: 4 },
  loggerInputLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  loggerInput: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.accentDim,
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: FontWeight.black,
    textAlign: "center",
    paddingVertical: Spacing.sm,
    width: "100%",
    height: 64,
  },
  loggerSeparator: {
    color: Colors.textMuted,
    fontSize: 28,
    fontWeight: FontWeight.black,
    paddingHorizontal: 4,
    marginTop: 20,
  },
  logBtn: {
    width: 64,
    height: 64,
    borderRadius: Radius.md,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    ...Shadow.accent,
  },

  exNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  exNavBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  exNavBtnDisabled: { opacity: 0.3 },
  exNavBtnText: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  exNavBtnTextDisabled: { color: Colors.textMuted },

  addExBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    borderStyle: "dashed",
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  addExText: {
    color: Colors.accent,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },

  restTimerTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: Spacing.sm,
  },
  restTimerText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
  },

  volumeSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
  },
  volumeText: {
    color: Colors.accent,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },

  finishBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
    ...Shadow.accent,
  },
  finishBtnText: {
    color: Colors.bg,
    fontSize: FontSize.md,
    fontWeight: FontWeight.black,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    margin: Spacing.md,
    marginBottom: Spacing.xl,
  },
});