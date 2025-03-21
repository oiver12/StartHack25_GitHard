"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the possible states
export enum AppState {
  SELECT = "select",
  ANALYSE = "analyse",
  ANALYSED = "analysed",
  DONE = "done",
}

// Define the context type
type AppStateContextType = {
  state: AppState;
  setState: (state: AppState) => void;
  startAnalysis: () => void;
  finishAnalysis: () => void;
  startOptimization: () => void;
};

// Create the context
const AppStateContext = createContext<AppStateContextType | undefined>(
  undefined
);

// Create the provider component
export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(AppState.SELECT);

  // Function to start analysis (transition from SELECT to ANALYSE)
  const startAnalysis = () => {
    if (state === AppState.SELECT) {
      setState(AppState.ANALYSE);
    }
  };

  // Function to finish analysis (transition from ANALYSE to ANALYSED)
  const finishAnalysis = () => {
    if (state === AppState.ANALYSE) {
      setState(AppState.ANALYSED);
    }
  };

  // Function to start optimization (transition from ANALYSED to DONE)
  const startOptimization = () => {
    if (state === AppState.ANALYSED) {
      setState(AppState.DONE);
    }
  };

  return (
    <AppStateContext.Provider
      value={{
        state,
        setState,
        startAnalysis,
        finishAnalysis,
        startOptimization,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

// Custom hook for using the context
export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
}
