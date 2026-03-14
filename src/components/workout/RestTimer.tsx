// ─────────────────────────────────────────────
//  ezRep — RestTimer Component
//  Countdown timer shown between sets
// ─────────────────────────────────────────────

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
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

interface RestTimerProps {
  onDismiss?: () => void;
}

const PRESET_OPTIONS = [60, 90, 120, 180, 240];
const DEFAULT_DURATION = 90;

export function RestTimer({ onDismiss }: RestTimerProps) {
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [remaining, setRemaining] = useState(DEFAULT_DURATION);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseRef = useRef(new Animated.Value(1));

  // Start or stop the countdown
  const start = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current!);
          setRunning(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          // Pulse animation on done
          Animated.sequence([
            Animated.timing(pulseRef.current, {
              toValue: 1.15,
              duration: 120,
              useNativeDriver: true,
            }),
            Animated.timing(pulseRef.current, {
              toValue: 1,
              duration: 120,
              useNativeDriver: true,
            }),
          ]).start();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    start();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function handleToggle() {
    if (running) {
      clearInterval(intervalRef.current!);
      setRunning(false);
    } else {
      if (remaining === 0) {
        setRemaining(duration);
      }
      setRunning(true);
      start();
    }
  }

  function handlePreset(secs: number) {
    clearInterval(intervalRef.current!);
    setDuration(secs);
    setRemaining(secs);
    setRunning(true);
    start();
  }

  function handleAddTime() {
    setRemaining((r) => r + 15);
  }

  const progress = 1 - remaining / duration;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  const done = remaining === 0;

  return (
    <View style={styles.container}>
      <View style={styles.timerHeader}>
        <Text style={styles.timerTitle}>Rest Timer</Text>
        <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn}>
          <Ionicons name="close" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Circular time display */}
      <Animated.View
        style={[styles.circle, { transform: [{ scale: pulseRef.current }] }]}
      >
        <View
          style={[styles.circleInner, done && { borderColor: Colors.success }]}
        >
          <Text style={[styles.timeText, done && { color: Colors.success }]}>
            {done ? "Done!" : timeStr}
          </Text>
        </View>
      </Animated.View>

      {/* Control buttons */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.iconBtn} onPress={handleAddTime}>
          <Ionicons
            name="add-circle-outline"
            size={28}
            color={Colors.textSecondary}
          />
          <Text style={styles.iconBtnLabel}>+15s</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playBtn, done && { backgroundColor: Colors.success }]}
          onPress={handleToggle}
        >
          <Ionicons
            name={running ? "pause" : done ? "refresh" : "play"}
            size={28}
            color={Colors.bg}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => handlePreset(duration)}
        >
          <Ionicons
            name="refresh-outline"
            size={28}
            color={Colors.textSecondary}
          />
          <Text style={styles.iconBtnLabel}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Preset chips */}
      <View style={styles.presets}>
        {PRESET_OPTIONS.map((secs) => (
          <TouchableOpacity
            key={secs}
            style={[
              styles.presetChip,
              duration === secs && styles.presetChipActive,
            ]}
            onPress={() => handlePreset(secs)}
          >
            <Text
              style={[
                styles.presetLabel,
                duration === secs && styles.presetLabelActive,
              ]}
            >
              {secs >= 60 ? `${secs / 60}m` : `${secs}s`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    alignItems: "center",
  },
  timerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: Spacing.lg,
  },
  timerTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  dismissBtn: { padding: 4 },

  circle: { marginBottom: Spacing.lg },
  circleInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: Colors.accent,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.accentMuted,
  },
  timeText: {
    color: Colors.accent,
    fontSize: 36,
    fontWeight: FontWeight.black,
    letterSpacing: -1,
  },

  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtn: { alignItems: "center", gap: 2 },
  iconBtnLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
  },

  presets: {
    flexDirection: "row",
    gap: Spacing.sm,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  presetChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetChipActive: {
    backgroundColor: Colors.accentMuted,
    borderColor: Colors.accent,
  },
  presetLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  presetLabelActive: { color: Colors.accent },
});
