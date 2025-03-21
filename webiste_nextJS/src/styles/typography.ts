export const typography = {
  h1: "font-['Montserrat'] font-medium text-[56px]", // H1 // MONTSERRAT MEDIUM 56
  h1_1: "font-['Montserrat'] font-medium text-[48px]", // H1 // MONTSERRAT MEDIUM 56
  h2: "font-['Montserrat'] font-semibold text-[24px]", // H2 // MONTESERRAT SEMIBOLD 24
  h3: "font-['Montserrat'] font-semibold text-[20px]", // H3 // MONTSERRAT SEMIBOLD 16
  p: "font-['Montserrat'] font-medium text-[18px]", // P // MONTSERRAT MEDIUM 16
} as const;

// Helper function to get typography class
export const getTypographyClass = (type: keyof typeof typography) => {
  return typography[type];
}; 