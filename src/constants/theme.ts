// ─────────────────────────────────────────────
//  ezRep — Application Theme
//  Dark, gym-aesthetic design system
// ─────────────────────────────────────────────

export const Colors = {
  // Backgrounds
  bg: "#0D0D0D",
  bgCard: "#1A1A1A",
  bgSurface: "#242424",
  bgInput: "#1E1E1E",

  // Brand accent — electric lime
  accent: "#C6F135",
  accentDim: "#8CAA1E",
  accentMuted: "#1F2B05",

  // Secondary accent — cyan
  cyan: "#00E5FF",
  cyanDim: "#00A3B8",

  // Danger / warning
  danger: "#FF4444",
  warning: "#FFB020",

  // Success
  success: "#22C55E",

  // Text
  textPrimary: "#FFFFFF",
  textSecondary: "#9CA3AF",
  textMuted: "#4B5563",

  // Borders
  border: "#2A2A2A",
  borderActive: "#C6F135",

  // Participant colors (up to 6 concurrent users)
  participants: [
    "#C6F135", // lime
    "#00E5FF", // cyan
    "#FF6B6B", // red
    "#A78BFA", // purple
    "#FB923C", // orange
    "#34D399", // emerald
  ],
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 6,
  md: 12,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  hero: 34,
} as const;

export const FontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  black: "900" as const,
};

// Shared shadow styles (iOS + Android elevation)
export const Shadow = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  accent: {
    shadowColor: "#C6F135",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
};
