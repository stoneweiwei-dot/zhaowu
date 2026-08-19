import { create } from "zustand";
import type { AnalysisResult, AnalyzeInput } from "@/lib/bazi/types";

type AppState = {
  current: AnalysisResult | null;
  fullReport: string | null;
  savedId: string | null;
  lastInput: AnalyzeInput | null;
  setCurrent: (current: AnalysisResult | null) => void;
  setFullReport: (fullReport: string | null) => void;
  setSavedId: (savedId: string | null) => void;
  setLastInput: (lastInput: AnalyzeInput | null) => void;
  reset: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  current: null,
  fullReport: null,
  savedId: null,
  lastInput: null,
  setCurrent: (current) => set({ current, fullReport: null, savedId: null }),
  setFullReport: (fullReport) => set({ fullReport }),
  setSavedId: (savedId) => set({ savedId }),
  setLastInput: (lastInput) => set({ lastInput }),
  reset: () => set({ current: null, fullReport: null, savedId: null, lastInput: null }),
}));
