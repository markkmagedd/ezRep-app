// ─────────────────────────────────────────────
//  ezRep — SetRow Component
//  A single row showing set number, weight input, reps input, and complete toggle
// ─────────────────────────────────────────────

import React, { useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  Radius,
} from "@/constants/theme";
import type { DraftSet } from "@/store/workoutStore";

interface SetRowProps {
  set: DraftSet;
  onUpdate: (updates: Partial<DraftSet>) => void;
  onComplete: () => void;
  onDelete: () => void;
  /** If true, show a subtle "previous" ghost text inside the inputs */
  prevReps?: number | null;
  prevWeight?: number | null;
}

export function SetRow({
  set,
  onUpdate,
  onComplete,
  onDelete,
  prevReps,
  prevWeight,
}: SetRowProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  function handleComplete() {
    if (!set.reps || !set.weight_kg) return;

    // Celebratory micro-animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.96,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onComplete();
  }

  const rowBg = set.completed
    ? Colors.accentMuted
    : set.is_warmup
      ? Colors.bgSurface
      : Colors.bgCard;

  return (
    <Animated.View
      style={[
        styles.row,
        { backgroundColor: rowBg, transform: [{ scale: scaleAnim }] },
        set.completed && styles.rowComplete,
      ]}
    >
      {/* Set number */}
      <TouchableOpacity
        style={styles.setNumBadge}
        onLongPress={() => onUpdate({ is_warmup: !set.is_warmup })}
      >
        <Text style={styles.setNumText}>
          {set.is_warmup ? "W" : set.set_index}
        </Text>
      </TouchableOpacity>

      {/* Previous performance ghost */}
      {(prevWeight || prevReps) && !set.completed && (
        <Text style={styles.prevText}>
          {prevWeight}×{prevReps}
        </Text>
      )}

      {/* Weight input */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, set.completed && styles.inputComplete]}
          keyboardType="decimal-pad"
          placeholder={prevWeight ? String(prevWeight) : "0"}
          placeholderTextColor={Colors.textMuted}
          value={set.weight_kg !== null ? String(set.weight_kg) : ""}
          onChangeText={(v) =>
            onUpdate({ weight_kg: v === "" ? null : parseFloat(v) || 0 })
          }
          editable={!set.completed}
          returnKeyType="next"
        />
        <Text style={styles.inputUnit}>kg</Text>
      </View>

      <Text style={styles.separator}>×</Text>

      {/* Reps input */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, set.completed && styles.inputComplete]}
          keyboardType="number-pad"
          placeholder={prevReps ? String(prevReps) : "0"}
          placeholderTextColor={Colors.textMuted}
          value={set.reps !== null ? String(set.reps) : ""}
          onChangeText={(v) =>
            onUpdate({ reps: v === "" ? null : parseInt(v, 10) || 0 })
          }
          editable={!set.completed}
          returnKeyType="done"
          onSubmitEditing={handleComplete}
        />
        <Text style={styles.inputUnit}>reps</Text>
      </View>

      {/* Complete / delete */}
      {set.completed ? (
        <TouchableOpacity
          onPress={() => onUpdate({ completed: false })}
          style={styles.doneIcon}
        >
          <Ionicons name="checkmark-circle" size={28} color={Colors.accent} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={handleComplete}
          style={styles.completeBtn}
          disabled={!set.reps || !set.weight_kg}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={28}
            color={
              set.reps && set.weight_kg ? Colors.textSecondary : Colors.border
            }
          />
        </TouchableOpacity>
      )}

      {/* Swipe-to-delete hint (long press) */}
      <TouchableOpacity onLongPress={onDelete} style={styles.deleteBtn}>
        <Ionicons name="close" size={14} color={Colors.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    marginBottom: 6,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rowComplete: {
    borderColor: Colors.accentDim,
  },
  setNumBadge: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  setNumText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  prevText: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    width: 50,
    textAlign: "center",
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    height: 40,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    textAlign: "center",
    height: "100%",
  },
  inputComplete: { color: Colors.accent },
  inputUnit: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
  },
  separator: {
    color: Colors.textMuted,
    fontSize: FontSize.md,
    paddingHorizontal: 2,
  },
  completeBtn: { padding: 2 },
  doneIcon: { padding: 2 },
  deleteBtn: {
    padding: 4,
    marginLeft: -Spacing.xs,
  },
});
