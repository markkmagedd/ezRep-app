// ─────────────────────────────────────────────
//  ezRep — Session Hub Screen
//  Entry point: create or join a session
// ─────────────────────────────────────────────

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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
import { Card } from "@/components/common/Card";
import type { SessionStackParamList } from "@/types";

type Props = NativeStackScreenProps<SessionStackParamList, "SessionHub">;

export default function SessionHubScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Sessions</Text>
          <Text style={styles.heroSub}>
            Train together, compete harder.{"\n"}Real-time shared workouts.
          </Text>
        </View>

        {/* Action cards */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate("CreateSession")}
        >
          <Card variant="accent" style={styles.bigCard}>
            <View
              style={[
                styles.bigCardIcon,
                { backgroundColor: Colors.accentMuted },
              ]}
            >
              <Ionicons name="add-circle" size={40} color={Colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bigCardTitle}>Create Session</Text>
              <Text style={styles.bigCardSub}>
                Build the workout queue, invite friends, and host the party.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={Colors.accent} />
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate("JoinSession", {})}
          style={{ marginTop: Spacing.md }}
        >
          <Card style={styles.bigCard}>
            <View
              style={[
                styles.bigCardIcon,
                { backgroundColor: Colors.cyanDim + "22" },
              ]}
            >
              <Ionicons name="enter-outline" size={40} color={Colors.cyan} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bigCardTitle}>Join Session</Text>
              <Text style={styles.bigCardSub}>
                Enter a 6-character invite code to join a friend's session.
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={Colors.textMuted}
            />
          </Card>
        </TouchableOpacity>

        {/* Info section */}
        <Text style={styles.sectionTitle}>How it works</Text>
        {HOW_IT_WORKS.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const HOW_IT_WORKS = [
  {
    title: "Create or Join",
    desc: "One person creates the session and picks the exercises. Others join via code.",
  },
  {
    title: "Lobby & Ready Up",
    desc: "All participants hit Ready. The host starts the session when everyone is in.",
  },
  {
    title: "Train Together",
    desc: "Work through the exercise queue. Log your own reps and weight — see everyone else's live.",
  },
  {
    title: "Post-Session Stats",
    desc: "Head-to-head breakdown: volume, reps, heaviest set, and who trained hardest.",
  },
];

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  hero: { marginTop: Spacing.sm, marginBottom: Spacing.xl },
  heroTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.hero,
    fontWeight: FontWeight.black,
    letterSpacing: -1,
  },
  heroSub: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    marginTop: Spacing.sm,
    lineHeight: 22,
  },

  bigCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
  },
  bigCardIcon: {
    width: 64,
    height: 64,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  bigCardTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginBottom: 4,
  },
  bigCardSub: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    lineHeight: 18,
  },

  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },

  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accentMuted,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  stepNumText: {
    color: Colors.accent,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.black,
  },
  stepTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    marginBottom: 2,
  },
  stepDesc: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    lineHeight: 18,
  },
});
