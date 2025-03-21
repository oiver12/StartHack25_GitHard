export const colors = {
  primary: {
    orange: "#FF6B00",
    orangeTransparent: "rgba(255, 107, 0, 0.1)",
    orangeHalf: "rgba(255, 107, 0, 0.5)",
  },
  success: {
    green: "rgb(0, 255, 0)",
    greenAlt: "#00FF00",
    greenTransparent: "rgba(0, 255, 0, 0.1)",
  },
  ui: {
    gray: "#555555",
    darkGray: "#1E1E1E",
  }
} as const;

// Helper function to get color with opacity
export const getColorWithOpacity = (color: string, opacity: number) => {
  // Convert hex to rgb
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}; 