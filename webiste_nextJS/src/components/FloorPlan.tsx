"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useAppState, AppState } from "@/context/AppStateContext";
import { motion } from "framer-motion";

export type SensorPosition = {
  id: string;
  x: number; // percentage from left (0-100)
  y: number; // percentage from top (0-100)
  label?: string;
};

interface FloorPlanProps {
  sensors?: SensorPosition[];
  currentSensorId?: string;
  optimizeDelay?: number; // Time in ms between sensors turning green
}

// Sensor state represents different possible visual states for a sensor
type SensorState = "idle" | "active" | "analyzed" | "optimized";

export function FloorPlan({
  sensors = [],
  currentSensorId,
  optimizeDelay = 500, // Default 500ms delay
}: FloorPlanProps) {
  const { state } = useAppState();
  const [analyzedSensors, setAnalyzedSensors] = useState<Set<string>>(
    new Set()
  );
  const [optimizedSensors, setOptimizedSensors] = useState<Set<string>>(
    new Set()
  );
  const optimizationRef = useRef<{
    timeoutId?: NodeJS.Timeout;
    isOptimizing: boolean;
  }>({ isOptimizing: false });

  // Track which sensors have been analyzed
  useEffect(() => {
    if (currentSensorId) {
      setAnalyzedSensors((prev) => {
        const updated = new Set(prev);
        updated.add(currentSensorId);
        return updated;
      });
    }
  }, [currentSensorId]);

  // Handle optimization (turn sensors green sequentially)
  useEffect(() => {
    // Reset optimization when state changes from DONE
    if (state !== AppState.DONE) {
      if (optimizationRef.current.timeoutId) {
        clearTimeout(optimizationRef.current.timeoutId);
      }
      optimizationRef.current.isOptimizing = false;
      setOptimizedSensors(new Set());
      return;
    }

    // Start optimization if not already running
    if (state === AppState.DONE && !optimizationRef.current.isOptimizing) {
      optimizationRef.current.isOptimizing = true;
      const sensorsToOptimize = Array.from(analyzedSensors).filter(
        (id) => !optimizedSensors.has(id)
      );

      const optimizeNextSensor = (index: number) => {
        if (index < sensorsToOptimize.length) {
          setOptimizedSensors((prev) => {
            const updated = new Set(prev);
            updated.add(sensorsToOptimize[index]);
            return updated;
          });

          optimizationRef.current.timeoutId = setTimeout(
            () => optimizeNextSensor(index + 1),
            optimizeDelay
          );
        }
      };

      // Start the optimization sequence
      if (sensorsToOptimize.length > 0) {
        optimizeNextSensor(0);
      }
    }

    // Cleanup function
    return () => {
      if (optimizationRef.current.timeoutId) {
        clearTimeout(optimizationRef.current.timeoutId);
      }
    };
  }, [state, analyzedSensors, optimizeDelay]);

  // Get the state for a sensor based on its various conditions
  const getSensorState = (sensorId: string): SensorState => {
    if (optimizedSensors.has(sensorId)) return "optimized";
    if (sensorId === currentSensorId) return "active";
    if (analyzedSensors.has(sensorId)) return "analyzed";
    return "idle";
  };

  return (
    <div className="relative h-full min-h-[400px] flex items-center justify-center">
      {/* Building Image */}
      <div
        className="relative"
        style={{ width: `${600}px`, height: `${365}px` }}
      >
        <Image
          src="/building.png"
          alt="Building Floor Plan"
          fill
          style={{ objectFit: "contain" }}
          priority
        />

        {/* Sensor Markers */}
        {sensors.map((sensor) => {
          const sensorState = getSensorState(sensor.id);

          return (
            <div
              key={sensor.id}
              className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${sensor.x}%`,
                top: `${sensor.y}%`,
              }}
            >
              {sensorState === "active" ? (
                <div className="relative">
                  {/* Active sensor - orange with pulsing ring */}
                  <div className="w-[20px] h-[20px] rounded-full bg-[#FF6B00] flex items-center justify-center">
                    {sensor.label && (
                      <span className="text-white text-xs font-bold"></span>
                    )}
                  </div>

                  {/* Outer pulsing ring */}
                  <motion.div
                    className="absolute top-1/2 left-1/2 w-[30px] h-[30px] rounded-full bg-[#FF6B00] bg-opacity-50 -translate-x-1/2 -translate-y-1/2"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.7, 0.3, 0.7],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
              ) : sensorState === "optimized" ? (
                // Optimized sensor - green
                <motion.div
                  className="w-[20px] h-[20px] rounded-full bg-[#00FF00] flex items-center justify-center"
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  {sensor.label && (
                    <span className="text-black text-xs font-bold"></span>
                  )}
                </motion.div>
              ) : sensorState === "analyzed" ? (
                // Previously analyzed sensor - fully orange
                <div className="w-[20px] h-[20px] rounded-full bg-[#FF6B00] flex items-center justify-center">
                  {sensor.label && (
                    <span className="text-white text-xs font-bold"></span>
                  )}
                </div>
              ) : (
                // Not yet analyzed sensor - grey with orange border
                <div className="w-[20px] h-[20px] rounded-full bg-[#555555] border-2 border-[#FF6B00] flex items-center justify-center">
                  {sensor.label && (
                    <span className="text-white text-xs font-bold"></span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
