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
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { colors } from "@/config/colors";
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

interface OptimizedChartProps {
  originalData: Record<string, number | string | null>[];
  optimizedData: Record<string, number | string | null>[];
  xAxis: string;
  yAxis: string;
  xLabel: string;
  yLabel: string;
  title: string;
}

export const OptimizedChart: React.FC<OptimizedChartProps> = ({
  originalData,
  optimizedData,
  xAxis,
  yAxis,
  xLabel,
  yLabel,
  title,
}) => {
  const [pointIndex, setPointIndex] = useState(0);

  // Create a map of timestamps to optimized values for efficient lookup
  const optimizedMap = new Map(
    optimizedData.map((d) => [
      new Date(d[xAxis] as string).getTime(),
      Number(d["DeltaT_K_Scaled"]),
    ])
  );

  // Process chart data using original timestamps
  const timestamps = originalData.map((d) =>
    new Date(d[xAxis] as string).getTime()
  );
  const labels = originalData.map((d) =>
    format(new Date(d[xAxis] as string), "HH:mm:ss")
  );

  // Get closest optimized value for a timestamp
  const getClosestOptimizedValue = (timestamp: number) => {
    if (optimizedMap.has(timestamp)) {
      return optimizedMap.get(timestamp);
    }
    const times = Array.from(optimizedMap.keys());
    const closest = times.reduce((prev, curr) => {
      return Math.abs(curr - timestamp) < Math.abs(prev - timestamp)
        ? curr
        : prev;
    });
    return optimizedMap.get(closest);
  };

  // Animate points
  useEffect(() => {
    setPointIndex(0);
  }, [timestamps.length]);

  useEffect(() => {
    if (pointIndex < timestamps.length) {
      const timer = setTimeout(() => {
        setPointIndex(pointIndex + 1);
      }, 20); // Faster animation speed
      return () => clearTimeout(timer);
    }
  }, [pointIndex, timestamps.length]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0, // disable default animations
    },
    plugins: {
      legend: {
        display: false,
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
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "white",
        },
        min: Math.min(...originalData.map((d) => Number(d[yAxis]))),
        max: Math.max(...originalData.map((d) => Number(d[yAxis]))),
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

  const chartData = {
    labels,
    datasets: [
      {
        label: "Current Data",
        data: originalData.map((d) => Number(d[yAxis])),
        borderColor: `rgba(255, 107, 0, 0.5)`,
        backgroundColor: colors.primary.orangeTransparent,
        fill: true,
        pointRadius: 0,
        borderWidth: 2,
        tension: 0.4,
      },
      {
        label: "Optimized Data",
        data: timestamps.map((t, idx) =>
          idx <= pointIndex ? getClosestOptimizedValue(t) : NaN
        ),
        borderColor: colors.green.light,
        backgroundColor: "transparent",
        fill: false,
        pointRadius: 0,
        borderWidth: 3,
        tension: 0.4,
        spanGaps: false,
      },
    ],
  };

  return (
    <Card className="w-full h-full bg-transparent border-none">
      <Line options={options} data={chartData} />
    </Card>
  );
};
