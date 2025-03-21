"use client";
import {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TemperatureChart } from "./TemperatureChart";
import { OptimizedChart } from "./OptimizedChart";
import { useAppState, AppState } from "@/context/AppStateContext";
import { getTypographyClass } from "@/styles/typography";
import "@/styles/animations.css";

// Define a type for each analysis step
type AnalysisStep = {
  title: string;
  xAxis: string;
  yAxis: string;
  xLabel: string;
  yLabel: string;
  buildUpTime: number;
  analysisTime?: number; // Optional override for analysis time
  datatype: string; // Added datatype parameter
  sensorId?: string; // Optional sensor ID for positioning
};

// Props for the sequence component
type AnalysisSequenceProps = {
  data: Record<string, number | string | null>[];
  steps: AnalysisStep[];
  defaultBuildUpTime?: number;
  onAnalysisComplete?: () => void;
};

export type AnalysisSequenceRef = {
  startAnalysis: () => void;
  onStepChange?: ((step: number) => void) | null;
  showOptimizationData: (
    data: Record<string, number | string | null>[]
  ) => void;
};

export const AnalysisSequence = forwardRef<
  AnalysisSequenceRef,
  AnalysisSequenceProps
>(({ data, steps, defaultBuildUpTime = 50, onAnalysisComplete }, ref) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isChartAnalyzing, setIsChartAnalyzing] = useState(false);
  const [optimizationData, setOptimizationData] = useState<
    Record<string, number | string | null>[] | null
  >(null);
  const { state, startAnalysis, finishAnalysis } = useAppState();

  // Ref to store the onStepChange callback
  const onStepChangeRef = useRef<((step: number) => void) | null>(null);

  // Monitor app state changes
  useEffect(() => {
    if (state === AppState.ANALYSE && currentStepIndex === -1) {
      setIsAnalyzing(true);
      setCurrentStepIndex(0);
    }
  }, [state, currentStepIndex]);

  // Call onStepChange callback when currentStepIndex changes
  useEffect(() => {
    if (currentStepIndex >= 0 && onStepChangeRef.current) {
      onStepChangeRef.current(currentStepIndex);
    }
  }, [currentStepIndex]);

  const startAnalysisSequence = () => {
    startAnalysis();
  };

  useImperativeHandle(ref, () => ({
    startAnalysis: startAnalysisSequence,
    get onStepChange() {
      return onStepChangeRef.current;
    },
    set onStepChange(callback: ((step: number) => void) | null) {
      onStepChangeRef.current = callback;
    },
    showOptimizationData: (data: Record<string, number | string | null>[]) => {
      setOptimizationData(data);
    },
  }));

  // Handle completion of a chart's analysis
  const handleChartComplete = () => {
    // Clean up current chart
    setIsChartAnalyzing(false);

    if (currentStepIndex < steps.length - 1) {
      // Simple single timeout for transition
      setTimeout(() => {
        setCurrentStepIndex(currentStepIndex + 1);
      }, 1000);
    } else {
      setIsAnalyzing(false);
      finishAnalysis(); // Transition to ANALYSED state
      onAnalysisComplete?.();
    }
  };

  const handleAnalysisStageChange = (stage: string) => {
    setIsChartAnalyzing(stage === "analyzing");
  };

  return (
    <div className="space-y-4">
      {/* Datatype display at the top */}
      <div className="flex justify-end mb-[8px]">
        {currentStepIndex >= 0 && steps[currentStepIndex] && (
          <div className={`${getTypographyClass("p")} text-[#FF6B00]`}>
            #{steps[currentStepIndex].datatype}
          </div>
        )}
      </div>

      {/* Charts Container */}
      <div
        className={`space-y-8 relative ${
          isChartAnalyzing ? "analyzing-container" : ""
        }`}
      >
        <AnimatePresence mode="wait">
          {currentStepIndex >= 0 && steps[currentStepIndex] && (
            <motion.div
              key={`chart-motion-${currentStepIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {state === AppState.DONE && optimizationData ? (
                <OptimizedChart
                  originalData={data}
                  optimizedData={optimizationData}
                  xAxis={steps[currentStepIndex].xAxis}
                  yAxis={steps[currentStepIndex].yAxis}
                  xLabel={steps[currentStepIndex].xLabel}
                  yLabel={steps[currentStepIndex].yLabel}
                  title={steps[currentStepIndex].title}
                />
              ) : (
                <TemperatureChart
                  key={`chart-${currentStepIndex}`}
                  data={data}
                  xAxis={steps[currentStepIndex].xAxis}
                  yAxis={steps[currentStepIndex].yAxis}
                  xLabel={steps[currentStepIndex].xLabel}
                  yLabel={steps[currentStepIndex].yLabel}
                  title={steps[currentStepIndex].title}
                  buildUpTime={
                    steps[currentStepIndex].buildUpTime || defaultBuildUpTime
                  }
                  onAnalysisComplete={handleChartComplete}
                  onAnalysisStageChange={handleAnalysisStageChange}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Indicator */}
      {isAnalyzing && (
        <div className="flex justify-center items-center space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${
                index === currentStepIndex
                  ? "bg-[#FF6B00]"
                  : index < currentStepIndex
                  ? "bg-[#FF6B00]/50"
                  : "bg-[#333333]"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
});

AnalysisSequence.displayName = "AnalysisSequence";

// Export the types for external use
export type { AnalysisStep, AnalysisSequenceProps };
