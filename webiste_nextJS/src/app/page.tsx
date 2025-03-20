"use client";
import { useRef, useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { FloorPlan, SensorPosition } from "@/components/FloorPlan";
import { OptimizationPanel } from "@/components/OptimizationPanel";
import {
  AnalysisSequence,
  type AnalysisSequenceRef,
} from "@/components/AnalysisSequence";
import deviceData from "../../mock_data/device_data_sample_readable.json";
import { ChatBubble } from "@/components/ChatBubble";
import { useAppState, AppState } from "@/context/AppStateContext";

export default function Home() {
  const analysisRef = useRef<AnalysisSequenceRef>(null);
  const { state } = useAppState();
  const [currentSensorId, setCurrentSensorId] = useState<string | undefined>(
    undefined
  );
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState(0);
  const [optimizeDelay, setOptimizeDelay] = useState(500); // Default 500ms between sensors

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
    { id: "sensor1", x: 22, y: 35, label: "1" },
    { id: "sensor2", x: 48, y: 7, label: "2" },
    { id: "sensor3", x: 74, y: 35, label: "3" },
    { id: "sensor4", x: 72, y: 66, label: "4" },
  ];

  // Define the analysis steps
  const analysisSteps = [
    {
      title: "Temperature Difference Analysis",
      xAxis: "sample_time",
      yAxis: "DeltaT_K",
      xLabel: "Time",
      yLabel: "Temperature Difference (K)",
      buildUpTime: 20,
      datatype: "DATEPACK XX01",
      sensorId: "sensor1", // Link to sensor position
    },
    {
      title: "Flow Volume Analysis",
      xAxis: "sample_time",
      yAxis: "Flow_Volume_total_m3",
      xLabel: "Time",
      yLabel: "Flow Volume (m³)",
      buildUpTime: 20,
      datatype: "DATEPACK XX02",
      sensorId: "sensor2", // Link to sensor position
    },
    {
      title: "Power Analysis",
      xAxis: "sample_time",
      yAxis: "AbsPower_Fb_W",
      xLabel: "Time",
      yLabel: "Absolute Power (W)",
      buildUpTime: 20,
      datatype: "DATEPACK XX03",
      sensorId: "sensor3", // Link to sensor position
    },
    {
      title: "Position Analysis",
      xAxis: "sample_time",
      yAxis: "RelPos_Fb",
      xLabel: "Time",
      yLabel: "Relative Position",
      buildUpTime: 20,
      datatype: "DATEPACK XX04",
      sensorId: "sensor4", // Link to sensor position
    },
  ];

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
    const handleAnalysisStepChange = (step: number) => {
      setCurrentAnalysisStep(step);
    };

    if (analysisRef.current) {
      analysisRef.current.onStepChange = handleAnalysisStepChange;
    }

    return () => {
      if (analysisRef.current) {
        analysisRef.current.onStepChange = null;
      }
    };
  }, []);

  // Handle optimization start
  const handleOptimize = () => {
    // This function is called when the optimize button is clicked
    console.log("Starting optimization with delay:", optimizeDelay);
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
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        {/* Main Content */}
        <div className="flex flex-1">
          <Sidebar floors={floors} />

          {/* Center and Right Content */}
          <div className="flex-1 grid grid-cols-5 gap-[16px] p-[16px]">
            {/* Left column: Floor Plan and Analysis */}
            <div className="col-span-3 flex flex-col gap-[16px]">
              <div
                className="rounded-[16px] overflow-hidden h-[420px] backdrop-blur-sm"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(40, 40, 40, 0.8) 0%, rgba(20, 20, 20, 0.8) 100%)",
                  boxShadow: "0 4px 24px -1px rgba(0, 0, 0, 0.2)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <FloorPlan
                  sensors={sensorPositions}
                  currentSensorId={currentSensorId}
                  optimizeDelay={optimizeDelay}
                />
              </div>
              <div
                className="rounded-[16px] p-[16px] flex-1 backdrop-blur-sm"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(40, 40, 40, 0.8) 0%, rgba(20, 20, 20, 0.8) 100%)",
                  boxShadow: "0 4px 24px -1px rgba(0, 0, 0, 0.2)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <AnalysisSequence
                  data={deviceData}
                  steps={analysisSteps}
                  defaultBuildUpTime={50}
                  defaultAnalysisTime={2000}
                  ref={analysisRef}
                />
              </div>
            </div>

            {/* Right column: Optimization and Chat */}
            <div className="col-span-2 flex flex-col gap-[16px]">
              <div
                className="rounded-[16px] p-[16px] backdrop-blur-sm"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(40, 40, 40, 0.8) 0%, rgba(20, 20, 20, 0.8) 100%)",
                  boxShadow: "0 4px 24px -1px rgba(0, 0, 0, 0.2)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <OptimizationPanel onOptimize={handleOptimize} />
              </div>
              <div
                className="rounded-[16px] p-[16px] flex-1 backdrop-blur-sm"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(40, 40, 40, 0.8) 0%, rgba(20, 20, 20, 0.8) 100%)",
                  boxShadow: "0 4px 24px -1px rgba(0, 0, 0, 0.2)",
                  backdropFilter: "blur(20px)",
                }}
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
