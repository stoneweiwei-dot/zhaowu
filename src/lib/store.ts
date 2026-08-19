import { create } from "zustand";
import type { AnalysisResult } from "@/lib/bazi/types";

type AppState = {
  current: AnalysisResult | null;
  fullReport: string | null;
  savedId: string | null;
  setCurrent: (current: AnalysisResult | null) => void;
  setFullReport: (text: string | null) => void;
  setSavedId: (id: string | null) => void;
  reset: () => void;
};

const EMPTY = {
  current: null,
  fullReport: null,
  savedId: null,
} satisfies Pick<AppState, "current" | "fullReport" | "savedId">;

export const useAppStore = create<AppState>((set) => ({
  ...EMPTY,
  setCurrent: (current) => set({ current, fullReport: null, savedId: null }),
  setFullReport: (fullReport) => set({ fullReport }),
  setSavedId: (savedId) => set({ savedId }),
  reset: () => set({ ...EMPTY }),
}));
