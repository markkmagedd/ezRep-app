// ─────────────────────────────────────────────
//  ezRep — Register Screen
// ─────────────────────────────────────────────

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Colors, FontSize, FontWeight, Spacing } from "@/constants/theme";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { useAuthStore } from "@/store/authStore";
import type { AuthStackParamList } from "@/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signUp, loading } = useAuthStore();

  function validate() {
    const e: Record<string, string> = {};
    if (!username.trim()) {
      e.username = "Username is required.";
    } else if (username.length < 3) {
      e.username = "At least 3 characters.";
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      e.username = "Letters, numbers, and _ only.";
    }
    if (!email.trim()) {
      e.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      e.email = "Enter a valid email.";
    }
    if (!password) {
      e.password = "Password is required.";
    } else if (password.length < 8) {
      e.password = "At least 8 characters.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSignUp() {
    if (!validate()) return;
    try {
      await signUp(email.trim().toLowerCase(), password, username.trim());
    } catch (err: any) {
      Alert.alert("Sign Up Failed", err?.message ?? "Please try again.");
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.back}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Build your profile and start training with friends.
          </Text>

          <Input
            label="Username"
            placeholder="e.g. iron_mike"
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            onChangeText={setUsername}
            error={errors.username}
            leftIcon="at-outline"
            hint="This is your public identity in Sessions."
          />
          <Input
            label="Email"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            leftIcon="mail-outline"
          />
          <Input
            label="Password"
            placeholder="8+ characters"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            leftIcon="lock-closed-outline"
            isPassword
          />

          <Button
            label="Create Account"
            onPress={handleSignUp}
            loading={loading}
            size="lg"
            style={styles.ctaBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: {
    flexGrow: 1,
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  back: { marginBottom: Spacing.lg },
  backText: {
    color: Colors.accent,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.hero,
    fontWeight: FontWeight.black,
    letterSpacing: -1,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  ctaBtn: { marginTop: Spacing.sm },
});
