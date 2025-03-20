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
  data: any[];
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
  const [analysisMetrics, setAnalysisMetrics] = useState<{
    mean: number;
    max: number;
    min: number;
    trend: "up" | "down" | "stable";
  } | null>(null);

  // Process chart data
  const chartData = data.map((entry) => ({
    x: format(new Date(entry[xAxis]), "HH:mm:ss"),
    y: entry[yAxis],
  }));

  // Calculate min and max values
  const minY = Math.min(...chartData.map((entry) => entry.y));
  const maxY = Math.max(...chartData.map((entry) => entry.y));

  // Reset component on xAxis or yAxis change (different chart)
  useEffect(() => {
    console.log(`Chart parameters changed: ${xAxis}, ${yAxis}`);
    setVisibleDataPoints(0);
    setAnalysisStage("building");
    setAnalysisMetrics(null);
  }, [xAxis, yAxis]);

  // Calculate analysis metrics when chart is built
  const calculateMetrics = () => {
    const values = chartData.map((entry) => entry.y);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const trend = values[values.length - 1] > values[0] ? "up" : "down";

    setAnalysisMetrics({
      mean: Number(mean.toFixed(2)),
      max: Number(maxY.toFixed(2)),
      min: Number(minY.toFixed(2)),
      trend,
    });
  };

  // Handle the animation stages
  useEffect(() => {
    console.log(`Analysis stage: ${analysisStage}`);

    if (analysisStage === "building") {
      console.log(
        `Building chart with ${chartData.length} points at ${buildUpTime}ms per point`
      );
      const interval = setInterval(() => {
        setVisibleDataPoints((prev) => {
          if (prev < chartData.length) {
            return prev + 1;
          }
          clearInterval(interval);
          setAnalysisStage("analyzing");
          return prev;
        });
      }, buildUpTime);

      return () => clearInterval(interval);
    } else if (analysisStage === "analyzing") {
      // Start analysis animation
      console.log("Starting analysis animation");
      const analysisTimer = setTimeout(() => {
        calculateMetrics();
        setAnalysisStage("complete");
      }, 2000); // 2 seconds of analysis animation

      return () => clearTimeout(analysisTimer);
    } else if (analysisStage === "complete") {
      console.log("Analysis complete, calling callback");
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
          index < visibleDataPoints ? entry.y : null
        ),
        borderColor: "#FF6B00",
        backgroundColor: "rgba(255, 107, 0, 0.1)",
        fill: true,
        pointBackgroundColor: "#FF6B00",
        pointBorderColor: "#000",
        pointHoverBackgroundColor: "#000",
        pointHoverBorderColor: "#FF6B00",
        tension: 0.1,
        spanGaps: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
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
        },
        ticks: {
          color: "white",
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
        },
        ticks: {
          color: "white",
        },
      },
    },
  };

  return (
    <Card className="w-full max-w-4xl p-4 bg-[#141414] rounded-lg shadow-lg relative border-0">
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

        {analysisStage === "complete" && analysisMetrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 right-4 bg-[#1E1E1E] p-4 rounded-lg text-white"
          >
            <h3 className="font-bold mb-2">Analysis Results:</h3>
            <div className="space-y-1 text-sm">
              <p>Mean: {analysisMetrics.mean}</p>
              <p>Max: {analysisMetrics.max}</p>
              <p>Min: {analysisMetrics.min}</p>
              <p>Trend: {analysisMetrics.trend}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
