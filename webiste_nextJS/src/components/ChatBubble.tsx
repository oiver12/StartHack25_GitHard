"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useAppState, AppState } from "@/context/AppStateContext";
import { speedControl } from "@/config/speedControl";
// Analysis explanation messages for each sensor's temperature analysis
const analysisExplanations = [
  `Sensor 1 (Main Heating Flow):
- ΔT peaks during morning hours (6-8 AM)
- 3.2K higher than building average
- Correlates with Sensor 2 fluctuations
→ Recommend reducing morning heat ramp-up rate`,

  `Sensor 2 (North Zone):
- ΔT shows 15% variance vs. outdoor temp
- Heat loss detected near windows
- Inverse pattern to Sensor 1
→ Adjust zone balance with Sensor 1`,

  `Sensor 3 (Central Zone):
- Stable ΔT but 2.1K above optimal
- Cross-influence from Sensors 1 & 2
- Peak load affects nearby zones
→ Lower base temperature setpoint`,

  `Sensor 4 (South Zone):
- Solar gain reduces ΔT by 20% midday
- Most efficient among all zones
- Minimal impact from other sensors
→ Use as benchmark for other zones`,
];

export function ChatBubble() {
  const { state } = useAppState();
  const [messages, setMessages] = useState<string[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [charIndex, setCharIndex] = useState(0);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressBar, setProgressBar] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wasAnalyzingRef = useRef(false);

  // Listen for app state changes
  useEffect(() => {
    if (state === AppState.ANALYSE) {
      // Clear previous messages when analysis starts
      setMessages([]);
      setAnalysisCount(0);
    } else if (state === AppState.SELECT) {
      // Reset when returning to selection state
      setMessages([]);
      setCurrentMessage("");
      setIsTyping(false);
      setCharIndex(0);
      setAnalysisCount(0);
      setIsAnalyzing(false);
      setProgressBar("");
    }

    // Cleanup timers when component unmounts or state changes
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [state]);

  // Handle cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  // Listen for chart analyzing state and track analysis count
  useEffect(() => {
    // Only process during ANALYSE state
    if (state == AppState.ANALYSED) {
      setCurrentMessage(analysisExplanations[3]);
      setCharIndex(0);
      setIsTyping(true);
      setAnalysisCount(4);
      setIsAnalyzing(false);
    }

    if (state !== AppState.ANALYSE) return;

    // Set up an interval to check the DOM for analyzing state
    const checkAnalyzingInterval = setInterval(() => {
      // Check if AnalysisSequence has the "analyzing-container" class
      const analyzingContainer = document.querySelector(".analyzing-container");
      const isCurrentlyAnalyzing = !!analyzingContainer;

      // Track state transitions
      if (isCurrentlyAnalyzing && !wasAnalyzingRef.current) {
        // Analysis just started
        setIsAnalyzing(true);
        wasAnalyzingRef.current = true;
      } else if (!isCurrentlyAnalyzing && wasAnalyzingRef.current) {
        // Analysis just completed
        setIsAnalyzing(false);
        wasAnalyzingRef.current = false;

        // Show explanation text for current analysis step
        if (analysisCount < analysisExplanations.length) {
          setCurrentMessage(analysisExplanations[analysisCount]);
          setCharIndex(0);
          setIsTyping(true);
          // Increment for next analysis
          setAnalysisCount((prev) => prev + 1);
        }
      }
    }, 300);

    return () => {
      clearInterval(checkAnalyzingInterval);
    };
  }, [state, analysisCount]);

  // Handle progress bar animation during analysis
  useEffect(() => {
    if (!isAnalyzing) {
      setProgressBar("");
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      return;
    }

    // Start with initial message
    setProgressBar("ANALYZING DATA... [");
    let hashCount = 0;
    const maxHashes = 20; // Reduced for smoother animation in 1 second
    const intervalTime = speedControl.analysingTimeChart / maxHashes - 10; // 20 steps * 50ms = 1000ms (1 second)

    // Update progress bar every 50ms to complete in 1 second
    progressTimerRef.current = setInterval(() => {
      if (hashCount < maxHashes) {
        hashCount++;
        setProgressBar(() => {
          const hashes = "#".repeat(hashCount);
          const spaces = " ".repeat(maxHashes - hashCount);
          const percent = Math.floor((hashCount / maxHashes) * 100);
          return `ANALYZING DATA... [${hashes}${spaces}] ${percent}%`;
        });
      } else {
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      }
    }, intervalTime);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isAnalyzing]);

  // Handle typing animation for explanatory text
  useEffect(() => {
    if (!isTyping || !currentMessage) return;

    if (charIndex < currentMessage.length) {
      // Continue typing message
      typingTimerRef.current = setTimeout(() => {
        setCharIndex((prev) => prev + 1);
      }, speedControl.chatBotWriteSpeedCPS); // Typing speed
    } else {
      // Message complete, add to messages list
      setMessages((prev) => [...prev, currentMessage]);
      setCurrentMessage("");
      setIsTyping(false);
      setCharIndex(0);
    }

    // Cleanup timer
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [charIndex, isTyping, currentMessage]);

  // Auto-scroll to bottom when content changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, progressBar, currentMessage]);

  return (
    <div className="flex flex-col h-[100%] w-full relative center">
      {/* Chat message */}
      <div className="flex-1 overflow-y-auto mb-[16px] p-[8px] font-mono text-sm scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        <div className="flex flex-col gap-[16px]">
          {/* Previous messages */}
          {messages.map((msg, index) => (
            <div
              key={index}
              className="bg-[#1E1E1E] rounded-lg p-[12px] w-full text-white whitespace-pre-line text-[18px]"
            >
              {msg}
            </div>
          ))}

          {/* Currently typing message */}
          {isTyping && currentMessage && (
            <div className="bg-[#1E1E1E] rounded-lg p-[12px] w-full text-white whitespace-pre-line text-[18px]">
              {currentMessage.substring(0, charIndex)}
              <span className="animate-pulse">|</span>
            </div>
          )}

          {/* Progress bar during analysis */}
          {isAnalyzing && progressBar && (
            <div className="bg-[#1E1E1E] rounded-lg p-[12px] w-full text-[#1ebd1E] font-mono text-[15px]">
              {progressBar}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat icon */}
      <div className="absolute bottom-[16px] right-[16px] w-[48px] h-[48px] cursor-pointer hover:opacity-80 transition-opacity">
        <Image
          src="/chat_bg.png"
          alt="Chat Icon"
          fill
          style={{ objectFit: "contain" }}
        />
      </div>
    </div>
  );
}
