import { create } from "zustand";
import { ExerciseRecord } from "@/types";
import { EXERCISE_LIBRARY } from "@/constants/exercises";

interface IndexedExercise extends ExerciseRecord {
  searchString: string;
}

interface ExerciseState {
  library: ExerciseRecord[];
  indexedLibrary: IndexedExercise[];
  filteredExercises: ExerciseRecord[];
  searchQuery: string;
  selectedBodyPart: string | null;
  selectedEquipment: string | null;

  setSearchQuery: (query: string) => void;
  setBodyPart: (bodyPart: string | null) => void;
  setEquipment: (equipment: string | null) => void;
  resetFilters: () => void;
  applyFilters: () => void;
}

const normalize = (str: string) => str.toLowerCase().trim();

const validateAndIndex = (exercises: ExerciseRecord[]): IndexedExercise[] => {
  return exercises.reduce((acc, ex) => {
    // T008: Discard and log error for invalid exercise entries
    if (!ex.exerciseId || !ex.name || !ex.bodyParts || ex.bodyParts.length === 0) {
      console.error(`[exerciseStore] Invalid exercise entry skipped:`, ex);
      return acc;
    }

    // T006: Search index bootstrap (validation + regex string generation)
    const searchParts = [
      ex.name,
      ...(ex.keywords || []),
      ...(ex.targetMuscles || []),
      ...(ex.secondaryMuscles || []),
    ];

    acc.push({
      ...ex,
      searchString: normalize(searchParts.join(" ")),
    });
    return acc;
  }, [] as IndexedExercise[]);
};

const indexed = validateAndIndex(EXERCISE_LIBRARY);

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  library: EXERCISE_LIBRARY,
  indexedLibrary: indexed,
  filteredExercises: EXERCISE_LIBRARY,
  searchQuery: "",
  selectedBodyPart: null,
  selectedEquipment: null,

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().applyFilters();
  },

  setBodyPart: (bodyPart) => {
    set({ selectedBodyPart: bodyPart });
    get().applyFilters();
  },

  setEquipment: (equipment) => {
    set({ selectedEquipment: equipment });
    get().applyFilters();
  },

  resetFilters: () => {
    set({
      searchQuery: "",
      selectedBodyPart: null,
      selectedEquipment: null,
      filteredExercises: EXERCISE_LIBRARY,
    });
  },

  // Internal helper to apply all filters + T007: Regex-based search
  applyFilters: () => {
    const { indexedLibrary, searchQuery, selectedBodyPart, selectedEquipment } =
      get();

    let results = indexedLibrary;

    // Filter by body part
    if (selectedBodyPart) {
      results = results.filter((ex) =>
        ex.bodyParts.some((bp) => normalize(bp) === normalize(selectedBodyPart))
      );
    }

    // Filter by equipment
    if (selectedEquipment) {
      results = results.filter((ex) =>
        ex.equipments?.some((eq) => normalize(eq) === normalize(selectedEquipment))
      );
    }

    // T007: Regex-based search action
    if (searchQuery.trim()) {
      const normalizedQuery = normalize(searchQuery);
      // Escape special characters for regex
      const safeQuery = normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(safeQuery, "i");

      results = results.filter((ex) => regex.test(ex.searchString));
    }

    set({ filteredExercises: results });
  },
}));
