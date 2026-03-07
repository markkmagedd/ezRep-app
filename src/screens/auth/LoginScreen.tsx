// ─────────────────────────────────────────────
//  ezRep — Login Screen
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

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { signIn, loading } = useAuthStore();

  function validate() {
    let valid = true;
    setEmailError("");
    setPasswordError("");

    if (!email.trim()) {
      setEmailError("Email is required.");
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError("Enter a valid email address.");
      valid = false;
    }
    if (!password) {
      setPasswordError("Password is required.");
      valid = false;
    }
    return valid;
  }

  async function handleSignIn() {
    if (!validate()) return;
    try {
      await signIn(email.trim().toLowerCase(), password);
    } catch (err: any) {
      Alert.alert("Sign In Failed", err?.message ?? "Unknown error");
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
          {/* Logo / Hero */}
          <View style={styles.hero}>
            <Text style={styles.logoText}>ez</Text>
            <Text style={styles.logoAccent}>Rep</Text>
          </View>
          <Text style={styles.tagline}>Train together. Compete harder.</Text>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              error={emailError}
              leftIcon="mail-outline"
            />
            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              error={passwordError}
              leftIcon="lock-closed-outline"
              isPassword
            />

            <Button
              label="Sign In"
              onPress={handleSignIn}
              loading={loading}
              size="lg"
              style={styles.ctaBtn}
            />

            <TouchableOpacity
              style={styles.link}
              onPress={() => navigation.navigate("Register")}
            >
              <Text style={styles.linkText}>
                No account? <Text style={styles.linkAccent}>Create one →</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: Spacing.xl,
  },
  hero: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  logoText: {
    fontSize: 56,
    fontWeight: FontWeight.black,
    color: Colors.textPrimary,
    letterSpacing: -2,
  },
  logoAccent: {
    fontSize: 56,
    fontWeight: FontWeight.black,
    color: Colors.accent,
    letterSpacing: -2,
  },
  tagline: {
    textAlign: "center",
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    marginBottom: Spacing.xxl,
    letterSpacing: 0.3,
  },
  form: { gap: 0 },
  ctaBtn: { marginTop: Spacing.sm },
  link: { alignItems: "center", marginTop: Spacing.lg },
  linkText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  linkAccent: { color: Colors.accent, fontWeight: FontWeight.semibold },
});
