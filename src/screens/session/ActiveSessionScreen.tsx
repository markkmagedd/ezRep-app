// ─────────────────────────────────────────────
//  ezRep — Active Session Screen ⚡
//
//  The real-time workout room. All participants see:
//   • Current exercise + target sets/reps
//   • Each other's logged sets (live feed, colour-coded)
//   • Their own set logging inputs
//   • Progress through the exercise queue
//
//  Real-time flow:
//    User logs a set → sessionStore.logSet() →
//      INSERT to session_sets table +
//      Broadcast "set_logged" event on Realtime channel →
//        All participants' _applyBroadcast() patches their local allSets →
//          UI re-renders instantly
// ─────────────────────────────────────────────

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
import { RestTimer } from "@/components/workout/RestTimer";
import { useSessionStore } from "@/store/sessionStore";
import { useAuthStore } from "@/store/authStore";
import type { SessionStackParamList, SessionSet } from "@/types";

type Props = NativeStackScreenProps<SessionStackParamList, "ActiveSession">;

export default function ActiveSessionScreen({ navigation, route }: Props) {
  const { sessionId } = route.params;
  const {
    session,
    participants,
    exercises,
    allSets,
    currentExerciseIndex,
    isHost,
    logSet,
    advanceExercise,
    leaveSession,
    endSession,
  } = useSessionStore();
  const { profile } = useAuthStore();

  // Local set-logging form state
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  // Elapsed timer
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = session?.started_at
      ? new Date(session.started_at).getTime()
      : Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [session?.started_at]);

  // Navigate to post-session stats when session ends
  useEffect(() => {
    if (session?.status === "completed") {
      navigation.replace("PostSessionStats", { sessionId });
    }
  }, [session?.status]);

  const currentExercise = exercises[currentExerciseIndex];

  // Sets logged for the current exercise, per participant
  const setsForCurrentEx = allSets.filter(
    (s) => s.session_exercise_id === currentExercise?.id,
  );

  // My sets for the current exercise
  const mySets = setsForCurrentEx.filter((s) => s.user_id === profile?.id);

  // Whether all live participants have hit the target sets for this exercise
  const liveParticipants = participants.filter((p) => !p.left_at);
  const allDone =
    currentExercise &&
    liveParticipants.every(
      (p) =>
        setsForCurrentEx.filter((s) => s.user_id === p.user_id).length >=
        currentExercise.target_sets,
    );

  // New-set animation
  const flashAnim = useRef(new Animated.Value(0)).current;
  function flashFeed() {
    Animated.sequence([
      Animated.timing(flashAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }

  // Watch for new sets in allSets and flash the feed
  const prevSetsCount = useRef(allSets.length);
  useEffect(() => {
    if (allSets.length > prevSetsCount.current) {
      flashFeed();
      prevSetsCount.current = allSets.length;
    }
  }, [allSets.length]);

  async function handleLogSet() {
    const w = parseFloat(weight);
    const r = parseInt(reps, 10);
    if (!w || !r || w <= 0 || r <= 0) {
      Alert.alert("Invalid Input", "Enter weight and reps greater than 0.");
      return;
    }
    if (!currentExercise) return;

    setIsLogging(true);
    try {
      await logSet(currentExercise.id, r, w);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setWeight("");
      setReps("");
      setShowRestTimer(true);
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Failed to log set.");
    } finally {
      setIsLogging(false);
    }
  }

  async function handleAdvance() {
    const isLast = currentExerciseIndex >= exercises.length - 1;
    Alert.alert(
      isLast ? "End Session?" : "Next Exercise?",
      isLast
        ? "Move to post-workout stats."
        : `Move everyone to exercise ${currentExerciseIndex + 2}: ${
            exercises[currentExerciseIndex + 1]?.exercise_name
          }`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: isLast ? "End Session" : "Continue →",
          onPress: advanceExercise,
        },
      ],
    );
  }

  const formatElapsed = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!currentExercise) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={60}
      >
        {/* ── Top bar ──────────────────────────────── */}
        <View style={styles.topBar}>
          <View style={styles.topLeft}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            <Text style={styles.timer}>{formatElapsed(elapsed)}</Text>
          </View>

          {/* Exercise progress dots */}
          <View style={styles.progressDots}>
            {exercises.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === currentExerciseIndex && styles.dotActive,
                  i < currentExerciseIndex && styles.dotDone,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() =>
              Alert.alert("Session", undefined, [
                isHost
                  ? {
                      text: "End Session for All",
                      style: "destructive",
                      onPress: endSession,
                    }
                  : {
                      text: "Leave Session",
                      style: "destructive",
                      onPress: leaveSession,
                    },
                { text: "Cancel", style: "cancel" },
              ])
            }
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={22}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Current Exercise Card ──────────────── */}
          <Card variant="accent" style={styles.exCard} padding="lg">
            <View style={styles.exCardTop}>
              <Text style={styles.exIndexLabel}>
                Exercise {currentExerciseIndex + 1} of {exercises.length}
              </Text>
              {isHost && (
                <TouchableOpacity
                  onPress={handleAdvance}
                  style={styles.advanceBtn}
                >
                  <Text style={styles.advanceBtnText}>
                    {currentExerciseIndex === exercises.length - 1
                      ? "End Session"
                      : "Next →"}
                  </Text>
                  <Ionicons
                    name={
                      currentExerciseIndex === exercises.length - 1
                        ? "flag-outline"
                        : "arrow-forward-outline"
                    }
                    size={16}
                    color={Colors.accent}
                  />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.exName}>{currentExercise.exercise_name}</Text>
            <Text style={styles.exTarget}>
              {currentExercise.target_sets} sets × {currentExercise.target_reps}{" "}
              reps
            </Text>
            {allDone && (
              <View style={styles.allDoneBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={Colors.success}
                />
                <Text style={styles.allDoneText}>Everyone finished!</Text>
              </View>
            )}
          </Card>

          {/* ── Participant Progress ───────────────── */}
          <Text style={styles.sectionLabel}>Live Progress</Text>
          <Animated.View
            style={{
              opacity: flashAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.6],
              }),
            }}
          >
            {liveParticipants.map((p) => {
              const color = Colors.participants[p.color_index] ?? Colors.accent;
              const pSets = setsForCurrentEx.filter(
                (s) => s.user_id === p.user_id,
              );
              const pVolume = pSets.reduce(
                (a, s) => a + s.reps * s.weight_kg,
                0,
              );
              const targetSets = currentExercise.target_sets;

              return (
                <View key={p.id} style={styles.participantBlock}>
                  <View style={styles.participantHeader}>
                    <View
                      style={[styles.colorBar, { backgroundColor: color }]}
                    />
                    <Text style={[styles.participantName, { color }]}>
                      {p.profile.display_name}
                    </Text>
                    <Text style={styles.participantVolume}>
                      {pVolume.toFixed(0)} kg
                    </Text>
                    <Text style={styles.setsProgress}>
                      {pSets.length}/{targetSets}
                    </Text>
                  </View>

                  {/* Set pills */}
                  <View style={styles.setPills}>
                    {Array.from({ length: targetSets }).map((_, i) => {
                      const s = pSets[i];
                      return (
                        <SetPill
                          key={i}
                          set={s ?? null}
                          color={color}
                          isEmpty={!s}
                        />
                      );
                    })}
                    {/* Extra sets beyond target */}
                    {pSets.slice(targetSets).map((s, i) => (
                      <SetPill
                        key={`extra_${i}`}
                        set={s}
                        color={color}
                        isEmpty={false}
                      />
                    ))}
                  </View>
                </View>
              );
            })}
          </Animated.View>

          {/* ── My Set Logger ─────────────────────── */}
          <Text style={styles.sectionLabel}>Log My Set</Text>
          <Card style={styles.loggerCard} padding="lg">
            <Text style={styles.loggerHint}>
              Set {mySets.length + 1}
              {mySets.length > 0 && (
                <Text style={styles.loggerPrev}>
                  {" "}
                  (last: {mySets[mySets.length - 1].weight_kg}kg ×{" "}
                  {mySets[mySets.length - 1].reps})
                </Text>
              )}
            </Text>

            <View style={styles.loggerInputs}>
              {/* Weight */}
              <View style={styles.loggerInputGroup}>
                <Text style={styles.loggerInputLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.loggerInput}
                  keyboardType="decimal-pad"
                  placeholder={
                    mySets[mySets.length - 1]?.weight_kg?.toString() ?? "0"
                  }
                  placeholderTextColor={Colors.textMuted}
                  value={weight}
                  onChangeText={setWeight}
                  returnKeyType="next"
                  selectionColor={Colors.accent}
                />
              </View>

              <Text style={styles.loggerSeparator}>×</Text>

              {/* Reps */}
              <View style={styles.loggerInputGroup}>
                <Text style={styles.loggerInputLabel}>Reps</Text>
                <TextInput
                  style={styles.loggerInput}
                  keyboardType="number-pad"
                  placeholder={
                    mySets[mySets.length - 1]?.reps?.toString() ?? "0"
                  }
                  placeholderTextColor={Colors.textMuted}
                  value={reps}
                  onChangeText={setReps}
                  returnKeyType="done"
                  onSubmitEditing={handleLogSet}
                  selectionColor={Colors.accent}
                />
              </View>

              {/* Log button */}
              <TouchableOpacity
                style={[
                  styles.logBtn,
                  (!weight || !reps || isLogging) && { opacity: 0.4 },
                ]}
                onPress={handleLogSet}
                disabled={!weight || !reps || isLogging}
              >
                <Ionicons name="checkmark" size={28} color={Colors.bg} />
              </TouchableOpacity>
            </View>
          </Card>

          {/* Tap to open rest timer */}
          <TouchableOpacity
            style={styles.restTimerTrigger}
            onPress={() => setShowRestTimer(true)}
          >
            <Ionicons name="timer-outline" size={18} color={Colors.textMuted} />
            <Text style={styles.restTimerText}>Open Rest Timer</Text>
          </TouchableOpacity>

          <View style={{ height: Spacing.xxl }} />
        </ScrollView>

        {/* Rest Timer Modal */}
        <Modal
          visible={showRestTimer}
          animationType="slide"
          transparent
          onRequestClose={() => setShowRestTimer(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowRestTimer(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.modalSheet}
              onPress={(e) => e.stopPropagation()}
            >
              <RestTimer onDismiss={() => setShowRestTimer(false)} />
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── SetPill ────────────────────────────────────────────────────────────────────
// Compact chip showing one logged set: "100×8" with the participant's colour
function SetPill({
  set,
  color,
  isEmpty,
}: {
  set: SessionSet | null;
  color: string;
  isEmpty: boolean;
}) {
  if (isEmpty) {
    return <View style={[styles.setPill, styles.setPillEmpty]} />;
  }
  return (
    <View
      style={[
        styles.setPill,
        { borderColor: color, backgroundColor: color + "22" },
      ]}
    >
      <Text style={[styles.setPillText, { color }]}>
        {set?.weight_kg}×{set?.reps}
      </Text>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  topLeft: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.danger + "22",
    borderRadius: Radius.pill,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.danger,
  },
  liveText: {
    color: Colors.danger,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 1,
  },
  timer: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontVariant: ["tabular-nums"],
  },
  progressDots: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.accent,
    width: 20,
    borderRadius: 4,
  },
  dotDone: { backgroundColor: Colors.accentDim },
  menuBtn: { padding: 4 },

  scroll: { padding: Spacing.md },

  exCard: { marginBottom: Spacing.lg },
  exCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  exIndexLabel: {
    color: Colors.accentDim,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  advanceBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  advanceBtnText: {
    color: Colors.accent,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  exName: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  exTarget: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
  },
  allDoneBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: Spacing.sm,
    backgroundColor: Colors.success + "22",
    borderRadius: Radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
  },
  allDoneText: {
    color: Colors.success,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },

  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },

  participantBlock: {
    marginBottom: Spacing.md,
  },
  participantHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: 6,
  },
  colorBar: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  participantName: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  participantVolume: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  setsProgress: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    minWidth: 28,
    textAlign: "right",
  },
  setPills: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    paddingLeft: Spacing.md + 4,
  },
  setPill: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 60,
    alignItems: "center",
  },
  setPillEmpty: {
    borderColor: Colors.border,
    backgroundColor: Colors.bgSurface,
    opacity: 0.5,
    minWidth: 60,
    height: 28,
  },
  setPillText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    fontVariant: ["tabular-nums"],
  },

  loggerCard: { marginBottom: Spacing.sm },
  loggerHint: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.md,
  },
  loggerPrev: {
    color: Colors.textMuted,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.sm,
  },
  loggerInputs: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  loggerInputGroup: { flex: 1, alignItems: "center", gap: 4 },
  loggerInputLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  loggerInput: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.accentDim,
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: FontWeight.black,
    textAlign: "center",
    paddingVertical: Spacing.sm,
    width: "100%",
    height: 64,
  },
  loggerSeparator: {
    color: Colors.textMuted,
    fontSize: 28,
    fontWeight: FontWeight.black,
    paddingHorizontal: 4,
    marginTop: 20,
  },
  logBtn: {
    width: 64,
    height: 64,
    borderRadius: Radius.md,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    ...Shadow.accent,
  },

  restTimerTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: Spacing.sm,
  },
  restTimerText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    margin: Spacing.md,
    marginBottom: Spacing.xl,
  },
});
