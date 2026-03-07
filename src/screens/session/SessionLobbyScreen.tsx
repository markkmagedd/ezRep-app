// ─────────────────────────────────────────────
//  ezRep — Session Lobby Screen
//  Pre-workout waiting room: participants ready up, host starts
// ─────────────────────────────────────────────

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Animated,
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
  Shadow,
} from "@/constants/theme";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { useSessionStore } from "@/store/sessionStore";
import { useAuthStore } from "@/store/authStore";
import type { SessionStackParamList } from "@/types";

type Props = NativeStackScreenProps<SessionStackParamList, "SessionLobby">;

export default function SessionLobbyScreen({ navigation, route }: Props) {
  const { sessionId } = route.params;
  const {
    session,
    participants,
    exercises,
    isHost,
    setReady,
    startSession,
    leaveSession,
  } = useSessionStore();
  const { profile } = useAuthStore();

  // Pulse animation for the "Waiting…" indicator
  const pulseAnim = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  // Navigate to active session once it starts
  useEffect(() => {
    if (session?.status === "active") {
      navigation.replace("ActiveSession", { sessionId });
    }
  }, [session?.status]);

  const myParticipant = participants.find((p) => p.user_id === profile?.id);
  const isReady = myParticipant?.is_ready ?? false;
  const allReady =
    participants.length > 0 &&
    participants.every((p) => p.is_ready || p.left_at !== null);

  async function handleShare() {
    await Share.share({
      message: `Join my ezRep Session! Code: ${session?.code}\n\nOpen ezRep and tap Join Session.`,
    });
  }

  async function handleLeave() {
    Alert.alert("Leave Session?", "You will exit the lobby.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          await leaveSession();
          navigation.goBack();
        },
      },
    ]);
  }

  async function handleStart() {
    if (!allReady) {
      Alert.alert(
        "Not Everyone is Ready",
        "Wait for all participants to hit Ready, or start anyway.",
        [
          { text: "Wait", style: "cancel" },
          { text: "Start Anyway", onPress: startSession },
        ],
      );
    } else {
      startSession();
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLeave} style={styles.leaveBtn}>
          <Ionicons name="exit-outline" size={22} color={Colors.danger} />
          <Text style={styles.leaveText}>Leave</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lobby</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Ionicons name="share-outline" size={22} color={Colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Invite code */}
        <TouchableOpacity style={styles.codeCard} onPress={handleShare}>
          <Text style={styles.codeLabel}>Invite Code</Text>
          <Text style={styles.codeValue}>{session?.code}</Text>
          <Text style={styles.codeTap}>Tap to share</Text>
        </TouchableOpacity>

        {/* Participants */}
        <Text style={styles.sectionTitle}>
          Participants ({participants.filter((p) => !p.left_at).length})
        </Text>
        {participants
          .filter((p) => !p.left_at)
          .map((p) => {
            const color = Colors.participants[p.color_index] ?? Colors.accent;
            return (
              <Card key={p.id} style={styles.participantRow} padding="md">
                <View style={[styles.colorDot, { backgroundColor: color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.participantName}>
                    {p.profile.display_name}
                  </Text>
                  <Text style={styles.participantUsername}>
                    @{p.profile.username}
                  </Text>
                </View>
                {session?.host_id === p.user_id && (
                  <View style={styles.hostBadge}>
                    <Text style={styles.hostBadgeText}>Host</Text>
                  </View>
                )}
                {p.is_ready ? (
                  <View style={styles.readyBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={Colors.success}
                    />
                    <Text style={styles.readyText}>Ready</Text>
                  </View>
                ) : (
                  <Animated.View style={{ opacity: pulseAnim }}>
                    <Text style={styles.waitingText}>Waiting…</Text>
                  </Animated.View>
                )}
              </Card>
            );
          })}

        {/* Exercise queue preview */}
        <Text style={styles.sectionTitle}>
          Exercise Queue ({exercises.length})
        </Text>
        {exercises.map((ex, i) => (
          <View key={ex.id} style={styles.queuePreviewRow}>
            <Text style={styles.queueIndex}>{i + 1}</Text>
            <Text style={styles.queueExName}>{ex.exercise_name}</Text>
            <Text style={styles.queueExMeta}>
              {ex.target_sets} × {ex.target_reps}
            </Text>
          </View>
        ))}

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Sticky bottom actions */}
      <View style={styles.footer}>
        {!isReady && (
          <Button
            label="✓  I'm Ready"
            onPress={setReady}
            variant="primary"
            size="lg"
          />
        )}
        {isReady && !isHost && (
          <Card variant="flat" style={styles.waitingCard}>
            <Ionicons
              name="hourglass-outline"
              size={20}
              color={Colors.textMuted}
            />
            <Text style={styles.waitingFooterText}>
              Waiting for host to start…
            </Text>
          </Card>
        )}
        {isHost && (
          <Button
            label={
              allReady
                ? "🚀  Start Session"
                : "Start Session (not everyone ready)"
            }
            onPress={handleStart}
            variant={allReady ? "primary" : "ghost"}
            size="lg"
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  leaveBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  leaveText: { color: Colors.danger, fontSize: FontSize.sm },
  shareBtn: { padding: 4 },

  scroll: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  codeCard: {
    backgroundColor: Colors.accentMuted,
    borderRadius: Radius.xl,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: "center",
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.xl,
    ...Shadow.accent,
  },
  codeLabel: {
    color: Colors.accentDim,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
  },
  codeValue: {
    color: Colors.accent,
    fontSize: 48,
    fontWeight: FontWeight.black,
    letterSpacing: 12,
  },
  codeTap: {
    color: Colors.accentDim,
    fontSize: FontSize.xs,
    marginTop: Spacing.sm,
  },

  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },

  participantRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  participantName: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  participantUsername: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
  },
  hostBadge: {
    backgroundColor: Colors.accentMuted,
    borderRadius: Radius.pill,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginRight: 4,
  },
  hostBadgeText: {
    color: Colors.accent,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  readyBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  readyText: {
    color: Colors.success,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  waitingText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
  },

  queuePreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  queueIndex: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    width: 20,
    textAlign: "center",
  },
  queueExName: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  queueExMeta: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
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
  },
  waitingCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  waitingFooterText: {
    color: Colors.textMuted,
    fontSize: FontSize.md,
  },
});
