// ─────────────────────────────────────────────
//  ezRep — WorkoutSheet
//  Persistent bottom sheet workout tracker.
//  Collapsed = mini handle row. Expanded = full logger.
// ─────────────────────────────────────────────

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import BottomSheet, {
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
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

// ── WorkoutSheet ──────────────────────────────────────────────────────────────

export default function WorkoutSheet() {
  const {
    activeWorkout,
    exercises,
    startedAt,
    sheetExpanded,
    expandWorkout,
    collapseWorkout,
    addSet,
    updateSet,
    removeSet,
    completeSet,
    removeExercise,
    finishWorkout,
    discardWorkout,
    isLoading,
    addExercise,
  } = useWorkoutStore();

  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheet>(null);

  // -1 = hidden, 0 = collapsed mini bar, 1 = expanded full
  const HIDDEN = -1;
  const COLLAPSED = 0;
  const EXPANDED = 1;

  const snapPoints = useMemo(() => ["10%", "95%"], []);

  // Sync sheet position to store state
  useEffect(() => {
    if (!activeWorkout) {
      sheetRef.current?.close();
    } else if (sheetExpanded) {
      sheetRef.current?.snapToIndex(EXPANDED);
    } else {
      sheetRef.current?.snapToIndex(COLLAPSED);
    }
  }, [activeWorkout, sheetExpanded]);

  // When user manually swipes the sheet
  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === HIDDEN) return;
      if (index === EXPANDED && !sheetExpanded) expandWorkout();
      if (index === COLLAPSED && sheetExpanded) collapseWorkout();
    },
    [sheetExpanded, expandWorkout, collapseWorkout],
  );

  // Elapsed timer
  const [elapsed, setElapsed] = useState(0);
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

  const totalVolume = exercises.reduce(
    (acc, ex) =>
      acc +
      ex.sets
        .filter((s) => s.completed)
        .reduce((a, s) => a + (s.reps ?? 0) * (s.weight_kg ?? 0), 0),
    0,
  );

  const [showRestTimer, setShowRestTimer] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);

  function handleSetComplete(exId: string, setId: string) {
    completeSet(exId, setId);
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
          sheetRef.current?.close();
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
      sheetRef.current?.close();
    } catch {
      Alert.alert("Error", "Failed to save workout. Please try again.");
    }
  }

  if (!activeWorkout) return null;

  const timerStr = formatElapsed(elapsed);

  return (
    <>
      <BottomSheet
        ref={sheetRef}
        index={HIDDEN}
        snapPoints={snapPoints}
        onChange={handleSheetChange}
        enablePanDownToClose={false}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.handle}
        topInset={insets.top}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
      >
        {/* ── Collapsed mini row (always visible when not fully expanded) ── */}
        <TouchableOpacity
          style={styles.miniBar}
          onPress={expandWorkout}
          activeOpacity={0.8}
        >
          <View style={styles.miniLeft}>
            <View style={styles.miniIconWrap}>
              <Ionicons name="barbell" size={16} color={Colors.accent} />
            </View>
            <View>
              <Text style={styles.miniName} numberOfLines={1}>
                {activeWorkout.name ?? "Workout"}
              </Text>
              <Text style={styles.miniTimer}>{timerStr}</Text>
            </View>
          </View>
          <View style={styles.miniRight}>
            <Ionicons name="chevron-up" size={18} color={Colors.accent} />
          </View>
        </TouchableOpacity>

        {/* ── Expanded full logger ─────────────────────────────────────── */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Top bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={collapseWorkout}
              style={styles.topBarBtn}
            >
              <Ionicons
                name="chevron-down"
                size={24}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
            <View style={styles.topBarCenter}>
              <Text style={styles.workoutName}>
                {activeWorkout.name ?? "Workout"}
              </Text>
              <Text style={styles.timer}>{timerStr}</Text>
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

          {/* Volume strip */}
          <View style={styles.volumeStrip}>
            <Ionicons name="barbell" size={14} color={Colors.accent} />
            <Text style={styles.volumeText}>
              {totalVolume.toFixed(0)} kg total volume
            </Text>
          </View>

          {/* Exercise list */}
          <BottomSheetScrollView
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
                onUpdateSet={(setId, updates) =>
                  updateSet(ex.id, setId, updates)
                }
                onCompleteSet={(setId) => handleSetComplete(ex.id, setId)}
                onRemoveSet={(setId) => removeSet(ex.id, setId)}
                onRemoveExercise={() => removeExercise(ex.id)}
              />
            ))}

            <TouchableOpacity
              style={styles.addExBtn}
              onPress={() => setShowExerciseModal(true)}
            >
              <Ionicons name="add-circle" size={20} color={Colors.accent} />
              <Text style={styles.addExText}>Add Exercise</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.discardLink}
              onPress={confirmDiscard}
            >
              <Text style={styles.discardLinkText}>Discard Workout</Text>
            </TouchableOpacity>

            <View style={{ height: insets.bottom + Spacing.xxl }} />
          </BottomSheetScrollView>
        </KeyboardAvoidingView>
      </BottomSheet>

      {/* Rest Timer Modal */}
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

      {/* Inline exercise selector modal */}
      <ExerciseSelectorModal
        visible={showExerciseModal}
        onClose={() => setShowExerciseModal(false)}
        onSelect={(id, name) => {
          addExercise(id, name);
          setShowExerciseModal(false);
        }}
      />
    </>
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

      <View style={styles.setHeader}>
        <Text style={[styles.setHeaderLabel, { width: 28 }]}>Set</Text>
        <Text style={[styles.setHeaderLabel, { width: 50 }]}>Prev</Text>
        <Text style={[styles.setHeaderLabel, { flex: 1 }]}>kg</Text>
        <Text style={styles.setHeaderLabel}>×</Text>
        <Text style={[styles.setHeaderLabel, { flex: 1 }]}>Reps</Text>
        <Text style={[styles.setHeaderLabel, { width: 36 }]}></Text>
        <Text style={[styles.setHeaderLabel, { width: 18 }]}></Text>
      </View>

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

      <TouchableOpacity style={styles.addSetBtn} onPress={onAddSet}>
        <Ionicons name="add" size={16} color={Colors.textSecondary} />
        <Text style={styles.addSetText}>Add Set</Text>
      </TouchableOpacity>
    </Card>
  );
}

// ── Inline exercise selector modal ────────────────────────────────────────────

import {
  TextInput,
  FlatList,
} from "react-native";
import {
  EXERCISE_LIBRARY,
  EXERCISES_BY_CATEGORY,
  CATEGORY_LABELS,
  type ExerciseDef,
  type ExerciseCategory,
} from "@/constants/exercises";

const CATEGORIES: ExerciseCategory[] = [
  "chest",
  "back",
  "shoulders",
  "arms",
  "legs",
  "core",
  "cardio",
  "full_body",
];

function ExerciseSelectorModal({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (id: string, name: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<ExerciseCategory | null>(null);

  const filtered = useMemo(() => {
    let list = EXERCISE_LIBRARY;
    if (activeCategory) list = EXERCISES_BY_CATEGORY[activeCategory] ?? [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.muscleGroups.some((m) => m.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [search, activeCategory]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={exStyles.container}>
        {/* Header */}
        <View style={exStyles.header}>
          <Text style={exStyles.title}>Add Exercise</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={exStyles.searchRow}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={exStyles.searchInput}
            placeholder="Search exercises..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            selectionColor={Colors.accent}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Category chips */}
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(c) => c}
          contentContainerStyle={exStyles.chipsList}
          style={{ maxHeight: 44, flexGrow: 0 }}
          renderItem={({ item: cat }) => (
            <TouchableOpacity
              style={[
                exStyles.chip,
                activeCategory === cat && exStyles.chipActive,
              ]}
              onPress={() =>
                setActiveCategory((prev) => (prev === cat ? null : cat))
              }
            >
              <Text
                style={[
                  exStyles.chipLabel,
                  activeCategory === cat && exStyles.chipLabelActive,
                ]}
              >
                {CATEGORY_LABELS[cat]}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Results */}
        <FlatList
          data={filtered}
          keyExtractor={(e) => e.id}
          contentContainerStyle={{ padding: Spacing.md }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={exStyles.exRow}
              onPress={() => onSelect(item.id, item.name)}
              activeOpacity={0.7}
            >
              <View style={exStyles.exIconCircle}>
                <Ionicons
                  name="barbell-outline"
                  size={18}
                  color={Colors.accent}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={exStyles.exName}>{item.name}</Text>
                <Text style={exStyles.exMeta}>
                  {item.muscleGroups.slice(0, 2).join(" · ")} · {item.equipment}
                </Text>
              </View>
              <Ionicons
                name="add-circle-outline"
                size={22}
                color={Colors.accent}
              />
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: Colors.border }} />
          )}
          ListEmptyComponent={
            <Text style={{ color: Colors.textMuted, textAlign: "center", marginTop: 32 }}>
              No exercises found.
            </Text>
          }
        />
      </View>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: {
    backgroundColor: Colors.border,
    width: 40,
  },

  miniBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  miniLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  miniIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent + "22",
    justifyContent: "center",
    alignItems: "center",
  },
  miniName: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  miniTimer: {
    color: Colors.accent,
    fontSize: FontSize.sm,
    fontVariant: ["tabular-nums"],
  },
  miniRight: { flexDirection: "row", alignItems: "center", gap: 12 },

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
  emptyText: { color: Colors.textMuted, fontSize: FontSize.sm },

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
  exMeta: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
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

const exStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.md,
    margin: Spacing.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: FontSize.md },
  chipsList: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    alignItems: "center",
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgSurface,
  },
  chipActive: { borderColor: Colors.accent, backgroundColor: Colors.accentMuted },
  chipLabel: { color: Colors.textMuted, fontSize: FontSize.sm },
  chipLabelActive: { color: Colors.accent, fontWeight: FontWeight.bold },
  exRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  exIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accentMuted,
    justifyContent: "center",
    alignItems: "center",
  },
  exName: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  exMeta: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
});
