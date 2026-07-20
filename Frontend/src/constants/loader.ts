export const LOADER_CONFIG = {
  // Tetris grid configuration
  COLS: 6,
  ROWS: 4,
  BLOCK: 14,
  GAP: 3,
  COL_ORDER: [2, 4, 0, 5, 1, 3],
  
  // Progress arc configuration
  PROGRESS_RADIUS: 80,
  
  // Tetris block colors
  BLOCK_COLORS: {
    GOLD: "rgba(212,175,55,0.8)",
    WHITE: "rgba(255,255,255,0.6)",
    GREEN: "rgba(20,99,33,0.85)",
  },
  
  // Background color
  BACKGROUND_COLOR: "#0A3B12",
};

// Calculate circumference for progress ring
export const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * LOADER_CONFIG.PROGRESS_RADIUS;
