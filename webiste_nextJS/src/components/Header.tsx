import React from "react";
import { getTypographyClass } from "@/styles/typography";

export function Header() {
  return (
    <header className="flex items-center p-[16px]">
      {/* Empty space with configurable width */}
      <div style={{ width: "330px" }} />

      {/* Navigation items */}
      <nav className="flex gap-[32px]">
        <div className={`${getTypographyClass("p")} text-[#FF6B00]`}>
          DASHBOARD
        </div>
        <div className={getTypographyClass("p")}>DATA</div>
        <div className={getTypographyClass("p")}>PARAMETERS</div>
        <div className={getTypographyClass("p")}>REPORT</div>
      </nav>

      {/* Push logout to the right */}
      <div className="flex-1" />
      <div className={getTypographyClass("p")}>LOGOUT</div>
    </header>
  );
}
