// ─────────────────────────────────────────────
//  ezRep — App Navigator
//  Bottom tab bar + nested stack navigators
// ─────────────────────────────────────────────

import React, { useState, useEffect, useRef } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontSize, FontWeight, Radius, Spacing } from "@/constants/theme";
import { useWorkoutStore } from "@/store/workoutStore";
import type {
  AppTabParamList,
  HomeStackParamList,
  SessionStackParamList,
  WorkoutStackParamList,
} from "@/types";

// Screens
import HomeScreen from "@/screens/home/HomeScreen";
import WorkoutLoggerScreen from "@/screens/workout/WorkoutLoggerScreen";
import ExerciseSelectorScreen from "@/screens/workout/ExerciseSelectorScreen";
import ExerciseDetailScreen from "@/screens/workout/ExerciseDetailScreen";
import RoutineListScreen from "@/screens/routine/RoutineListScreen";
import CreateRoutineScreen from "@/screens/routine/CreateRoutineScreen";
import RoutineDetailScreen from "@/screens/routine/RoutineDetailScreen";
import SessionHubScreen from "@/screens/session/SessionHubScreen";
import CreateSessionScreen from "@/screens/session/CreateSessionScreen";
import JoinSessionScreen from "@/screens/session/JoinSessionScreen";
import SessionLobbyScreen from "@/screens/session/SessionLobbyScreen";
import ActiveSessionScreen from "@/screens/session/ActiveSessionScreen";
import PostSessionStatsScreen from "@/screens/session/PostSessionStatsScreen";
import SessionHistoryScreen from "@/screens/session/SessionHistoryScreen";
import ProfileScreen from "@/screens/profile/ProfileScreen";
import YearlyConsistencyScreen from "@/screens/home/YearlyConsistencyScreen";

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
        options={{ title: "Workout", animation: "slide_from_bottom" }}
      />
      <HomeStack.Screen
        name="ExerciseSelector"
        component={ExerciseSelectorScreen}
        options={{ title: "Add Exercise" }}
      />
      <HomeStack.Screen
        name="ExerciseDetail"
        component={ExerciseDetailScreen}
        options={{ title: "Exercise Info" }}
      />
      <HomeStack.Screen
        name="YearlyConsistency"
        component={YearlyConsistencyScreen}
        options={{ title: "Activity History", headerShown: false }}
      />
    </HomeStack.Navigator>
  );
}

const WorkoutStack = createNativeStackNavigator<WorkoutStackParamList>();
function WorkoutStackNavigator() {
  return (
    <WorkoutStack.Navigator screenOptions={stackOptions}>
      <WorkoutStack.Screen
        name="RoutineList"
        component={RoutineListScreen}
        options={{ headerShown: false }}
      />
      <WorkoutStack.Screen
        name="CreateRoutine"
        component={CreateRoutineScreen}
        options={{ headerShown: false }}
      />
      <WorkoutStack.Screen
        name="RoutineDetail"
        component={RoutineDetailScreen}
        options={{ headerShown: false }}
      />
      <WorkoutStack.Screen
        name="WorkoutLogger"
        component={WorkoutLoggerScreen}
        options={{ title: "Workout", animation: "slide_from_bottom" }}
      />
      <WorkoutStack.Screen
        name="ExerciseSelector"
        component={ExerciseSelectorScreen}
        options={{ title: "Add Exercise" }}
      />
      <WorkoutStack.Screen
        name="ExerciseDetail"
        component={ExerciseDetailScreen}
        options={{ title: "Exercise Info" }}
      />
    </WorkoutStack.Navigator>
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
      <SessionStack.Screen
        name="SessionHistory"
        component={SessionHistoryScreen}
        options={{ title: "All Sessions" }}
      />
    </SessionStack.Navigator>
  );
}

// ── Floating minimized workout bar ─────────────────────────────────────────

function FloatingWorkoutBar({ navigation, bottomOffset }: { navigation: any; bottomOffset: number }) {
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const workoutMinimized = useWorkoutStore((s) => s.workoutMinimized);
  const discardWorkout = useWorkoutStore((s) => s.discardWorkout);
  const isPaused = useWorkoutStore((s) => s.isPaused);
  const pausedMs = useWorkoutStore((s) => s.pausedMs);
  const pauseStartedAt = useWorkoutStore((s) => s.pauseStartedAt);
  const [elapsed, setElapsed] = useState(0);
  const workoutSnap = useRef(activeWorkout);
  if (activeWorkout) workoutSnap.current = activeWorkout;

  const visible = Boolean(activeWorkout && workoutMinimized);
  const [show, setShow] = useState(false);

  // Delay showing until the screen transition finishes
  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setShow(true), 400);
      return () => clearTimeout(t);
    } else {
      setShow(false);
    }
  }, [visible]);

  // Elapsed timer — accounts for paused time
  useEffect(() => {
    if (!activeWorkout?.started_at) return;
    const startTime = new Date(activeWorkout.started_at).getTime();
    const tick = () => {
      const now = Date.now();
      const totalPausedMs = pausedMs + (isPaused && pauseStartedAt !== null ? now - pauseStartedAt : 0);
      setElapsed(Math.max(0, Math.floor((now - startTime - totalPausedMs) / 1000)));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeWorkout?.started_at, isPaused, pausedMs, pauseStartedAt]);

  if (!show) return null;

  const display = activeWorkout ?? workoutSnap.current;
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  const timerStr = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

  function handleResume() {
    navigation.navigate("HomeTab", {
      screen: "WorkoutLogger",
      params: { workoutId: display!.id },
    });
  }

  function handleDiscard() {
    Alert.alert("Discard Workout?", "All progress will be lost.", [
      { text: "Cancel", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: discardWorkout },
    ]);
  }

  return (
    <View
      style={[
        floatingStyles.barWrap,
        { bottom: bottomOffset + 8 },
      ]}
    >
      <TouchableOpacity style={floatingStyles.bar} onPress={handleResume} activeOpacity={0.85}>
        <View style={floatingStyles.left}>
          <View style={floatingStyles.iconWrap}>
            <Ionicons name="barbell" size={16} color={Colors.accent} />
          </View>
          <View>
            <Text style={floatingStyles.name} numberOfLines={1}>
              {display?.name ?? "Workout"}
            </Text>
            <Text style={floatingStyles.timer}>{timerStr}</Text>
          </View>
        </View>
        <View style={floatingStyles.right}>
          {isPaused && (
            <View style={floatingStyles.pausedBadge}>
              <Text style={floatingStyles.pausedBadgeText}>PAUSED</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={handleDiscard}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
}

// ── Custom tab bar (measures height so FloatingWorkoutBar can be absolutely positioned)

function CustomTabBar(props: BottomTabBarProps) {
  const [tabBarHeight, setTabBarHeight] = useState(0);
  return (
    <View style={{ backgroundColor: Colors.bg }}>
      <View onLayout={(e) => setTabBarHeight(e.nativeEvent.layout.height)}>
        <BottomTabBar {...props} />
      </View>
      <FloatingWorkoutBar navigation={props.navigation} bottomOffset={tabBarHeight} />
    </View>
  );
}

// ── Tab navigator ───────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<AppTabParamList>();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
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
        component={WorkoutStackNavigator}
        options={{ title: "Routines" }}
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
  headerShown: false,
  contentStyle: { backgroundColor: Colors.bg },
  animation: "slide_from_right" as const,
};

const floatingStyles = StyleSheet.create({
  barWrap: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 10,
    elevation: 10,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.bgCard,
    padding: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.accent + "55",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.accent + "22",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    maxWidth: 160,
  },
  timer: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 1,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  pausedBadge: {
    backgroundColor: Colors.accent + "22",
    borderWidth: 1,
    borderColor: Colors.accent + "66",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pausedBadgeText: {
    color: Colors.accent,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.8,
  },
});

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.bgCard,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === "ios" ? 28 : 8,
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
