// ─────────────────────────────────────────────
//  ezRep — Create Session Screen
//  Host builds the exercise queue, then the session is created in Supabase
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
  EXERCISE_LIBRARY,
  EXERCISES_BY_CATEGORY,
  CATEGORY_LABELS,
  type ExerciseDef,
  type ExerciseCategory,
} from "@/constants/exercises";
import { useSessionStore } from "@/store/sessionStore";
import type { SessionStackParamList } from "@/types";

type Props = NativeStackScreenProps<SessionStackParamList, "CreateSession">;

interface QueueItem {
  exercise: ExerciseDef;
  targetSets: number;
  targetReps: string;
}

export default function CreateSessionScreen({ navigation }: Props) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const { createSession, isLoading } = useSessionStore();

  function addToQueue(exercise: ExerciseDef) {
    if (queue.find((q) => q.exercise.id === exercise.id)) return;
    setQueue((prev) => [
      ...prev,
      { exercise, targetSets: 3, targetReps: "8-12" },
    ]);
    setShowPicker(false);
    setPickerSearch("");
  }

  function removeFromQueue(exerciseId: string) {
    setQueue((prev) => prev.filter((q) => q.exercise.id !== exerciseId));
  }

  function updateQueueItem(
    exerciseId: string,
    updates: Partial<Pick<QueueItem, "targetSets" | "targetReps">>,
  ) {
    setQueue((prev) =>
      prev.map((q) =>
        q.exercise.id === exerciseId ? { ...q, ...updates } : q,
      ),
    );
  }

  async function handleCreate() {
    if (queue.length === 0) {
      Alert.alert("No Exercises", "Add at least one exercise to the queue.");
      return;
    }
    try {
      const session = await createSession(
        queue.map((q) => ({
          id: q.exercise.id,
          name: q.exercise.name,
          targetSets: q.targetSets,
          targetReps: q.targetReps,
        })),
      );
      navigation.replace("SessionLobby", { sessionId: session.id });
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Failed to create session.");
    }
  }

  const filtered = pickerSearch.trim()
    ? EXERCISE_LIBRARY.filter((e) =>
        e.name.toLowerCase().includes(pickerSearch.toLowerCase()),
      )
    : EXERCISE_LIBRARY;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Build Exercise Queue</Text>
        <Text style={styles.subtitle}>
          Add exercises in order. Participants will work through them together.
        </Text>

        {/* Queue items */}
        {queue.map((item, index) => (
          <Card key={item.exercise.id} style={styles.queueItem} padding="md">
            <View style={styles.queueLeft}>
              <View style={styles.orderBadge}>
                <Text style={styles.orderBadgeText}>{index + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.queueExName}>{item.exercise.name}</Text>
                <Text style={styles.queueMeta}>
                  {item.exercise.muscleGroups.slice(0, 2).join(" · ")}
                </Text>
              </View>
            </View>

            {/* Sets / reps inline editors */}
            <View style={styles.queueInputs}>
              <View style={styles.queueInputGroup}>
                <Text style={styles.queueInputLabel}>Sets</Text>
                <TextInput
                  style={styles.queueInput}
                  keyboardType="number-pad"
                  value={String(item.targetSets)}
                  onChangeText={(v) =>
                    updateQueueItem(item.exercise.id, {
                      targetSets: parseInt(v, 10) || 1,
                    })
                  }
                />
              </View>
              <View style={styles.queueInputGroup}>
                <Text style={styles.queueInputLabel}>Reps</Text>
                <TextInput
                  style={[styles.queueInput, { width: 60 }]}
                  value={item.targetReps}
                  onChangeText={(v) =>
                    updateQueueItem(item.exercise.id, { targetReps: v })
                  }
                  placeholder="8-12"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={() => removeFromQueue(item.exercise.id)}
              style={styles.removeBtn}
            >
              <Ionicons name="trash-outline" size={18} color={Colors.danger} />
            </TouchableOpacity>
          </Card>
        ))}

        {/* Add Exercise button */}
        <TouchableOpacity
          style={styles.addExBtn}
          onPress={() => setShowPicker(true)}
        >
          <Ionicons name="add-circle" size={22} color={Colors.accent} />
          <Text style={styles.addExText}>Add Exercise</Text>
        </TouchableOpacity>

        {/* Exercise picker (inline for simplicity) */}
        {showPicker && (
          <Card style={styles.picker} padding="md">
            <View style={styles.pickerSearch}>
              <Ionicons name="search" size={16} color={Colors.textMuted} />
              <TextInput
                style={styles.pickerInput}
                placeholder="Search exercises..."
                placeholderTextColor={Colors.textMuted}
                value={pickerSearch}
                onChangeText={setPickerSearch}
                autoFocus
              />
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Ionicons name="close" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
            {filtered.slice(0, 10).map((ex) => (
              <TouchableOpacity
                key={ex.id}
                style={styles.pickerRow}
                onPress={() => addToQueue(ex)}
              >
                <Text style={styles.pickerName}>{ex.name}</Text>
                <Text style={styles.pickerMeta}>
                  {ex.category} · {ex.equipment}
                </Text>
              </TouchableOpacity>
            ))}
          </Card>
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* Sticky footer */}
      <View style={styles.footer}>
        <Text style={styles.footerMeta}>
          {queue.length} exercise{queue.length !== 1 ? "s" : ""} in queue
        </Text>
        <Button
          label={isLoading ? "Creating…" : "Create Session →"}
          onPress={handleCreate}
          loading={isLoading}
          disabled={queue.length === 0}
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.md, paddingBottom: 120 },

  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
    letterSpacing: -0.5,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginBottom: Spacing.xl,
    lineHeight: 18,
  },

  queueItem: { marginBottom: Spacing.sm },
  queueLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  orderBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accentMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  orderBadgeText: {
    color: Colors.accent,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.black,
  },
  queueExName: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  queueMeta: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  queueInputs: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
  queueInputGroup: { alignItems: "center", gap: 4 },
  queueInputLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    textTransform: "uppercase",
  },
  queueInput: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    width: 44,
    textAlign: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  removeBtn: { alignSelf: "flex-end", padding: 4 },

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
    marginBottom: Spacing.md,
  },
  addExText: {
    color: Colors.accent,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },

  picker: { marginTop: Spacing.sm },
  pickerSearch: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
  },
  pickerInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
  },
  pickerRow: {
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  pickerName: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  pickerMeta: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 2,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.bg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.xs,
  },
  footerMeta: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: "center",
  },
});
