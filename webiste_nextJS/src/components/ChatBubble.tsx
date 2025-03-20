"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useAppState, AppState } from "@/context/AppStateContext";
import { getTypographyClass } from "@/styles/typography";

// Single analysis message with line breaks
const analysisMessage = `Analyzing temperature differential patterns...
I've identified irregular fluctuations in Zone 3 temperature readings.
The DeltaT values show a 12% higher variation than expected baseline.
Flow volume analysis indicates potential inefficiency in circulation pump.
Power consumption correlates strongly with external temperature changes.
I recommend adjusting the flow rate parameters by 0.35 to optimize energy usage.
Predicted optimization would result in 21% energy savings.
Position analysis shows valve efficiency at 78% of optimal performance.
Pushing new parameters would improve system performance by approximately 30%.`;

export function ChatBubble() {
  const { state } = useAppState();
  const [displayedText, setDisplayedText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Start typing animation when analysis begins
  useEffect(() => {
    if (state === AppState.ANALYSE) {
      // Reset and start
      setDisplayedText("");
      setCharIndex(0);
      setIsComplete(false);

      // Clear any existing timer
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    }

    // Cleanup timer when component unmounts or state changes
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [state]);

  // Handle typing animation
  useEffect(() => {
    if (state !== AppState.ANALYSE || isComplete) return;

    if (charIndex < analysisMessage.length) {
      // Continue typing message
      typingTimerRef.current = setTimeout(() => {
        setCharIndex((prev) => prev + 1);
        setDisplayedText(analysisMessage.substring(0, charIndex + 1));
      }, 10); // Typing speed
    } else {
      setIsComplete(true);
    }

    // Cleanup timer
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [charIndex, state, isComplete]);

  // Auto-scroll to bottom when text changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [displayedText]);

  return (
    <div className="flex flex-col h-[395px] w-full relative">
      {/* Chat message */}
      <div className="flex-1 overflow-y-auto mb-[16px] p-[8px] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        <div className="flex flex-col gap-[12px]">
          <div className="bg-[#1E1E1E] rounded-lg p-[12px] w-full text-white whitespace-pre-line">
            {displayedText}
          </div>
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
