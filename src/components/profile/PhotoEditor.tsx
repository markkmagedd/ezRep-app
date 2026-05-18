import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import {
  Colors,
  FontSize,
  FontWeight,
  Radius,
  Shadow,
  Spacing,
} from "@/constants/theme";

const MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024;

interface PhotoEditorProps {
  children: React.ReactNode;
  currentPhotoUrl?: string | null;
  uploading?: boolean;
  onPhotoSelected: (localUri: string) => Promise<void>;
  onPhotoRemoved: () => Promise<void>;
  onError: (message: string) => void;
}

type EditorAction = "camera" | "library" | "remove" | null;

export function PhotoEditor({
  children,
  currentPhotoUrl,
  uploading = false,
  onPhotoSelected,
  onPhotoRemoved,
  onError,
}: PhotoEditorProps) {
  const [visible, setVisible] = useState(false);
  const [activeAction, setActiveAction] = useState<EditorAction>(null);

  const hasPhoto = Boolean(currentPhotoUrl);
  const busy = uploading || activeAction !== null;

  function closeEditor() {
    if (!busy) {
      setVisible(false);
    }
  }

  async function pickImage(source: "camera" | "library") {
    setActiveAction(source);

    try {
      const permission =
        source === "camera"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        onError(
          source === "camera"
            ? "Camera access is required to take a profile photo."
            : "Photo library access is required to choose a profile photo.",
        );
        return;
      }

      const launchPicker =
        source === "camera"
          ? ImagePicker.launchCameraAsync
          : ImagePicker.launchImageLibraryAsync;

      const result = await launchPicker({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets?.[0];

      if (!asset?.uri) {
        onError("Couldn't read the selected image.");
        return;
      }

      if (asset.fileSize && asset.fileSize > MAX_PROFILE_PHOTO_BYTES) {
        onError("Choose an image smaller than 5 MB.");
        return;
      }

      setVisible(false);
      await onPhotoSelected(asset.uri);
    } catch {
      onError("Couldn't open the photo picker. Please try again.");
    } finally {
      setActiveAction(null);
    }
  }

  async function handleRemove() {
    setActiveAction("remove");

    try {
      setVisible(false);
      await onPhotoRemoved();
    } finally {
      setActiveAction(null);
    }
  }

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.86}
        onPress={() => setVisible(true)}
        disabled={busy}
      >
        {children}
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={closeEditor}
      >
        <Pressable style={styles.backdrop} onPress={closeEditor}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <Text style={styles.title}>Profile Photo</Text>
            <Text style={styles.subtitle}>
              Choose a square image for your training profile.
            </Text>

            <ActionRow
              icon="camera-outline"
              label="Take Photo"
              description="Open the camera and crop to a square."
              onPress={() => pickImage("camera")}
              loading={activeAction === "camera"}
            />
            <ActionRow
              icon="images-outline"
              label="Choose from Library"
              description="Select an existing image from your device."
              onPress={() => pickImage("library")}
              loading={activeAction === "library"}
            />
            {hasPhoto ? (
              <ActionRow
                icon="trash-outline"
                label="Remove Photo"
                description="Go back to the default profile avatar."
                onPress={handleRemove}
                loading={activeAction === "remove"}
                destructive
              />
            ) : null}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={closeEditor}
              disabled={busy}
              activeOpacity={0.86}
            >
              <Text style={styles.cancelLabel}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

interface ActionRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  onPress: () => void;
  loading?: boolean;
  destructive?: boolean;
}

function ActionRow({
  icon,
  label,
  description,
  onPress,
  loading = false,
  destructive = false,
}: ActionRowProps) {
  return (
    <TouchableOpacity
      style={styles.actionRow}
      onPress={onPress}
      activeOpacity={0.86}
      disabled={loading}
    >
      <View
        style={[
          styles.actionIcon,
          destructive && styles.actionIconDanger,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={destructive ? Colors.danger : Colors.accent} />
        ) : (
          <Ionicons
            name={icon}
            size={20}
            color={destructive ? Colors.danger : Colors.accent}
          />
        )}
      </View>

      <View style={styles.actionCopy}>
        <Text style={[styles.actionLabel, destructive && styles.actionLabelDanger]}>
          {label}
        </Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
    padding: Spacing.md,
  },
  sheet: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.md,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginBottom: Spacing.xs,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.bg,
  },
  actionIconDanger: {
    backgroundColor: "rgba(255, 68, 68, 0.12)",
  },
  actionCopy: {
    flex: 1,
    gap: 2,
  },
  actionLabel: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  actionLabelDanger: {
    color: Colors.danger,
  },
  actionDescription: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  cancelButton: {
    marginTop: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bg,
    alignItems: "center",
  },
  cancelLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
});
