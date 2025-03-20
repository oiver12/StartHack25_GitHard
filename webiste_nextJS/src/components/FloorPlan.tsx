"use client";
import React from "react";
import Image from "next/image";
import { useAppState, AppState } from "@/context/AppStateContext";

export function FloorPlan() {
  const { state } = useAppState();

  return (
    <div className="relative h-full min-h-[400px] flex items-center justify-center">
      {/* Building Image */}
      <div
        className="relative"
        style={{ width: `${516}px`, height: `${361}px` }}
      >
        <Image
          src="/building.png"
          alt="Building Floor Plan"
          fill
          style={{ objectFit: "contain" }}
          priority
        />
      </div>

      {/* Analysis Overlay */}
      {state === AppState.ANALYSE && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-2xl font-bold">ANALYSING...</div>
        </div>
      )}
    </div>
  );
}
