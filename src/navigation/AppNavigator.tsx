// ─────────────────────────────────────────────
//  ezRep — App Navigator
//  Bottom tab bar + nested stack navigators
// ─────────────────────────────────────────────

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontSize } from "@/constants/theme";
import type {
  AppTabParamList,
  HomeStackParamList,
  SessionStackParamList,
} from "@/types";

// Screens
import HomeScreen from "@/screens/home/HomeScreen";
import WorkoutLoggerScreen from "@/screens/workout/WorkoutLoggerScreen";
import ExerciseSelectorScreen from "@/screens/workout/ExerciseSelectorScreen";
import SessionHubScreen from "@/screens/session/SessionHubScreen";
import CreateSessionScreen from "@/screens/session/CreateSessionScreen";
import JoinSessionScreen from "@/screens/session/JoinSessionScreen";
import SessionLobbyScreen from "@/screens/session/SessionLobbyScreen";
import ActiveSessionScreen from "@/screens/session/ActiveSessionScreen";
import PostSessionStatsScreen from "@/screens/session/PostSessionStatsScreen";
import ProfileScreen from "@/screens/profile/ProfileScreen";

// ── Stack navigators ────────────────────────────────────────────────────────

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={stackOptions}>
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "ezRep" }}
      />
      <HomeStack.Screen
        name="WorkoutLogger"
        component={WorkoutLoggerScreen}
        options={{ title: "Workout" }}
      />
      <HomeStack.Screen
        name="ExerciseSelector"
        component={ExerciseSelectorScreen}
        options={{ title: "Add Exercise" }}
      />
    </HomeStack.Navigator>
  );
}

const SessionStack = createNativeStackNavigator<SessionStackParamList>();
function SessionStackNavigator() {
  return (
    <SessionStack.Navigator screenOptions={stackOptions}>
      <SessionStack.Screen
        name="SessionHub"
        component={SessionHubScreen}
        options={{ title: "Session" }}
      />
      <SessionStack.Screen
        name="CreateSession"
        component={CreateSessionScreen}
        options={{ title: "Create Session" }}
      />
      <SessionStack.Screen
        name="JoinSession"
        component={JoinSessionScreen}
        options={{ title: "Join Session" }}
      />
      <SessionStack.Screen
        name="SessionLobby"
        component={SessionLobbyScreen}
        options={{ title: "Lobby", headerShown: false }}
      />
      <SessionStack.Screen
        name="ActiveSession"
        component={ActiveSessionScreen}
        options={{ title: "Session", headerShown: false }}
      />
      <SessionStack.Screen
        name="PostSessionStats"
        component={PostSessionStatsScreen}
        options={{ title: "Results", headerShown: false }}
      />
    </SessionStack.Navigator>
  );
}

// ── Tab navigator ───────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<AppTabParamList>();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, focused }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            HomeTab: focused ? "home" : "home-outline",
            SessionTab: focused ? "people" : "people-outline",
            WorkoutTab: focused ? "barbell" : "barbell-outline",
            ProfileTab: focused ? "person" : "person-outline",
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarBackground: () => <View style={styles.tabBarBg} />,
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ title: "Home" }}
      />
      <Tab.Screen
        name="SessionTab"
        component={SessionStackNavigator}
        options={{ title: "Session" }}
      />
      <Tab.Screen
        name="WorkoutTab"
        component={WorkoutLoggerScreen}
        options={{ title: "Workout" }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  );
}

// ── Shared stack screen options ──────────────────────────────────────────────

const stackOptions = {
  headerStyle: { backgroundColor: Colors.bgCard },
  headerTintColor: Colors.textPrimary,
  headerTitleStyle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: "700" as const,
  },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: Colors.bg },
  animation: "slide_from_right" as const,
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.bgCard,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: Platform.OS === "ios" ? 80 : 60,
    paddingBottom: Platform.OS === "ios" ? 20 : 8,
    paddingTop: 8,
  },
  tabBarBg: {
    flex: 1,
    backgroundColor: Colors.bgCard,
  },
  tabLabel: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    marginTop: 2,
  },
});
