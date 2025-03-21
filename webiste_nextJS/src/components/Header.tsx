import React from "react";
import { getTypographyClass } from "@/styles/typography";

export function Header() {
  return (
    <header className="flex items-center pt-[16px]">
      {/* Empty space with configurable width */}
      <div style={{ width: "22%" }} />

      {/* Navigation items */}
      <nav className="flex gap-[24px]">
        <div className={`${getTypographyClass("h3")} text-[#FF6B00]`}>
          DASHBOARD
        </div>
        <div className={getTypographyClass("h3")}>DATA</div>
        <div className={getTypographyClass("h3")}>PARAMETERS</div>
        <div className={getTypographyClass("h3")}>REPORT</div>
      </nav>

      {/* Push logout to the right */}
      <div className="flex-1" />
      <div className={getTypographyClass("h3")}>LOGOUT</div>
      <div style={{ width: "2%" }} />
    </header>
  );
}
