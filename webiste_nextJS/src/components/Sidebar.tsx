import React from "react";
import { getTypographyClass } from "@/styles/typography";
import { Checkbox } from "@/components/ui/checkbox";
interface SidebarProps {
  floors: { floor: string; devices: number }[];
}

export function Sidebar({ floors }: SidebarProps) {
  return (
    <div className="w-[320px] p-[24px]">
      <div className="mb-[48px]">
        <div className={getTypographyClass("h1")}>BELIMO</div>
        <div className={getTypographyClass("h2")}>SMART SENCE</div>
      </div>

      <div className={getTypographyClass("h2")}>
        SIEMENS OFFICE BUILDING ZH5
      </div>

      <div className="space-y-[24px] mt-[24px]">
        {floors.map((floor, index) => (
          <div key={index}>
            <div className="flex items-center gap-[8px] mb-[16px]">
              {index < 2 ? (
                <div className="w-[8px] h-[8px] rounded-full bg-white" />
              ) : (
                <div className="w-[8px] h-[8px] rounded-full bg-[#FF6B00]" />
              )}
              <div className={getTypographyClass("h3")}>
                {floor.floor} FLOOR PLAN
              </div>
              <div className="ml-auto">
                {index < 2 ? (
                  <Checkbox
                    className="border-white data-[state=checked]:bg-transparent"
                    checked={false}
                  />
                ) : (
                  <Checkbox
                    className="border-[#FF6B00] bg-[#FF6B00] data-[state=checked]:bg-[#FF6B00]"
                    checked={true}
                  />
                )}
              </div>
            </div>
            {Array.from({ length: floor.devices }).map((_, deviceIndex) => (
              <div
                key={deviceIndex}
                className={`pl-[16px] mb-[8px] last:mb-0 ${getTypographyClass(
                  "p"
                )} text-neutral-400`}
              >
                BELIMO ACTUMOTION 500 - ID: BAM-500X
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
