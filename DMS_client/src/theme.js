// src/theme.js
export const getDesignTokens = (mode) => ({
    palette: {
      mode,
      ...(mode === "light"
        ? {
            primary: { main: "#1976d2" },
            background: { default: "#ffffff", paper: "#f5f5f5" },
            text: { primary: "#000", secondary: "#333" },
          }
        : {
            primary: { main: "#90caf9" },
            background: { default: "#121212", paper: "#1e1e1e" },
            text: { primary: "#fff", secondary: "#ccc" },
          }),
    },
  });
  