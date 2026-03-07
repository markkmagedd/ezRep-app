// ─────────────────────────────────────────────
//  ezRep — Card Component
// ─────────────────────────────────────────────

import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Colors, Radius, Spacing, Shadow } from "@/constants/theme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "default" | "accent" | "flat";
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  children,
  style,
  variant = "default",
  padding = "md",
}: CardProps) {
  return (
    <View
      style={[
        styles.base,
        styles[`variant_${variant}`],
        styles[`padding_${padding}`],
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
  },
  variant_default: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  variant_accent: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    ...Shadow.accent,
  },
  variant_flat: {
    backgroundColor: Colors.bgSurface,
  },
  padding_none: { padding: 0 },
  padding_sm: { padding: Spacing.sm },
  padding_md: { padding: Spacing.md },
  padding_lg: { padding: Spacing.lg },
});
