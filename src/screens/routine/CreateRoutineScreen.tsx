// ─────────────────────────────────────────────
//  ezRep — Create Routine Screen
//
//  Two-step flow:
//    Step 1 — Enter routine name + day names
//    Step 2 — For each day, add exercises
//             (search inline, set target sets/reps)
// ─────────────────────────────────────────────

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
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
import {
  useRoutineStore,
  type DraftDay,
  type DraftDayExercise,
} from "@/store/routineStore";
import { EXERCISE_LIBRARY } from "@/constants/exercises";
import type { WorkoutStackParamList } from "@/types";

type Props = NativeStackScreenProps<WorkoutStackParamList, "CreateRoutine">;

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = "naming" | "exercises";

export default function CreateRoutineScreen({ navigation }: Props) {
  const { createRoutine, isLoading } = useRoutineStore();

  // Step 1 state
  const [step, setStep] = useState<Step>("naming");
  const [routineName, setRoutineName] = useState("");
  const [dayNames, setDayNames] = useState<string[]>(["Day 1"]);

  // Step 2 state — exercises per day
  const [days, setDays] = useState<DraftDay[]>([]);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [exSearch, setExSearch] = useState("");

  // ── Step 1 helpers ──────────────────────────────────────────────────────

  function addDay() {
    setDayNames((prev) => [...prev, `Day ${prev.length + 1}`]);
  }

  function removeDay(i: number) {
    if (dayNames.length <= 1) return;
    setDayNames((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateDayName(i: number, name: string) {
    setDayNames((prev) => prev.map((n, idx) => (idx === i ? name : n)));
  }

  function proceedToExercises() {
    if (!routineName.trim()) {
      Alert.alert("Name required", "Please enter a routine name.");
      return;
    }
    if (dayNames.some((n) => !n.trim())) {
      Alert.alert("Day name required", "All days need a name.");
      return;
    }
    const initialDays: DraftDay[] = dayNames.map((name) => ({
      name: name.trim(),
      exercises: [],
    }));
    setDays(initialDays);
    setActiveDayIdx(0);
    setStep("exercises");
  }

  // ── Step 2 helpers ──────────────────────────────────────────────────────

  function addExerciseToDay(exerciseId: string, exerciseName: string) {
    setDays((prev) =>
      prev.map((d, i) => {
        if (i !== activeDayIdx) return d;
        const exists = d.exercises.some((e) => e.exercise_id === exerciseId);
        if (exists) return d;
        const newEx: DraftDayExercise = {
          exercise_id: exerciseId,
          exercise_name: exerciseName,
          order_index: d.exercises.length,
          target_sets: 3,
          target_reps: 10,
          target_weight_kg: null,
        };
        return { ...d, exercises: [...d.exercises, newEx] };
      }),
    );
    setExSearch("");
  }

  function removeExerciseFromDay(dayIdx: number, exIdx: number) {
    setDays((prev) =>
      prev.map((d, i) => {
        if (i !== dayIdx) return d;
        return {
          ...d,
          exercises: d.exercises
            .filter((_, ei) => ei !== exIdx)
            .map((e, ei) => ({ ...e, order_index: ei })),
        };
      }),
    );
  }

  function updateExField(
    dayIdx: number,
    exIdx: number,
    field: "target_sets" | "target_reps",
    val: string,
  ) {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1) return;
    setDays((prev) =>
      prev.map((d, di) => {
        if (di !== dayIdx) return d;
        return {
          ...d,
          exercises: d.exercises.map((ex, ei) =>
            ei === exIdx ? { ...ex, [field]: num } : ex,
          ),
        };
      }),
    );
  }

  async function handleCreate() {
    try {
      await createRoutine(routineName.trim(), days);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.message ?? "Failed to create routine. Please try again.",
      );
    }
  }

  // Filtered exercise search results
  const searchResults = exSearch.trim()
    ? EXERCISE_LIBRARY.filter(
        (e) =>
          e.name.toLowerCase().includes(exSearch.toLowerCase()) ||
          e.muscleGroups.some((m) =>
            m.toLowerCase().includes(exSearch.toLowerCase()),
          ),
      ).slice(0, 12)
    : [];

  const currentDay = days[activeDayIdx];

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (step === "exercises") {
              setStep("naming");
            } else {
              navigation.goBack();
            }
          }}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {step === "naming" ? "New Routine" : "Add Exercises"}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* ══════════ STEP 1: Naming ══════════ */}
        {step === "naming" && (
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            {/* Routine name */}
            <Text style={styles.sectionLabel}>Routine Name</Text>
            <TextInput
              style={styles.nameInput}
              value={routineName}
              onChangeText={setRoutineName}
              placeholder='e.g. "Push Pull Legs"'
              placeholderTextColor={Colors.textMuted}
              autoFocus
              maxLength={40}
            />

            <Text style={styles.sectionLabel}>Days</Text>
            <Text style={styles.sectionHint}>
              Add a day for each workout type in your split.
            </Text>

            {dayNames.map((name, i) => (
              <View key={i} style={styles.dayNameRow}>
                <View style={styles.dayNumberBadge}>
                  <Text style={styles.dayNumberText}>{i + 1}</Text>
                </View>
                <TextInput
                  style={styles.dayNameInput}
                  value={name}
                  onChangeText={(v) => updateDayName(i, v)}
                  placeholder="Day name"
                  placeholderTextColor={Colors.textMuted}
                  maxLength={30}
                />
                <TouchableOpacity
                  onPress={() => removeDay(i)}
                  disabled={dayNames.length === 1}
                  style={styles.removeDayBtn}
                >
                  <Ionicons
                    name="remove-circle-outline"
                    size={22}
                    color={
                      dayNames.length === 1 ? Colors.bgSurface : Colors.danger
                    }
                  />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.addDayBtn} onPress={addDay}>
              <Ionicons
                name="add-circle-outline"
                size={20}
                color={Colors.accent}
              />
              <Text style={styles.addDayText}>Add Day</Text>
            </TouchableOpacity>

            <Button
              label="Next: Add Exercises →"
              onPress={proceedToExercises}
              variant="primary"
              size="lg"
              style={{ marginTop: Spacing.xl }}
            />
          </ScrollView>
        )}

        {/* ══════════ STEP 2: Exercises ══════════ */}
        {step === "exercises" && (
          <View style={{ flex: 1 }}>
            {/* Day tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.dayTabs}
              contentContainerStyle={{
                paddingHorizontal: Spacing.md,
                gap: Spacing.sm,
              }}
            >
              {days.map((d, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.dayTab,
                    activeDayIdx === i && styles.dayTabActive,
                  ]}
                  onPress={() => setActiveDayIdx(i)}
                >
                  <Text
                    style={[
                      styles.dayTabText,
                      activeDayIdx === i && styles.dayTabTextActive,
                    ]}
                  >
                    {d.name}
                  </Text>
                  {d.exercises.length > 0 && (
                    <View style={styles.dayTabBadge}>
                      <Text style={styles.dayTabBadgeText}>
                        {d.exercises.length}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.scroll}
              keyboardShouldPersistTaps="handled"
            >
              {/* Exercise search */}
              <View style={styles.searchRow}>
                <Ionicons
                  name="search"
                  size={18}
                  color={Colors.textMuted}
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  style={styles.searchInput}
                  value={exSearch}
                  onChangeText={setExSearch}
                  placeholder="Search exercises…"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>

              {/* Search results */}
              {searchResults.length > 0 && (
                <Card
                  variant="flat"
                  padding="none"
                  style={styles.searchResults}
                >
                  {searchResults.map((ex) => (
                    <TouchableOpacity
                      key={ex.id}
                      style={styles.searchResult}
                      onPress={() => addExerciseToDay(ex.id, ex.name)}
                    >
                      <Text style={styles.searchResultName}>{ex.name}</Text>
                      <Text style={styles.searchResultMuscle}>
                        {ex.muscleGroups.join(", ")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </Card>
              )}

              {/* Current day's exercises */}
              <Text style={styles.sectionLabel}>
                {currentDay?.name} — Exercises
              </Text>

              {currentDay?.exercises.length === 0 && (
                <Text style={styles.noExText}>
                  Search above to add exercises.
                </Text>
              )}

              {currentDay?.exercises.map((ex, exIdx) => (
                <Card
                  key={exIdx}
                  variant="default"
                  padding="md"
                  style={styles.exCard}
                >
                  <View style={styles.exCardHeader}>
                    <Text style={styles.exCardName}>{ex.exercise_name}</Text>
                    <TouchableOpacity
                      onPress={() => removeExerciseFromDay(activeDayIdx, exIdx)}
                    >
                      <Ionicons
                        name="close-circle"
                        size={20}
                        color={Colors.danger}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Sets × Reps targets */}
                  <View style={styles.targetRow}>
                    <View style={styles.targetField}>
                      <Text style={styles.targetLabel}>Sets</Text>
                      <TextInput
                        style={styles.targetInput}
                        value={String(ex.target_sets)}
                        onChangeText={(v) =>
                          updateExField(activeDayIdx, exIdx, "target_sets", v)
                        }
                        keyboardType="number-pad"
                        maxLength={2}
                      />
                    </View>
                    <Text style={styles.targetX}>×</Text>
                    <View style={styles.targetField}>
                      <Text style={styles.targetLabel}>Reps</Text>
                      <TextInput
                        style={styles.targetInput}
                        value={String(ex.target_reps)}
                        onChangeText={(v) =>
                          updateExField(activeDayIdx, exIdx, "target_reps", v)
                        }
                        keyboardType="number-pad"
                        maxLength={3}
                      />
                    </View>
                  </View>
                </Card>
              ))}

              {/* Save */}
              <Button
                label="Create Routine"
                onPress={handleCreate}
                variant="primary"
                size="lg"
                loading={isLoading}
                style={{ marginTop: Spacing.xl }}
              />
              <View style={{ height: Spacing.xxl }} />
            </ScrollView>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
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
  backBtn: { padding: 4 },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },

  scroll: { padding: Spacing.md },

  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  sectionHint: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    marginBottom: Spacing.md,
    marginTop: -Spacing.xs,
  },

  nameInput: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  dayNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  dayNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bgSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNumberText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  dayNameInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  removeDayBtn: { padding: 4 },
  addDayBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
  },
  addDayText: {
    color: Colors.accent,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },

  // Step 2
  dayTabs: {
    flexGrow: 0,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dayTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bgSurface,
    gap: 6,
  },
  dayTabActive: { backgroundColor: Colors.accentMuted },
  dayTabText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  dayTabTextActive: { color: Colors.accent },
  dayTabBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  dayTabBadgeText: {
    color: Colors.bg,
    fontSize: 10,
    fontWeight: FontWeight.black,
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
  },
  searchResults: {
    marginBottom: Spacing.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
  },
  searchResult: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchResultName: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  searchResultMuscle: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 2,
  },

  noExText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    marginBottom: Spacing.md,
  },

  exCard: { marginBottom: Spacing.sm },
  exCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  exCardName: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    flex: 1,
    marginRight: Spacing.sm,
  },
  targetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  targetField: { alignItems: "center" },
  targetLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  targetInput: {
    color: Colors.accent,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    minWidth: 48,
    textAlign: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  targetX: {
    color: Colors.textMuted,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
});
