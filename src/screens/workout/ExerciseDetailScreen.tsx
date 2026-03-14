// ─────────────────────────────────────────────
//  ezRep — Exercise Detail Screen
//  In-depth guide, instructions, and muscle targeting for an exercise
// ─────────────────────────────────────────────

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
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
import { useExerciseStore } from "@/store/exercise-store";
import type { HomeStackParamList } from "@/types";

type Props = NativeStackScreenProps<HomeStackParamList, "ExerciseDetail">;

export default function ExerciseDetailScreen({ route, navigation }: Props) {
  const { exerciseId } = route.params;
  const { library } = useExerciseStore();
  const exercise = library.find((e) => e.exerciseId === exerciseId);

  if (!exercise) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Exercise not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // T015, T016: Conditional rendering for images
  const renderAsset = () => {
    if (!exercise.imageUrl) return null;

    return (
      <View style={styles.assetContainer}>
        <Image
          source={{ uri: exercise.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {exercise.name}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {renderAsset()}

        <View style={styles.content}>
          {/* Overview */}
          {exercise.overview && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <Text style={styles.bodyText}>{exercise.overview}</Text>
            </View>
          )}

          {/* Muscles */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Muscles Targeted</Text>
            <View style={styles.tagWrap}>
              {exercise.targetMuscles.map((m) => (
                <View key={m} style={styles.tagPrimary}>
                  <Text style={styles.tagLabel}>{m}</Text>
                </View>
              ))}
              {exercise.secondaryMuscles?.map((m) => (
                <View key={m} style={styles.tagSecondary}>
                  <Text style={styles.tagLabel}>{m}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Equipment */}
          {exercise.equipments && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Equipment</Text>
              <Text style={styles.bodyText}>
                {exercise.equipments.join(", ")}
              </Text>
            </View>
          )}

          {/* Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {exercise.instructions.map((step, index) => (
              <View key={index} style={styles.stepRow}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          {/* Tips */}
          {exercise.exerciseTips && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Expert Tips</Text>
              {exercise.exerciseTips.map((tip, index) => (
                <View key={index} style={styles.tipRow}>
                  <Ionicons
                    name="bulb-outline"
                    size={18}
                    color={Colors.accent}
                  />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
    height: 56,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    flex: 1,
    textAlign: "center",
  },

  scroll: { paddingBottom: Spacing.xxl },

  assetContainer: {
    width: "100%",
    height: 240,
    backgroundColor: Colors.bgSurface,
    marginBottom: Spacing.md,
  },
  image: { width: "100%", height: "100%" },

  content: { paddingHorizontal: Spacing.md },

  section: { marginBottom: Spacing.xl },
  sectionTitle: {
    color: Colors.accent,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  bodyText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    lineHeight: 22,
  },

  tagWrap: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs },
  tagPrimary: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  tagSecondary: {
    backgroundColor: Colors.bgSurface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagLabel: {
    color: Colors.bg,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },

  stepRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.bgSurface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  stepNumText: {
    color: Colors.accent,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  stepText: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    lineHeight: 22,
  },

  tipRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.bgSurface,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  tipText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontStyle: "italic",
  },

  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.md },
});
