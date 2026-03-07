// ─────────────────────────────────────────────
//  ezRep — Join Session Screen
//  Enter a 6-char code to join a friend's session
// ─────────────────────────────────────────────

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  Radius,
} from "@/constants/theme";
import { Button } from "@/components/common/Button";
import { useSessionStore } from "@/store/sessionStore";
import type { SessionStackParamList } from "@/types";

type Props = NativeStackScreenProps<SessionStackParamList, "JoinSession">;

const CODE_LENGTH = 6;

export default function JoinSessionScreen({ navigation, route }: Props) {
  const prefilledCode = route.params?.code ?? "";
  const [code, setCode] = useState(prefilledCode.toUpperCase());
  const inputRef = useRef<TextInput>(null);
  const { joinSession, isLoading } = useSessionStore();

  useEffect(() => {
    // Auto-paste if clipboard looks like a valid code
    (async () => {
      if (prefilledCode) return;
      const clip = await Clipboard.getStringAsync();
      if (/^[A-Z0-9]{6}$/.test(clip.trim())) {
        setCode(clip.trim());
      }
    })();
  }, []);

  async function handleJoin() {
    if (code.length !== CODE_LENGTH) {
      Alert.alert(
        "Invalid Code",
        `Code must be exactly ${CODE_LENGTH} characters.`,
      );
      return;
    }
    try {
      const session = await joinSession(code);
      navigation.replace("SessionLobby", { sessionId: session.id });
    } catch (err: any) {
      Alert.alert("Could Not Join", err?.message ?? "Session not found.");
    }
  }

  function handleCodeChange(text: string) {
    setCode(
      text
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, CODE_LENGTH),
    );
  }

  const chars = code
    .split("")
    .concat(Array(CODE_LENGTH).fill(""))
    .slice(0, CODE_LENGTH);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: "center" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Join Session</Text>
          <Text style={styles.subtitle}>
            Enter the 6-character invite code shared by the session host.
          </Text>

          {/* Hidden real input for keyboard */}
          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            value={code}
            onChangeText={handleCodeChange}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={CODE_LENGTH}
            keyboardType="default"
            returnKeyType="join"
            onSubmitEditing={handleJoin}
          />

          {/* Code display boxes */}
          <View
            style={styles.codeRow}
            // Tap anywhere on the boxes to focus the hidden input
            onStartShouldSetResponder={() => {
              inputRef.current?.focus();
              return true;
            }}
          >
            {chars.map((ch, i) => (
              <View
                key={i}
                style={[
                  styles.codeBox,
                  code.length === i && styles.codeBoxActive,
                  ch !== "" && styles.codeBoxFilled,
                ]}
              >
                <Text style={styles.codeChar}>{ch}</Text>
              </View>
            ))}
          </View>

          <Button
            label={isLoading ? "Joining…" : "Join Session"}
            onPress={handleJoin}
            loading={isLoading}
            disabled={code.length < CODE_LENGTH}
            size="lg"
            style={{ marginTop: Spacing.xl }}
          />

          <Button
            label="Paste Code from Clipboard"
            onPress={async () => {
              const clip = await Clipboard.getStringAsync();
              setCode(clip.trim().toUpperCase().slice(0, CODE_LENGTH));
            }}
            variant="ghost"
            size="md"
            style={{ marginTop: Spacing.sm }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: { padding: Spacing.xl },

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
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },

  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
  },

  codeRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    justifyContent: "center",
  },
  codeBox: {
    width: 46,
    height: 60,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgCard,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  codeBoxActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentMuted,
  },
  codeBoxFilled: {
    borderColor: Colors.textSecondary,
  },
  codeChar: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
    letterSpacing: 0,
  },
});
