// ─────────────────────────────────────────────
//  ezRep — Workout Logger Screen
//  Full-featured solo workout tracker:
//  add exercises → log sets (weight × reps) → finish
// ─────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
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
import { SetRow } from "@/components/workout/SetRow";
import { RestTimer } from "@/components/workout/RestTimer";
import { useWorkoutStore, type DraftExercise } from "@/store/workoutStore";
import type { HomeStackParamList } from "@/types";

type Props = NativeStackScreenProps<HomeStackParamList, "WorkoutLogger">;

export default function WorkoutLoggerScreen({ navigation, route }: Props) {
  const {
    activeWorkout,
    exercises,
    startedAt,
    addSet,
    updateSet,
    removeSet,
    completeSet,
    removeExercise,
    finishWorkout,
    discardWorkout,
    isLoading,
  } = useWorkoutStore();

  const [elapsed, setElapsed] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [lastCompletedExId, setLastCompletedExId] = useState<string | null>(
    null,
  );

  // Elapsed timer
  useEffect(() => {
    if (!startedAt) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const formatElapsed = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0)
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Total completed sets volume
  const totalVolume = exercises.reduce(
    (acc, ex) =>
      acc +
      ex.sets
        .filter((s) => s.completed)
        .reduce((a, s) => a + (s.reps ?? 0) * (s.weight_kg ?? 0), 0),
    0,
  );

  function handleSetComplete(exId: string, setId: string) {
    completeSet(exId, setId);
    setLastCompletedExId(exId);
    setShowRestTimer(true);
  }

  function confirmDiscard() {
    Alert.alert("Discard Workout?", "All progress will be lost.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Discard",
        style: "destructive",
        onPress: () => {
          discardWorkout();
          navigation.goBack();
        },
      },
    ]);
  }

  async function handleFinish() {
    const completedSets = exercises.flatMap((e) =>
      e.sets.filter((s) => s.completed),
    );
    if (completedSets.length === 0) {
      Alert.alert(
        "No Sets Logged",
        "Complete at least one set before finishing.",
      );
      return;
    }
    try {
      await finishWorkout();
      navigation.goBack();
    } catch {
      Alert.alert("Error", "Failed to save workout. Please try again.");
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        {/* ── Top Bar ────────────────────────────────────── */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            onLongPress={confirmDiscard}
            style={styles.topBarBtn}
          >
            <Ionicons name="chevron-down" size={24} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.topBarCenter}>
            <Text style={styles.workoutName}>
              {activeWorkout?.name ?? "Workout"}
            </Text>
            <Text style={styles.timer}>{formatElapsed(elapsed)}</Text>
          </View>

          <Button
            label="Finish"
            onPress={handleFinish}
            loading={isLoading}
            size="sm"
            style={styles.finishBtn}
            fullWidth={false}
          />
        </View>

        {/* ── Volume strip ────────────────────────────────── */}
        <View style={styles.volumeStrip}>
          <Ionicons name="barbell" size={14} color={Colors.accent} />
          <Text style={styles.volumeText}>
            {totalVolume.toFixed(0)} kg total volume
          </Text>
        </View>

        {/* ── Exercise list ───────────────────────────────── */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {exercises.length === 0 && (
            <Card style={styles.emptyCard}>
              <Ionicons
                name="add-circle-outline"
                size={40}
                color={Colors.textMuted}
              />
              <Text style={styles.emptyText}>
                Add your first exercise below.
              </Text>
            </Card>
          )}

          {exercises.map((ex) => (
            <ExerciseBlock
              key={ex.id}
              exercise={ex}
              onAddSet={() => addSet(ex.id)}
              onUpdateSet={(setId, updates) => updateSet(ex.id, setId, updates)}
              onCompleteSet={(setId) => handleSetComplete(ex.id, setId)}
              onRemoveSet={(setId) => removeSet(ex.id, setId)}
              onRemoveExercise={() => removeExercise(ex.id)}
            />
          ))}

          {/* Add Exercise button */}
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

          {/* Discard link */}
          <TouchableOpacity
            style={styles.discardLink}
            onPress={confirmDiscard}
          >
            <Text style={styles.discardLinkText}>Discard Workout</Text>
          </TouchableOpacity>

          <View style={{ height: Spacing.xxl }} />
        </ScrollView>

        {/* ── Rest Timer Modal ────────────────────────────── */}
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

// ── ExerciseBlock ─────────────────────────────────────────────────────────────

interface ExerciseBlockProps {
  exercise: DraftExercise;
  onAddSet: () => void;
  onUpdateSet: (setId: string, updates: any) => void;
  onCompleteSet: (setId: string) => void;
  onRemoveSet: (setId: string) => void;
  onRemoveExercise: () => void;
}

function ExerciseBlock({
  exercise,
  onAddSet,
  onUpdateSet,
  onCompleteSet,
  onRemoveSet,
  onRemoveExercise,
}: ExerciseBlockProps) {
  const completedCount = exercise.sets.filter((s) => s.completed).length;
  const volume = exercise.sets
    .filter((s) => s.completed)
    .reduce((a, s) => a + (s.reps ?? 0) * (s.weight_kg ?? 0), 0);

  return (
    <Card style={styles.exCard} padding="md">
      {/* Exercise header */}
      <View style={styles.exHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.exName}>{exercise.exercise_name}</Text>
          <Text style={styles.exMeta}>
            {completedCount}/{exercise.sets.length} sets · {volume.toFixed(0)}{" "}
            kg
          </Text>
        </View>
        <TouchableOpacity onPress={onRemoveExercise} style={styles.removeBtnEx}>
          <Ionicons name="trash-outline" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Set header labels */}
      <View style={styles.setHeader}>
        <Text style={[styles.setHeaderLabel, { width: 28 }]}>Set</Text>
        <Text style={[styles.setHeaderLabel, { width: 50 }]}>Prev</Text>
        <Text style={[styles.setHeaderLabel, { flex: 1 }]}>kg</Text>
        <Text style={styles.setHeaderLabel}>×</Text>
        <Text style={[styles.setHeaderLabel, { flex: 1 }]}>Reps</Text>
        <Text style={[styles.setHeaderLabel, { width: 36 }]}></Text>
        <Text style={[styles.setHeaderLabel, { width: 18 }]}></Text>
      </View>

      {/* Sets */}
      {exercise.sets.map((set, idx) => {
        const prev = exercise.sets[idx - 1];
        return (
          <SetRow
            key={set.id}
            set={set}
            onUpdate={(u) => onUpdateSet(set.id, u)}
            onComplete={() => onCompleteSet(set.id)}
            onDelete={() => onRemoveSet(set.id)}
            prevReps={prev?.reps ?? null}
            prevWeight={prev?.weight_kg ?? null}
          />
        );
      })}

      {/* Add Set */}
      <TouchableOpacity style={styles.addSetBtn} onPress={onAddSet}>
        <Ionicons name="add" size={16} color={Colors.textSecondary} />
        <Text style={styles.addSetText}>Add Set</Text>
      </TouchableOpacity>
    </Card>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  topBarBtn: { padding: Spacing.xs },
  topBarCenter: { flex: 1, alignItems: "center" },
  workoutName: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  timer: {
    color: Colors.accent,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    fontVariant: ["tabular-nums"],
  },
  finishBtn: {
    backgroundColor: Colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Radius.md,
  },

  volumeStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.accentMuted,
  },
  volumeText: {
    color: Colors.accent,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },

  scrollContent: { padding: Spacing.md },

  emptyCard: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
  },

  exCard: { marginBottom: Spacing.md },
  exHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  exName: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  exMeta: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  removeBtnEx: { padding: 4 },

  setHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: 4,
    paddingHorizontal: Spacing.xs,
  },
  setHeaderLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textTransform: "uppercase",
    textAlign: "center",
  },

  addSetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: Spacing.sm,
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Spacing.xs,
  },
  addSetText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },

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
    marginTop: Spacing.sm,
  },
  addExText: {
    color: Colors.accent,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  discardLink: {
    alignItems: "center",
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  discardLinkText: {
    color: Colors.danger,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
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
