import React from "react";
import { Box, Typography, Select, MenuItem } from "@mui/material";

const CustomPagination = ({
  darkMode = false,
  page,
  setPage,
  rowsPerPage,
  setRowsPerPage,
  totalPages = 1,
  rowsPerPageOptions = [5, 10, 25, 50],
}) => {
  // Set colors dynamically based on darkMode
  const textColor = darkMode ? "#ffffff" : "#000000";
  const bgColor = darkMode ? "#0a1929" : "#ffffff";
  const borderColor = darkMode ? "#7F7F7F" : "#ccc";

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
      {/* Rows per page selector */}
      <Box display="flex" alignItems="center" gap={1}>
        <Typography variant="body2" sx={{ color: textColor }}>
          Records per page:
        </Typography>
        <Select
          value={rowsPerPage}
          onChange={(e) => {
            setRowsPerPage(parseInt(e.target.value));
            setPage(1);
          }}
          size="small"
          variant="outlined"
          sx={{
            fontSize: "13px",
            color: textColor,
            height: "30px",
            minWidth: "70px",
            backgroundColor: darkMode ? "#202328" : "#fff",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: darkMode ? "#444" : "#ccc",
            },
            "& .MuiSvgIcon-root": { color: textColor },
          }}
        >
          {rowsPerPageOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Navigation controls */}
      <Box flex={1} display="flex" justifyContent="flex-end">
        <Box
          sx={{
            border: `1px solid ${borderColor}`,
            borderRadius: "6px",
            px: 2,
            py: 0.5,
            height: "30px",
            display: "flex",
            alignItems: "center",
            gap: 2,
            color: textColor,
            fontSize: "13px",
            userSelect: "none",
          }}
        >
          <Box
            onClick={page > 1 ? () => setPage(page - 1) : undefined}
            sx={{
              cursor: page > 1 ? "pointer" : "not-allowed",
            }}
          >
            &#8249;
          </Box>
          <Box>
            {page} / {totalPages}
          </Box>
          <Box
            onClick={page < totalPages ? () => setPage(page + 1) : undefined}
            sx={{
              cursor: page < totalPages ? "pointer" : "not-allowed",
            }}
          >
            &#8250;
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CustomPagination;
