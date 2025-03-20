"use client";
import React, { useEffect, useState } from "react";
import { GaugeComponent } from "react-gauge-component";
import Image from "next/image";
import { useAppState, AppState } from "@/context/AppStateContext";
import { getTypographyClass } from "@/styles/typography";

interface OptimizationPanelProps {
  onOptimize?: () => void;
}

export function OptimizationPanel({ onOptimize }: OptimizationPanelProps) {
  const { state, startAnalysis, startOptimization } = useAppState();
  const [optimizationIndex, setOptimizationIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);

  // Animate the percentage change
  useEffect(() => {
    let targetValue = 0;
    switch (state) {
      case AppState.ANALYSED:
        targetValue = 21;
        break;
      case AppState.DONE:
        targetValue = 80;
        break;
      default:
        targetValue = 0;
    }

    // Reset for instant drop to 0
    if (targetValue === 0) {
      setOptimizationIndex(0);
      setDisplayIndex(0);
      return;
    }

    // Animate up to target value
    const duration = 1000; // 1 second animation
    const steps = 60; // 60 steps for smooth animation
    const increment = (targetValue - optimizationIndex) / steps;
    const stepDuration = duration / steps;

    let currentValue = optimizationIndex;
    const timer = setInterval(() => {
      currentValue += increment;
      if (
        (increment > 0 && currentValue >= targetValue) ||
        (increment < 0 && currentValue <= targetValue)
      ) {
        clearInterval(timer);
        setOptimizationIndex(targetValue);
        setDisplayIndex(targetValue);
      } else {
        setOptimizationIndex(Math.round(currentValue));
        setDisplayIndex(Math.round(currentValue));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [state]);

  const handleAnalyse = () => {
    startAnalysis();
  };

  const handleOptimise = () => {
    startOptimization();
    onOptimize?.();
  };

  return (
    <div className="flex flex-col h-full">
      <div className={`text-center mb-[24px] ${getTypographyClass("h2")}`}>
        OPTIMISATION INDEX
      </div>

      {/* Gauge visualization */}
      <div className="flex-1 flex flex-col items-center justify-center relative min-h-[300px]">
        <GaugeComponent
          id="optimization-gauge"
          style={{ width: "500px", height: "250px" }}
          type="semicircle"
          arc={{
            width: 0.15,
            padding: 0,
            cornerRadius: 1,
            subArcs: [
              {
                limit: optimizationIndex,
                color: "#FF6B00",
                showTick: false,
              },
              {
                color: "#333333",
                showTick: false,
              },
            ],
          }}
          pointer={{
            type: "needle",
            color: "transparent",
            length: 0.8,
            elastic: true,
          }}
          labels={{
            valueLabel: { hide: true },
            tickLabels: {
              type: "outer",
              ticks: [{ value: 0 }, { value: 100 }],
              defaultTickValueConfig: {
                style: { fill: "#666666", fontSize: "14px" },
              },
            },
          }}
          value={optimizationIndex}
          minValue={0}
          maxValue={100}
        />
        {/* Custom centered text with AI icon */}
        <div className="absolute bottom-[50px] left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <div className="relative w-[48px] h-[48px] mb-[16px]">
            <Image
              src="/_498lZ1.tif.png"
              alt="AI Icon"
              fill
              style={{ objectFit: "contain" }}
            />
          </div>
          <div
            className={`${getTypographyClass(
              "h1"
            )} transition-all duration-300`}
          >
            {displayIndex}%
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-[32px] space-y-[16px] max-w-[400px] mx-auto w-full">
        <div className="flex gap-[16px]">
          <button
            className={`flex-1 py-[12px] bg-[#1E1E1E] rounded-[8px] transition-colors duration-300 ${getTypographyClass(
              "p"
            )}`}
            onClick={handleAnalyse}
            disabled={state !== AppState.SELECT}
          >
            ANALYSE
          </button>
          <button
            className={`flex-1 py-[12px] rounded-[8px] transition-colors duration-300 ${getTypographyClass(
              "p"
            )} ${
              state === AppState.ANALYSED
                ? "bg-[#00FF00] text-black"
                : "bg-white text-black"
            }`}
            onClick={handleOptimise}
            disabled={state !== AppState.ANALYSED}
          >
            OPTIMISE
          </button>
        </div>
        <button
          className={`w-full py-[16px] bg-[#FF6B00] rounded-[8px] transition-colors duration-300 ${getTypographyClass(
            "p"
          )}`}
          disabled={state !== AppState.DONE}
        >
          PUSH OPTIMISATION TO DEVICES
        </button>
      </div>
    </div>
  );
}
