import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  Radius,
} from "@/constants/theme";
import { useWorkoutStore } from "@/store/workoutStore";
import { Card } from "@/components/common/Card";

export default function PRSpotlightScreen() {
  const navigation = useNavigation();
  const { exercisePRs, loadAllExercisePRs, isLoading } = useWorkoutStore();

  useEffect(() => {
    loadAllExercisePRs();
  }, []);

  const renderPRItem = ({ item }: { item: any }) => (
    <Card variant="default" padding="md" style={styles.prCard}>
      <View style={styles.prMain}>
        <View style={styles.exerciseIcon}>
          <Ionicons name="trophy-outline" size={20} color={Colors.accent} />
        </View>
        <View style={styles.prInfo}>
          <Text style={styles.exerciseName}>{item.exercise_name}</Text>
          <Text style={styles.dateText}>
            Achieved: {new Date(item.achieved_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View style={styles.weightContainer}>
        <Text style={styles.weightValue}>{item.weight_kg}</Text>
        <Text style={styles.weightUnit}>kg</Text>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Heaviest Lifts</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Calculating Personal Bests...</Text>
        </View>
      ) : (
        <FlatList
          data={exercisePRs}
          renderItem={renderPRItem}
          keyExtractor={(item) => item.exercise_name}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="barbell-outline" size={64} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No PRs yet</Text>
              <Text style={styles.emptySubtitle}>Keep lifting to track your records!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  prCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  prMain: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent + "11",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  prInfo: {
    flex: 1,
  },
  exerciseName: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  dateText: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  weightContainer: {
    alignItems: "flex-end",
  },
  weightValue: {
    color: Colors.accent,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
  },
  weightUnit: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  loadingText: {
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    fontSize: FontSize.md,
  },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    color: Colors.textMuted,
    fontSize: FontSize.md,
    textAlign: "center",
    marginTop: Spacing.xs,
  },
});
