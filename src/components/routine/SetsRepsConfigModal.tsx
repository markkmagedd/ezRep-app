import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from "@/constants/theme";
import { Button } from "@/components/common/Button";

interface SetsRepsConfigModalProps {
  isVisible: boolean;
  exerciseName: string;
  onConfirm: (sets: number, reps: number) => void;
  onCancel: () => void;
}

export function SetsRepsConfigModal({
  isVisible,
  exerciseName,
  onConfirm,
  onCancel,
}: SetsRepsConfigModalProps) {
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");

  const handleConfirm = () => {
    const s = parseInt(sets, 10);
    const r = parseInt(reps, 10);
    if (isNaN(s) || s <= 0 || isNaN(r) || r <= 0) return;
    onConfirm(s, r);
  };

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.modalContainer}
            >
              <View style={styles.card}>
                <View style={styles.header}>
                  <Text style={styles.title} numberOfLines={1}>
                    {exerciseName}
                  </Text>
                  <TouchableOpacity onPress={onCancel} style={styles.closeBtn}>
                    <Ionicons name="close" size={24} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>

                <View style={styles.content}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Target Sets</Text>
                    <TextInput
                      style={styles.input}
                      value={sets}
                      onChangeText={setSets}
                      keyboardType="number-pad"
                      placeholder="3"
                      placeholderTextColor={Colors.textMuted}
                      autoFocus
                    />
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Target Reps</Text>
                    <TextInput
                      style={styles.input}
                      value={reps}
                      onChangeText={setReps}
                      keyboardType="number-pad"
                      placeholder="10"
                      placeholderTextColor={Colors.textMuted}
                    />
                  </View>
                </View>

                <View style={styles.footer}>
                  <Button
                    label="Confirm Selection"
                    onPress={handleConfirm}
                    variant="primary"
                    size="lg"
                    fullWidth
                  />
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 400,
  },
  card: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.md,
    overflow: "hidden",
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  closeBtn: {
    padding: 12,
  },
  content: {
    padding: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
  },
  inputGroup: {
    flex: 1,
    alignItems: "center",
  },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  input: {
    color: Colors.accent,
    fontSize: FontSize.hero,
    fontWeight: FontWeight.black,
    textAlign: "center",
    width: "100%",
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  footer: {
    padding: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
