"use client";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { colors } from "@/config/colors";
import { speedControl } from "@/config/speedControl";
// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export type ChartProps = {
  data: Record<string, number | string | null>[];
  xAxis: string;
  yAxis: string;
  xLabel: string;
  yLabel: string;
  title: string;
  buildUpTime: number;
  onAnalysisComplete?: () => void;
  onAnalysisStageChange?: (stage: string) => void;
};

type AnalysisStage = "building" | "analyzing" | "complete";

export function TemperatureChart({
  data,
  xAxis,
  yAxis,
  xLabel,
  yLabel,
  title,
  buildUpTime,
  onAnalysisComplete,
  onAnalysisStageChange,
}: ChartProps) {
  const [visibleDataPoints, setVisibleDataPoints] = useState<number>(0);
  const [analysisStage, setAnalysisStage] = useState<AnalysisStage>("building");

  // Process chart data
  const chartData = data.map((entry) => ({
    x: format(new Date(entry[xAxis] as string), "HH:mm:ss"),
    y: Number(entry[yAxis]),
  }));

  // Calculate min and max values
  const minY = Math.min(...chartData.map((entry) => entry.y));
  const maxY = Math.max(...chartData.map((entry) => entry.y));

  // Reset component on xAxis or yAxis change (different chart)
  useEffect(() => {
    setVisibleDataPoints(0);
    setAnalysisStage("building");
  }, [xAxis, yAxis]);

  // Handle the animation stages
  useEffect(() => {
    if (analysisStage === "building") {
      const interval = setInterval(() => {
        setVisibleDataPoints((prev) => {
          if (prev < chartData.length) {
            return prev + 1;
          }
          clearInterval(interval);
          // Add a short pause before moving to analyzing stage
          setTimeout(() => {
            setAnalysisStage("analyzing");
          }, 10); // 500ms pause after building is complete
          return prev;
        });
      }, buildUpTime);

      return () => clearInterval(interval);
    } else if (analysisStage === "analyzing") {
      // Start analysis animation
      const analysisTimer = setTimeout(() => {
        setAnalysisStage("complete");
      }, speedControl.analysingTimeChart); // 2 seconds of analysis animation

      return () => clearTimeout(analysisTimer);
    } else if (analysisStage === "complete") {
      // Small delay before callback to ensure UI updates
      setTimeout(() => {
        onAnalysisComplete?.();
      }, 100);
    }
  }, [analysisStage, chartData.length, buildUpTime, onAnalysisComplete]);

  // Notify parent of analysis stage changes
  useEffect(() => {
    if (analysisStage === "analyzing") {
      onAnalysisStageChange?.("analyzing");
    } else {
      onAnalysisStageChange?.("idle");
    }
  }, [analysisStage, onAnalysisStageChange]);

  const chartConfig = {
    labels: chartData.map((entry) => entry.x),
    datasets: [
      {
        label: yLabel,
        data: chartData.map((entry, index) =>
          index < visibleDataPoints ? entry.y : NaN
        ),
        borderColor: colors.primary.orange,
        backgroundColor: colors.primary.orangeTransparent,
        fill: true,
        pointRadius: 0,
        borderWidth: 2,
        tension: 0.4,
        spanGaps: false,
      },
    ],
  };

  const options = {
    responsive: true,
    animation: {
      duration: 0, // disable default animations
    },
    plugins: {
      legend: {
        display: false, // Hide the legend box completely
        position: "top" as const,
        labels: {
          color: "white",
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: false,
        text: title,
        color: "white",
        font: {
          size: 14,
          weight: "normal" as const,
        },
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: yLabel,
          color: "white",
        },
        min: minY,
        max: maxY,
        beginAtZero: false,
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
          drawBorder: false,
        },
        ticks: {
          color: "white",
        },
        border: {
          display: false,
        },
      },
      x: {
        title: {
          display: true,
          text: xLabel,
          color: "white",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
          drawBorder: false,
        },
        ticks: {
          color: "white",
        },
      },
    },
  };

  return (
    <Card className="w-full h-full bg-transparent border-none">
      <Line options={options} data={chartConfig} />

      <AnimatePresence>
        {analysisStage === "analyzing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-black/10 flex items-center justify-center py-4"
          >
            <motion.div
              className="text-lg font-bold text-[#FF6B00]"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              Analyzing Data...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
