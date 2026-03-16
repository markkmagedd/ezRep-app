import React from "react";
import { ScrollView, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors, FontSize, FontWeight, Radius, Spacing } from "../../constants/theme";

interface YearSelectorProps {
  years: number[];
  selectedYear: number;
  onSelectYear: (year: number) => void;
}

export const YearSelector: React.FC<YearSelectorProps> = ({
  years,
  selectedYear,
  onSelectYear,
}) => {
  if (years.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {years.map((year) => {
        const isActive = year === selectedYear;
        return (
          <TouchableOpacity
            key={year}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onSelectYear(year)}
          >
            <Text style={[styles.text, isActive && styles.textActive]}>
              {year}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 50,
    marginBottom: Spacing.md,
  },
  content: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  tab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.accentDim,
    borderColor: Colors.accent,
  },
  text: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  textActive: {
    color: Colors.bg,
    fontWeight: FontWeight.black,
  },
});
