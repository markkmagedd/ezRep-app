// ─────────────────────────────────────────────
//  ezRep — Exercise Selector Screen
//  Browse or search the exercise library to add to the active workout
// ─────────────────────────────────────────────

import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  EXERCISE_LIBRARY,
  EXERCISES_BY_CATEGORY,
  CATEGORY_LABELS,
  type ExerciseDef,
  type ExerciseCategory,
} from "@/constants/exercises";
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  Radius,
} from "@/constants/theme";
import { useWorkoutStore } from "@/store/workoutStore";
import type { HomeStackParamList } from "@/types";

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

export default function ExerciseSelectorScreen({ navigation }: Props) {
  const { addExercise } = useWorkoutStore();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ExerciseCategory | null>(
    null,
  );

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

  function handleSelect(exercise: ExerciseDef) {
    addExercise(exercise.id, exercise.name);
    navigation.goBack();
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
          value={search}
          onChangeText={setSearch}
          autoFocus
          returnKeyType="search"
          selectionColor={Colors.accent}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category chips */}
      <View style={styles.chipsWrap}>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(c) => c}
          contentContainerStyle={styles.chipsList}
          renderItem={({ item: cat }) => (
            <TouchableOpacity
              style={[styles.chip, activeCategory === cat && styles.chipActive]}
              onPress={() =>
                setActiveCategory((prev) => (prev === cat ? null : cat))
              }
            >
              <Text
                style={[
                  styles.chipLabel,
                  activeCategory === cat && styles.chipLabelActive,
                ]}
              >
                {CATEGORY_LABELS[cat]}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Results count */}
      <Text style={styles.resultCount}>
        {filtered.length} exercise{filtered.length !== 1 ? "s" : ""}
      </Text>

      {/* Exercise list */}
      <FlatList
        data={filtered}
        keyExtractor={(e) => e.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.exRow}
            onPress={() => handleSelect(item)}
            activeOpacity={0.7}
          >
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
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No exercises found.</Text>
          </View>
        }
      />
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
    margin: Spacing.md,
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

  chipsWrap: { height: 44 },
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

  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
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
  separator: { height: 1, backgroundColor: Colors.border },
  empty: { alignItems: "center", paddingTop: Spacing.xl },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.md },
});
