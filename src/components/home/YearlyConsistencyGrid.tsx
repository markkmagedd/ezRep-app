import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Colors, Spacing, Radius } from "../../constants/theme";

interface YearlyConsistencyGridProps {
  year: number;
  activityData: Record<string, number>;
}

export const YearlyConsistencyGrid: React.FC<YearlyConsistencyGridProps> = ({
  year,
  activityData,
}) => {
  const weeks = useMemo(() => {
    const matrix: Date[][] = [];
    const date = new Date(year, 0, 1);
    
    // Find the Monday of the week containing Jan 1st
    // 0=Sun, 1=Mon, ..., 6=Sat
    // We want Monday to be the start of each column.
    const dayOfWeek = date.getDay();
    const diffToMonday = (dayOfWeek + 6) % 7;
    date.setDate(date.getDate() - diffToMonday);

    // Generate weeks until we pass the end of the year
    while (date.getFullYear() <= year || matrix.length < 52) {
      if (date.getFullYear() > year && matrix.length >= 52) break;
      
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(date));
        date.setDate(date.getDate() + 1);
      }
      matrix.push(week);
    }
    
    return matrix;
  }, [year]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <View style={styles.container}>
      <View style={styles.gridHeader}>
        {/* We offset top by 20 to align with the matrix below the month labels */}
        {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
          <Text key={i} style={[styles.dayLabel, { top: 22 + i * (14 + 4) }]}>
            {day}
          </Text>
        ))}
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View>
          <View style={styles.monthsRow}>
            {weeks.map((week, weekIdx) => {
              // Show month label if the 1st of the month falls within this week
              // OR if it's the very first week and we haven't shown a month yet.
              const firstOfMonth = week.find(d => d.getDate() === 1);
              const showMonth = firstOfMonth || weekIdx === 0;
              const displayMonth = firstOfMonth ? firstOfMonth.getMonth() : week[0].getMonth();
              
              return (
                <View key={`m-${weekIdx}`} style={styles.monthColumn}>
                  {showMonth && (
                    <Text style={styles.monthLabel}>
                      {monthNames[displayMonth]}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
          
          <View style={styles.matrix}>
            {weeks.map((week, weekIdx) => (
              <View key={`w-${weekIdx}`} style={styles.column}>
                {week.map((day, dayIdx) => {
                const dateKey = day.toISOString().split("T")[0];
                const count = activityData[dateKey] || 0;
                const isCurrentYear = day.getFullYear() === year;
                
                return (
                  <View
                    key={dayIdx}
                    style={[
                      styles.cell,
                      !isCurrentYear && styles.cellEmpty,
                      isCurrentYear && count > 0 && styles.cellActive,
                    ]}
                  />
                );
              })}
            </View>
          ))}
        </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingLeft: Spacing.md,
  },
  gridHeader: {
    width: 20,
    marginRight: 4,
    position: "relative",
    height: 20 + (14 + 4) * 7,
  },
  dayLabel: {
    position: "absolute",
    color: Colors.textMuted,
    fontSize: 9, // Slightly smaller to fit 7 of them
    fontWeight: "600",
    left: 0,
  },
  monthsRow: {
    flexDirection: "row",
    height: 20,
  },
  monthColumn: {
    width: 14 + 4, // cell + gap
  },
  monthLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: "600",
    width: 30, // Allow text to overlap next cells
  },
  scrollContent: {
    paddingRight: Spacing.xl,
  },
  matrix: {
    flexDirection: "row",
    gap: 4,
  },
  column: {
    gap: 4,
  },
  cell: {
    width: 14,
    height: 14,
    borderRadius: 2,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cellEmpty: {
    backgroundColor: "transparent",
    borderColor: "transparent",
  },
  cellActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
});
