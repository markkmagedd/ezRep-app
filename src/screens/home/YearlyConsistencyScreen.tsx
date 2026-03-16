import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontSize, FontWeight, Spacing, Radius } from "../../constants/theme";
import { useNavigation } from "@react-navigation/native";
import { useWorkoutStore } from "../../store/workoutStore";
import { YearSelector } from "../../components/home/YearSelector";
import { YearlyConsistencyGrid } from "../../components/home/YearlyConsistencyGrid";

const YearlyConsistencyScreen = () => {
  const navigation = useNavigation();
  const { getYearlyActivityOptions, getGridForYear, recentWorkouts } = useWorkoutStore();
  
  const years = getYearlyActivityOptions();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(years[0] || currentYear);

  // Default to newest year if options change (e.g. after refresh)
  useEffect(() => {
    if (years.length > 0 && !years.includes(selectedYear)) {
      setSelectedYear(years[0]);
    }
  }, [years]);

  const activityData = getGridForYear(selectedYear);
  const totalInYear = Object.values(activityData).reduce((a, b) => a + b, 0);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity History</Text>
      </View>

      <View style={styles.yearSelectorContainer}>
        <YearSelector
          years={years.length > 0 ? years : [currentYear]}
          selectedYear={selectedYear}
          onSelectYear={setSelectedYear}
        />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryValue}>{totalInYear}</Text>
            <Text style={styles.summaryLabel}>Workouts in {selectedYear}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryStat}>
            <Text style={styles.summaryValue}>
              {Object.keys(activityData).length}
            </Text>
            <Text style={styles.summaryLabel}>Active Days</Text>
          </View>
        </View>

        <View style={styles.gridCard}>
          <YearlyConsistencyGrid
            year={selectedYear}
            activityData={activityData}
          />
          <View style={styles.legend}>
            <Text style={styles.legendText}>Less</Text>
            <View style={[styles.legendBox, { backgroundColor: Colors.bgSurface }]} />
            <View style={[styles.legendBox, { backgroundColor: Colors.accent }]} />
            <Text style={styles.legendText}>More</Text>
          </View>
        </View>
        
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
          <Text style={styles.infoText}>
            This grid shows your consistency over time. Each green box represents one or more workouts logged that day.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  backBtn: {
    padding: Spacing.sm,
    marginLeft: -Spacing.sm,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  yearSelectorContainer: {
    marginTop: Spacing.xs,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: "row",
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryStat: {
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    color: Colors.accent,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
  },
  summaryLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    textTransform: "uppercase",
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  gridCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  legendText: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  legendBox: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  infoBox: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: Spacing.sm,
    opacity: 0.8,
  },
  infoText: {
    flex: 1,
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
});

export default YearlyConsistencyScreen;
