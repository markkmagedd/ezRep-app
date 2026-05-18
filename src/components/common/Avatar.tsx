import React from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Colors,
  FontWeight,
  Radius,
  Shadow,
} from "@/constants/theme";

interface AvatarProps {
  uri?: string | null;
  fallbackLabel: string;
  size?: number;
  loading?: boolean;
  editable?: boolean;
}

export function Avatar({
  uri,
  fallbackLabel,
  size = 88,
  loading = false,
  editable = false,
}: AvatarProps) {
  const radius = size / 2;

  return (
    <View style={[styles.frame, { width: size, height: size, borderRadius: radius }]}>
      {uri ? (
        <Image source={{ uri }} style={styles.image} />
      ) : (
        <View
          style={[
            styles.placeholder,
            { width: size, height: size, borderRadius: radius },
          ]}
        >
          <Text style={[styles.label, { fontSize: size * 0.45, lineHeight: size * 0.5 }]}>
            {fallbackLabel}
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.overlay}>
          <ActivityIndicator size="small" color={Colors.accent} />
        </View>
      ) : null}

      {editable ? (
        <View style={styles.editBadge}>
          <Ionicons name="camera" size={14} color={Colors.bg} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderWidth: 2,
    borderColor: Colors.accent,
    overflow: "hidden",
    backgroundColor: Colors.accentMuted,
    ...Shadow.accent,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.accentMuted,
  },
  label: {
    color: Colors.accent,
    fontWeight: FontWeight.black,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(13, 13, 13, 0.72)",
  },
  editBadge: {
    position: "absolute",
    right: 4,
    bottom: 4,
    width: 28,
    height: 28,
    borderRadius: Radius.pill,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.bg,
  },
});
