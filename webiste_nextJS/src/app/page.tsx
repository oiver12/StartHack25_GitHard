"use client";
import { useRef, useState, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { FloorPlan, SensorPosition } from "@/components/FloorPlan";
import { OptimizationPanel } from "@/components/OptimizationPanel";
import {
  AnalysisSequence,
  type AnalysisSequenceRef,
} from "@/components/AnalysisSequence";
// Import available data files
import deviceData1 from "../../mock_data/device_data_sample_1.json";
import deviceData2 from "../../mock_data/device_data_sample_2.json";
import deviceData3 from "../../mock_data/device_data_sample_3.json";
import deviceData4 from "../../mock_data/device_data_sample_4.json";
import rollingAvgData from "../../mock_data/device_data_rolling_avg.json";
import { ChatBubble } from "@/components/ChatBubble";
import { useAppState, AppState } from "@/context/AppStateContext";
import { cardStyle, cardClassName } from "@/styles/cards";
import { speedControl } from "@/config/speedControl";

export default function Home() {
  const analysisRef = useRef<AnalysisSequenceRef>(null);
  const { state } = useAppState();
  const [currentSensorId, setCurrentSensorId] = useState<string | undefined>(
    undefined
  );
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState(0);
  const optimizeDelay = 500;

  // Current data file based on analysis step
  const getCurrentData = () => {
    // Return data file based on analysis step (cycling through all 4 files)
    switch (currentAnalysisStep % 4) {
      case 0:
        return deviceData1;
      case 1:
        return deviceData2;
      case 2:
        return deviceData3;
      case 3:
        return deviceData4;
      default:
        return deviceData1;
    }
  };

  const floors = [
    {
      floor: "1ST",
      devices: 2,
      deviceNames: ["Main Heating Flow Meter", "Radiator Flow Meter 1.1"],
    },
    {
      floor: "2ND",
      devices: 4,
      deviceNames: [
        "Radiator Flow Meter 2.1",
        "Radiator Flow Meter 2.2",
        "Radiator Flow Meter 2.3",
        "Radiator Flow Meter 2.4",
      ],
    },
    {
      floor: "3RD",
      devices: 3,
      deviceNames: [
        "Radiator Flow Meter 3.1",
        "Radiator Flow Meter 3.2",
        "Radiator Flow Meter 3.3",
      ],
    },
  ];

  // Define sensor positions
  const sensorPositions: SensorPosition[] = [
    { id: "sensor1", x: 28, y: 38, label: "1" },
    { id: "sensor2", x: 48, y: 7, label: "2" },
    { id: "sensor3", x: 74, y: 43, label: "3" },
    { id: "sensor4", x: 72, y: 70, label: "4" },
  ];

  // Define the analysis steps
  const analysisSteps = useMemo(
    () => [
      {
        title: "Temperature Analysis Plot 1",
        xAxis: "sample_time",
        yAxis: "DeltaT_K",
        xLabel: "Time",
        yLabel: "Temperature Difference (K)",
        buildUpTime: speedControl.chartBuildUpTime,
        datatype: "ID: 26245f9f-8f9f-41b8-90bc-fa47640395f2",
        sensorId: "sensor1", // Link to sensor position
      },
      {
        title: "Temperature Analysis Plot 2",
        xAxis: "sample_time",
        yAxis: "DeltaT_K",
        xLabel: "Time",
        yLabel: "Temperature Difference (K)",
        buildUpTime: speedControl.chartBuildUpTime,
        datatype: "ID: 25ff3a33-6eba-4238-9b8f-c0dea3f2e2c3",
        sensorId: "sensor2", // Link to sensor position
      },
      {
        title: "Temperature Analysis Plot 3",
        xAxis: "sample_time",
        yAxis: "DeltaT_K",
        xLabel: "Time",
        yLabel: "Temperature Difference (K)",
        buildUpTime: speedControl.chartBuildUpTime,
        datatype: "ID: 5dd3b941-aab6-44de-bdb6-b5e82026cc54",
        sensorId: "sensor3", // Link to sensor position
      },
      {
        title: "Temperature Analysis Plot 4",
        xAxis: "sample_time",
        yAxis: "DeltaT_K",
        xLabel: "Time",
        yLabel: "Temperature Difference (K)",
        buildUpTime: speedControl.chartBuildUpTime,
        datatype: "ID: 96e6013a-9e90-4dbd-9070-d6b4732f42b8",
        sensorId: "sensor4", // Link to sensor position
      },
    ],
    []
  );

  // Update current sensor based on analysis step
  useEffect(() => {
    if (state === AppState.ANALYSE) {
      setCurrentSensorId(analysisSteps[currentAnalysisStep]?.sensorId);
    } else {
      setCurrentSensorId(undefined);
    }
  }, [state, currentAnalysisStep, analysisSteps]);

  // Listen for analysis step changes
  useEffect(() => {
    const refCurrent = analysisRef.current;

    const handleAnalysisStepChange = (step: number) => {
      setCurrentAnalysisStep(step);
    };

    if (refCurrent) {
      refCurrent.onStepChange = handleAnalysisStepChange;
    }

    return () => {
      if (refCurrent) {
        refCurrent.onStepChange = null;
      }
    };
  }, []);

  // Handle optimization start
  const handleOptimize = () => {
    // This function is called when the optimize button is clicked
    if (analysisRef.current) {
      // Tell AnalysisSequence to show optimization data
      analysisRef.current.showOptimizationData(rollingAvgData);
    }
  };

  return (
    <div
      className="flex flex-col min-h-screen bg-[#000000] text-white"
      style={{
        backgroundImage:
          'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("/bg_overlay_png.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Content */}
      <div className="relative z-10 flex flex-col h-screen">
        <Header />

        {/* Main Content */}
        <div className="flex flex-1 h-[calc(100%-64px)]">
          {" "}
          {/* Subtract header height */}
          <Sidebar floors={floors} />
          {/* Center and Right Content */}
          <div className="flex-1 flex gap-[16px] p-[16px] h-full">
            {/* Left column: Floor Plan and Analysis */}
            <div className="w-[65%] flex flex-col gap-[16px] h-full">
              <div className={`h-[45%] ${cardClassName}`} style={cardStyle}>
                <FloorPlan
                  sensors={sensorPositions}
                  currentSensorId={currentSensorId}
                  optimizeDelay={optimizeDelay}
                />
              </div>
              <div
                className={`h-[53%] p-[16px] ${cardClassName}`}
                style={cardStyle}
              >
                <AnalysisSequence
                  data={
                    getCurrentData() as Record<string, number | string | null>[]
                  }
                  steps={analysisSteps}
                  defaultBuildUpTime={50}
                  ref={analysisRef}
                />
              </div>
            </div>

            {/* Right column: Optimization and Chat */}
            <div className="w-[35%] flex flex-col gap-[2%] h-full">
              <div
                className={`h-[60%] p-[16px] ${cardClassName}`}
                style={cardStyle}
              >
                <OptimizationPanel onOptimize={handleOptimize} />
              </div>
              <div
                className={`h-[40%] p-[16px] ${cardClassName}`}
                style={cardStyle}
              >
                <ChatBubble />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
