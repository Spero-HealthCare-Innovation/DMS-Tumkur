// src/utils/customScrollStyle.js (suggested file name)

const customScrollStyle = {
  mt: 1,
  backgroundColor: "#222",
  color: "#fff",
  maxHeight: 300,
  "& .MuiMenuItem-root": {
    px: 2,
    py: 1.5,
  },
  // Scrollbar style
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "#1a1a1a",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#00bfff",
    borderRadius: "4px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "#00cfff",
  },
};

export default customScrollStyle;
