// ─────────────────────────────────────────────
//  ezRep — Exercise Selector Screen
//  Browse or search the exercise library to add to the active workout
// ─────────────────────────────────────────────

import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CATEGORY_LABELS } from "@/constants/exercises";
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  Radius,
  Shadow,
} from "@/constants/theme";
import { useWorkoutStore } from "@/store/workoutStore";
import { useExerciseStore } from "@/store/exercise-store";
import type { HomeStackParamList, ExerciseCategory, ExerciseRecord } from "@/types";

type Props = NativeStackScreenProps<HomeStackParamList, "ExerciseSelector">;

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
const TRAY_HEIGHT = 120;

export default function ExerciseSelectorScreen({ navigation }: Props) {
  const { addExercises } = useWorkoutStore();
  const {
    filteredExercises,
    searchQuery,
    selectedBodyPart,
    selectedEquipment,
    setSearchQuery,
    setBodyPart,
    setEquipment,
    indexedLibrary,
  } = useExerciseStore();

  // Local temporary selection buffer (SelectionBuffer)
  const [selectionBuffer, setSelectionBuffer] = useState<ExerciseRecord[]>([]);

  const trayAnim = React.useRef(new Animated.Value(TRAY_HEIGHT)).current;

  React.useEffect(() => {
    const toValue = selectionBuffer.length > 0 ? 0 : TRAY_HEIGHT;
    Animated.timing(trayAnim, {
      toValue,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [selectionBuffer.length]);

  const isSelected = useCallback(
    (id: string) => selectionBuffer.some((s) => s.exerciseId === id),
    [selectionBuffer]
  );

  const toggleSelection = useCallback((exercise: ExerciseRecord) => {
    setSelectionBuffer((prev) => {
      const exists = prev.some((p) => p.exerciseId === exercise.exerciseId);
      if (exists) return prev.filter((p) => p.exerciseId !== exercise.exerciseId);
      return [...prev, exercise];
    });
  }, []);

  function commitSelections() {
    addExercises(selectionBuffer.map(ex => ({ id: ex.exerciseId, name: ex.name })));
    navigation.goBack();
  }

  const equipments = useMemo(() => {
    const set = new Set<string>();
    indexedLibrary.forEach((ex) => {
      ex.equipments?.forEach((eq) => set.add(eq));
    });
    return Array.from(set).sort();
  }, [indexedLibrary]);

  // Selection now buffered locally; row presses toggle items in the SelectionBuffer.

  function handleInfo(exerciseId: string) {
    navigation.navigate("ExerciseDetail", { exerciseId });
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises..."
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
          returnKeyType="search"
          selectionColor={Colors.accent}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category chips (Body Parts) */}
      <View style={styles.chipsWrap}>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(c) => c}
          contentContainerStyle={styles.chipsList}
          renderItem={({ item: cat }) => {
            const label = CATEGORY_LABELS[cat] || cat;
            const isActive = selectedBodyPart?.toLowerCase() === label.toLowerCase();
            return (
              <TouchableOpacity
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setBodyPart(isActive ? null : label.toUpperCase())}
              >
                <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Equipment chips omitted if none */}
      {equipments.length > 0 && (
        <View style={[styles.chipsWrap, { marginTop: Spacing.xs }]}>
          <FlatList
            data={equipments}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(e) => e}
            contentContainerStyle={styles.chipsList}
            renderItem={({ item: eq }) => {
              const isActive = selectedEquipment === eq;
              return (
                <TouchableOpacity
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => setEquipment(isActive ? null : eq)}
                >
                  <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
                    {eq}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}

      {/* Results count */}
      <Text style={styles.resultCount}>
        {filteredExercises.length} exercise{filteredExercises.length !== 1 ? "s" : ""}
      </Text>

      {/* Exercise list */}
      <FlatList
        data={filteredExercises}
        keyExtractor={(e) => e.exerciseId}
        style={{ flex: 1 }}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.exRow} onPress={() => toggleSelection(item)} activeOpacity={0.7}>
            <View style={styles.exIconCircle}>
              <Ionicons
                name="barbell-outline"
                size={18}
                color={Colors.accent}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.exName}>{item.name}</Text>
              <Text style={styles.exMeta}>
                {item.targetMuscles.slice(0, 2).join(" · ")}
                {item.equipments && item.equipments.length > 0 && ` · ${item.equipments[0]}`}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleInfo(item.exerciseId)}
              style={styles.infoBtn}
            >
              <Ionicons
                name="information-circle-outline"
                size={22}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
            <Ionicons
              name={isSelected(item.exerciseId) ? "checkmark-circle" : "add-circle-outline"}
              size={22}
              color={isSelected(item.exerciseId) ? Colors.accent : Colors.accentMuted}
            />
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No exercises found.</Text>
          </View>
        }
      />

      {/* Bottom Tray */}
      <Animated.View
        style={[
          styles.tray,
          {
            transform: [{ translateY: trayAnim }],
          },
        ]}
      >
        {selectionBuffer.length > 0 && (
          <View style={styles.trayChipsWrap}>
            <FlatList
              data={selectionBuffer}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(e) => e.exerciseId}
              contentContainerStyle={styles.trayChipsList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.trayChip}
                  onPress={() => toggleSelection(item)}
                >
                  <Text style={styles.trayChipLabel} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Ionicons name="close-circle" size={14} color={Colors.accent} />
                </TouchableOpacity>
              )}
            />
          </View>
        )}
        <TouchableOpacity style={styles.trayAddBtn} onPress={commitSelections}>
          <Text style={styles.trayAddBtnText}>
            Add ({selectionBuffer.length}) Exercises
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
  },

  chipsWrap: { height: 40, justifyContent: "center" },
  chipsList: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    alignItems: "center",
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.accentMuted,
    borderColor: Colors.accent,
  },
  chipLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  chipLabelActive: { color: Colors.accent },

  resultCount: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },

  tray: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: TRAY_HEIGHT,
    backgroundColor: Colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    justifyContent: "center",
    ...Shadow.md,
  },
  trayChipsWrap: {
    height: 44,
    marginBottom: Spacing.sm,
  },
  trayChipsList: {
    gap: Spacing.sm,
    alignItems: "center",
  },
  trayChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.borderActive,
  },
  trayChipLabel: {
    color: Colors.accent,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    maxWidth: 120,
  },
  trayAddBtn: {
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  trayAddBtnText: {
    color: Colors.bg,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.md,
  },

  exRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  exIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accentMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  exName: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  exMeta: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  infoBtn: {
    padding: 4,
  },
  separator: { height: 1, backgroundColor: Colors.border },
  empty: { alignItems: "center", paddingTop: Spacing.xl },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.md },
});
