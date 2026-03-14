import React from "react";
import { ScrollView, TouchableOpacity, Text, StyleSheet } from "react-native";
import {
  Colors,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
} from "../constants/theme";
import { useExerciseStore } from "../store/exercise-store";
import { ExerciseCategory } from "@/types";

const CATEGORIES: { id: ExerciseCategory | null; label: string }[] = [
  { id: null, label: "All" },
  { id: "chest", label: "Chest" },
  { id: "back", label: "Back" },
  { id: "shoulders", label: "Shoulders" },
  { id: "arms", label: "Arms" },
  { id: "legs", label: "Legs" },
  { id: "core", label: "Core" },
  { id: "cardio", label: "Cardio" },
  { id: "full_body", label: "Full Body" },
];

export const MuscleGroupFilter = () => {
  const { selectedBodyPart, setBodyPart } = useExerciseStore();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {CATEGORIES.map((cat) => {
        const isActive =
          (!cat.id && !selectedBodyPart) ||
          (cat.id && selectedBodyPart?.toLowerCase() === cat.id.toLowerCase());

        return (
          <TouchableOpacity
            key={cat.label}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => setBodyPart(cat.id ? cat.label.toUpperCase() : null)}
          >
            <Text style={[styles.text, isActive && styles.textActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    minHeight: 32,
    maxHeight: 40,
    marginBottom: Spacing.sm,
  },
  content: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
    alignItems: "center",
  },
  chip: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.accentMuted,
    borderColor: Colors.accent,
  },
  text: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textTransform: "capitalize",
  },
  textActive: {
    color: Colors.accent,
  },
});
