// ─────────────────────────────────────────────
//  ezRep — Profile Screen
//
//  Shows user's stats, lets them edit display name,
//  and provides a sign-out action.
// ─────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  Radius,
  Shadow,
} from "@/constants/theme";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { useAuthStore } from "@/store/authStore";

export default function ProfileScreen() {
  const { profile, loading, updateProfile, signOut } = useAuthStore();

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDisplayName(profile?.display_name ?? "");
  }, [profile?.display_name]);

  async function handleSave() {
    if (!displayName.trim()) return;
    setSaving(true);
    try {
      await updateProfile({ display_name: displayName.trim() });
      setEditing(false);
    } catch {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleSignOut() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: signOut },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.loading}>
          <Text
            style={{
              color: Colors.textSecondary,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            Could not load profile.{"\n"}Make sure Firestore is enabled in
            Firebase Console.
          </Text>
          <TouchableOpacity onPress={signOut}>
            <Text style={{ color: Colors.accent, textAlign: "center" }}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Avatar letter (first char of display name or username)
  const avatarLetter =
    (profile.display_name || profile.username)?.[0]?.toUpperCase() ?? "?";

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.content}>
        {/* ── Avatar + Identity ──────────────────── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>{avatarLetter}</Text>
          </View>

          {editing ? (
            <View style={styles.editRow}>
              <TextInput
                style={styles.displayNameInput}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Display name"
                placeholderTextColor={Colors.textMuted}
                autoFocus
                maxLength={30}
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                style={styles.editActionBtn}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={Colors.accent} />
                ) : (
                  <Ionicons name="checkmark" size={22} color={Colors.accent} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setEditing(false);
                  setDisplayName(profile.display_name ?? "");
                }}
                style={styles.editActionBtn}
              >
                <Ionicons name="close" size={22} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.displayNameRow}
              onPress={() => setEditing(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.displayName}>
                {profile.display_name || profile.username}
              </Text>
              <Ionicons
                name="pencil-outline"
                size={16}
                color={Colors.textMuted}
                style={{ marginLeft: 6 }}
              />
            </TouchableOpacity>
          )}

          <Text style={styles.username}>@{profile.username}</Text>
        </View>

        {/* ── Lifetime Stats ─────────────────────── */}
        <Text style={styles.sectionTitle}>Lifetime Stats</Text>
        <View style={styles.statsGrid}>
          <StatCard
            icon="barbell-outline"
            label="Total Volume"
            value={formatVolume(profile.total_volume_kg ?? 0)}
          />
          <StatCard
            icon="people-outline"
            label="Sessions"
            value={String(profile.total_sessions ?? 0)}
          />
        </View>

        {/* ── Account Details ────────────────────── */}
        <Text style={styles.sectionTitle}>Account</Text>
        <Card variant="default" padding="none" style={styles.menuCard}>
          <MenuItem
            icon="person-outline"
            label="Username"
            detail={`@${profile.username}`}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="calendar-outline"
            label="Member since"
            detail={formatDate(profile.created_at)}
          />
        </Card>

        {/* ── Danger Zone ───────────────────────── */}
        <Button
          label="Sign Out"
          onPress={handleSignOut}
          variant="danger"
          size="lg"
          style={{ marginTop: Spacing.md }}
        />

        <Text style={styles.versionTag}>ezRep • v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

// ── Helper sub-components ──────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <Card variant="accent" padding="lg" style={styles.statCard}>
      <Ionicons name={icon} size={28} color={Colors.accent} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

function MenuItem({
  icon,
  label,
  detail,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  detail: string;
}) {
  return (
    <View style={styles.menuItem}>
      <Ionicons
        name={icon}
        size={20}
        color={Colors.textMuted}
        style={{ width: 28 }}
      />
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.menuDetail} numberOfLines={1}>
        {detail}
      </Text>
    </View>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatVolume(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}t`;
  return `${kg.toFixed(0)}kg`;
}

function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  loading: { flex: 1, alignItems: "center", justifyContent: "center" },

  content: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: "space-between",
  },

  // Avatar
  avatarSection: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.accentMuted,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
    ...Shadow.accent,
  },
  avatarLetter: {
    color: Colors.accent,
    fontSize: 40,
    fontWeight: FontWeight.black,
    lineHeight: 46,
  },
  displayNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  displayName: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },
  username: {
    color: Colors.textMuted,
    fontSize: FontSize.md,
    marginTop: 4,
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: 4,
  },
  displayNameInput: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.accent,
    minWidth: 140,
    maxWidth: 220,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  editActionBtn: {
    padding: 6,
  },

  // Section heading
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },

  // Stats grid
  statsGrid: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  statValue: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Menu card
  menuCard: { overflow: "hidden" },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  menuLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    flex: 1,
  },
  menuDetail: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    maxWidth: "50%",
    textAlign: "right",
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },

  versionTag: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    textAlign: "center",
    marginTop: Spacing.xl,
  },
});
