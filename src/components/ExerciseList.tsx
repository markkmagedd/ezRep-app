import React from "react";
import {
  FlatList,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
} from "react-native";
import {
  Colors,
  Spacing,
  FontSize,
  FontWeight,
} from "../constants/theme";
import { ExerciseRecord } from "@/types";
import { Card } from "./common/Card";
import { useExerciseStore } from "@/store/exercise-store";

interface ExerciseListProps {
  onSelect: (exercise: ExerciseRecord) => void;
}

export const ExerciseList = ({ onSelect }: ExerciseListProps) => {
  const { filteredExercises } = useExerciseStore();

  const renderItem = ({ item }: { item: ExerciseRecord }) => (
    <TouchableOpacity onPress={() => onSelect(item)}>
      <Card variant="flat" padding="md" style={styles.card}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.details}>
              {item.bodyParts.join(", ")} • {item.equipments?.join(", ") || "No equipment"}
            </Text>
          </View>
          <Text style={styles.difficulty}>{item.exerciseType || "STRENGTH"}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={filteredExercises}
      renderItem={renderItem}
      keyExtractor={(item) => item.exerciseId}
      ListEmptyComponent={() => (
        <View style={styles.center}>
          <Text style={styles.muted}>No exercises found.</Text>
        </View>
      )}
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  card: {
    marginBottom: Spacing.xs,
    borderColor: Colors.border,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  details: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    textTransform: "capitalize",
    marginTop: 2,
  },
  difficulty: {
    color: Colors.accent,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    textTransform: "uppercase",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  muted: {
    color: Colors.textMuted,
    fontSize: FontSize.md,
  },
});
