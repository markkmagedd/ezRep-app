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
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
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
import { Avatar } from "@/components/common/Avatar";
import { PhotoEditor } from "@/components/profile/PhotoEditor";
import { useAuthStore } from "@/store/authStore";
import type { ProfileStackParamList } from "@/types";

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const {
    profile,
    loading,
    photoUploadPending,
    updateProfile,
    updateProfilePhoto,
    removeProfilePhoto,
    signOut,
  } = useAuthStore();

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setDisplayName(profile?.display_name ?? "");
  }, [profile?.display_name]);

  useEffect(() => {
    if (!toastMessage) return;

    const timeout = setTimeout(() => setToastMessage(null), 3200);
    return () => clearTimeout(timeout);
  }, [toastMessage]);

  function showToast(message: string) {
    setToastMessage(message);
  }

  async function handleSave() {
    if (!displayName.trim()) return;
    setSaving(true);
    try {
      await updateProfile({ display_name: displayName.trim() });
      setEditing(false);
    } catch {
      showToast("Failed to update your display name. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleProfilePhotoSelected(localUri: string) {
    try {
      await updateProfilePhoto(localUri);
      showToast("Profile photo updated.");
    } catch {
      showToast("Couldn't upload your profile photo. Check your connection and try again.");
    }
  }

  async function handleProfilePhotoRemoved() {
    try {
      await removeProfilePhoto();
      showToast("Profile photo removed.");
    } catch {
      showToast("Couldn't remove your profile photo. Please try again.");
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
          <PhotoEditor
            currentPhotoUrl={profile.avatar_url}
            uploading={photoUploadPending}
            onPhotoSelected={handleProfilePhotoSelected}
            onPhotoRemoved={handleProfilePhotoRemoved}
            onError={showToast}
          >
            <View style={styles.avatarEditor}>
              <Avatar
                uri={profile.avatar_url}
                fallbackLabel={avatarLetter}
                size={96}
                loading={photoUploadPending}
                editable
              />
              <Text style={styles.avatarHint}>
                {photoUploadPending
                  ? "Uploading profile photo..."
                  : "Tap to change profile photo"}
              </Text>
            </View>
          </PhotoEditor>

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

        <TouchableOpacity
          onPress={() => navigation.navigate("PRSpotlight")}
          activeOpacity={0.7}
        >
          <Card variant="accent" padding="md" style={styles.prSpotlightLink}>
            <View style={styles.prSpotlightContent}>
              <View style={styles.prSpotlightIcon}>
                <Ionicons name="trophy" size={20} color={Colors.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.prSpotlightTitle}>Heaviest Lifts</Text>
                <Text style={styles.prSpotlightSub}>View all your personal records</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
            </View>
          </Card>
        </TouchableOpacity>

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
      {toastMessage ? (
        <View style={styles.toast}>
          <Ionicons name="information-circle" size={18} color={Colors.accent} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}
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
  avatarEditor: {
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  avatarHint: {
    marginTop: Spacing.sm,
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
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
  toast: {
    position: "absolute",
    left: Spacing.md,
    right: Spacing.md,
    bottom: Spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.accentMuted,
    backgroundColor: Colors.bgSurface,
    ...Shadow.md,
  },
  toastText: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
  },

  // PR Spotlight Link
  prSpotlightLink: {
    marginTop: Spacing.md,
    borderColor: Colors.warning + "33",
    borderWidth: 1,
  },
  prSpotlightContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  prSpotlightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.warning + "11",
    alignItems: "center",
    justifyContent: "center",
  },
  prSpotlightTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  prSpotlightSub: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
  },
});
