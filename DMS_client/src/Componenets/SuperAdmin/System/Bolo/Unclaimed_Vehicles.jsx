import React, { useEffect, useMemo, useState } from "react";
import {
  Paper,
  Grid,
  Typography,
  Button,
  Box,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  Select,
  Popover,
  Snackbar,
  Alert,
  Autocomplete,
  FormHelperText,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableCell,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";

import {
  AddCircleOutline,
  DeleteOutline,
  EditOutlined,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useLocation } from "react-router-dom";

import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import CloseIcon from "@mui/icons-material/Close";

import {
  TableDataCardBody,
  TableHeadingCard,
  CustomTextField,
  getThemeBgColors,
  textfieldInputFonts,
  fontsTableBody,
  getCustomSelectStyles,
  fontsTableHeading,
  StyledCardContent,
  inputStyle,
} from "../../../../CommonStyle/Style";
import { useAuth } from "../../../../Context/ContextAPI";
import axios from "axios";
import { select } from "framer-motion/client";
import { motion } from "framer-motion";

const UnclaimedVehicles = ({ darkMode }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const selectStyles = getCustomSelectStyles(isDarkMode);

  const port = import.meta.env.VITE_APP_API_KEY;
  const { newToken } = useAuth();
  const token = localStorage.getItem("access_token");

  // Table & form states
  const [vehicleList, setVehicleList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");

  const [vehicleRtoNo, setVehicleRtoNo] = useState("");
  const [vehicleChassiNo, setVehicleChassiNo] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [file, setFile] = useState(null);
  const [existingFile, setExistingFile] = useState(null);
  const [scheduledDateTime, setScheduledDateTime] = useState("");
  const [editId, setEditId] = useState(null);

  const [rtoNo, setRtoNo] = useState("");
  const [chassisNo, setChassisNo] = useState("");

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [errors, setErrors] = useState({});

  // Permissions
  const [CanAddVehicles, setCanAddVehicles] = useState(false);
  const [canDeleteVehicles, setCanDeleteVehicles] = useState(false);
  const [canEditVehicles, setCanEditVehicles] = useState(false);

  const [editRowId, setEditRowId] = useState(null); // missing
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // missing
  const [itemToDelete, setItemToDelete] = useState(null);

  const open = Boolean(anchorEl);

  // Filtered & paginated data
  const filteredVehicles = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return vehicleList.filter(
      (v) =>
        v.rto_no?.toLowerCase().includes(query) ||
        v.chassi_no?.toLowerCase().includes(query) ||
        v.vehicle_model?.toLowerCase().includes(query)
    );
  }, [vehicleList, searchQuery]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredVehicles.slice(start, start + rowsPerPage);
  }, [filteredVehicles, page, rowsPerPage]);

  // Snackbar helper
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  // Search handler
  const handleSearch = (e) => setSearchQuery(e.target.value);

  // Open popover
  const handleOpen = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleAddUnclaimedVehicles = () => {
    resetForm();
    setEditId(null);
    setSnackbar({
      open: true,
      message: "Fill the form to add a new vehicle theft",
      severity: "info",
    });
  };

  // Validate form
  const validateForm = () => {
    const temp = {};
    if (!vehicleRtoNo.trim()) temp.vehicleRtoNo = "RTO No is required";
    if (!vehicleChassiNo.trim()) temp.vehicleChassiNo = "Chassi No is required";
    if (!vehicleColor.trim()) temp.vehicleColor = "Color is required";
    if (!vehicleModel.trim()) temp.vehicleModel = "Model is required";
    // Date/time
    if (!scheduledDateTime) {
      temp.scheduledDateTime = "Scheduled date & time required";
    } else if (new Date(scheduledDateTime) < new Date()) {
      temp.scheduledDateTime = "Date & time cannot be in the past";
    }

    // File
    if (!file && !existingFile) {
      temp.file = "File upload is required";
    } else if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        temp.file = "Only JPG, PNG, or PDF files are allowed";
      } else if (file.size > 2 * 1024 * 1024) {
        // 2MB size limit
        temp.file = "File size must be under 2MB";
      }
    }
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  // Fetch all vehicles
  const fetchUnclaimedVehicles = async (filters = {}) => {
    try {
      setLoading(true);
      const res = await axios.get(`${port}/admin_web/UnclaimedVehicle_get/`, {
        headers: { Authorization: `Bearer ${token || newToken}` },
        params: {
          ...(filters.rto_no ? { rto_no: filters.rto_no } : {}),
          ...(filters.chassi_no ? { chassi_no: filters.chassi_no } : {}),
        },
      });
      setVehicleList(res.data || []);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnclaimedVehicles();

    // Permissions
    const storedPermissions = JSON.parse(
      localStorage.getItem("permissions") || "[]"
    );
    if (!storedPermissions.length) return;

    const boloModule = storedPermissions[0].modules_submodule.find(
      (m) => m.moduleName === "BOLO"
    );
    const unclaimedSub = boloModule?.selectedSubmodules.find(
      (s) => s.submoduleName === "Unclaimed Vehicles"
    );
    unclaimedSub?.selectedActions.forEach((act) => {
      if (act.actionName === "Add") setCanAddVehicles(true);
      if (act.actionName === "Edit") setCanEditVehicles(true);
      if (act.actionName === "Delete") setCanDeleteVehicles(true);
    });
  }, []);

  // Save vehicle
  const saveUnclaimedVehicle = async () => {
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: "Fix errors before saving",
        severity: "error",
      });
      return;
    }
    const formData = new FormData();
    formData.append("rto_no", vehicleRtoNo.trim());
    formData.append("chassi_no", vehicleChassiNo.trim());
    formData.append("vehicle_color", vehicleColor.trim());
    formData.append("vehicle_model", vehicleModel.trim());
    if (file) formData.append("file_upload", file);
    formData.append("scheduled_datetime", scheduledDateTime);

    try {
      const url = editId
        ? `${port}/admin_web/UnclaimedVehicle_put/${editId}/`
        : `${port}/admin_web/UnclaimedVehicle_post/`;
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token || newToken}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to save vehicle");

      await fetchUnclaimedVehicles();
      resetForm();
      setSnackbar({
        open: true,
        message: editId ? "Vehicle updated" : "Vehicle added",
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Error saving vehicle",
        severity: "error",
      });
    }
  };

  const resetForm = () => {
    setVehicleRtoNo("");
    setVehicleChassiNo("");
    setVehicleColor("");
    setVehicleModel("");
    setScheduledDateTime("");
    setFile(null);
    setExistingFile(null);
    setEditId(null);
    setEditRowId(null);
    setErrors({});
  };

  // const handleEdit = (item) => {
  //   setEditRowId(item.id);
  //   setEditId(item.id);
  //   setVehicleRtoNo(item.rto_no);
  //   setVehicleChassiNo(item.chassi_no);
  //   setVehicleColor(item.vehicle_color);
  //   setVehicleModel(item.vehicle_model);
  //   setScheduledDateTime(item.scheduled_datetime);
  //   setExistingFile({ name: item.file_upload_name, url: item.file_upload_url });
  //   handleClose();
  // };
  const handleEdit = async (item) => {
    try {
      setEditId(item.id);
      setEditRowId(item.id); // highlight row

      const res = await axios.get(
        `${port}/admin_web/UnclaimedVehicle_put/${item.id}/`,
        {
          headers: { Authorization: `Bearer ${token || newToken}` },
        }
      );

      if (res.data) {
        const v = res.data;
        setVehicleRtoNo(item.rto_no);
        setVehicleChassiNo(item.chassi_no);
        setVehicleColor(item.vehicle_color);
        setVehicleModel(item.vehicle_model);
        setScheduledDateTime(item.scheduled_datetime);

        setExistingFile(item.file_upload || null);

        setSnackbar({
          open: true,
          message: v.message || "Vehicle details loaded successfully",
          severity: "success",
        });
      }
      setErrors({});
      handleClose();
    } catch (err) {
      setSnackbar({
        open: true,
        message:
          err.response?.data?.message ||
          err.response?.data?.detail ||
          "Failed to fetch vehicle details",
        severity: "error",
      });
    }
  };

  const handleDelete = async (item) => {
    try {
      await axios.delete(
        `${port}/admin_web/UnclaimedVehicle_delete/${item.id}/`,
        {
          headers: { Authorization: `Bearer ${token || newToken}` },
        }
      );
      setSnackbar({
        open: true,
        message: "Vehicle deleted",
        severity: "success",
      });
      fetchUnclaimedVehicles();
      handleClose();
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Error deleting vehicle",
        severity: "error",
      });
    }
  };

  // Submit handler
  const handleFilterSubmit = () => {
    fetchUnclaimedVehicles({
      rto_no: rtoNo.trim(),
      chassi_no: chassisNo.trim(),
    });
  };
  // Reset handler
  const handleReset = () => {
    setRtoNo("");
    setChassisNo("");
    fetchUnclaimedVehicles(); // default call
  };

  const labelColor = darkMode ? "#5FECC8" : "#1976d2";
  const borderColor = darkMode ? "#7F7F7F" : "#000000ff";
  const fontFamily = "Roboto, sans-serif";
  const textColor = darkMode ? "#ffffff" : "#000000";
  const bgColor = darkMode ? "202328" : "#ffffff";

  const TableDataColor = darkMode
    ? "rgba(0, 0, 0, 0.04)"
    : "rgba(255, 255, 255, 0.16)";

  const inputBgColor = darkMode
    ? "rgba(255, 255, 255, 0.16)"
    : "rgba(0, 0, 0, 0.04)";

  return (
    <Box sx={{ p: 2, marginLeft: "3rem" }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* <AccountCircleIcon sx={{ color: labelColor }} /> */}
            <Typography
              variant="h6"
              sx={{
                color: "#5FC8EC",
                fontWeight: 600,
                fontFamily,
                fontSize: 16,
                marginLeft: "1em",
              }}
            >
              List of Unclaimed Vehicles
            </Typography>
            <TextField
              placeholder="Search by RTO No, Chassis No, Model"
              value={searchQuery}
              onChange={handleSearch}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "gray", fontSize: 18 }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSearchQuery("");
                        // setFilteredResults([]);
                      }}
                    >
                      <CloseIcon fontSize="small" sx={{ color: "gray" }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                width: "200px",
                ml: 5,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "25px",
                  backgroundColor: darkMode ? "#202328" : "#fff",
                  color: darkMode ? "#fff" : "#000",
                  px: 1,
                  py: 0.2,
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: darkMode ? "#444" : "#000000ff",
                },
                "& input": {
                  color: darkMode ? "#fff" : "#000",
                  padding: "6px 8px",
                  fontSize: "13px",
                },
              }}
            />
          </Box>{" "}
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper
            sx={{
              backgroundColor: bgColor,
              p: 2,
              borderRadius: 2,
              color: textColor,
              transition: "all 0.3s ease-in-out",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Grid container spacing={2} alignItems="center" mb={2}>
              {/* Vehicle RTO No */}
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Vehicle RTO No"
                  name="rtoNo"
                  size="small"
                  fullWidth
                  value={rtoNo}
                  onChange={(e) => setRtoNo(e.target.value)}
                  sx={{
                    "& .MuiInputBase-root": { height: 40, borderRadius: 2 },
                    "& .MuiInputLabel-root": { fontSize: "0.85rem" },
                  }}
                />
              </Grid>

              {/* Vehicle Chassis No */}
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Vehicle Chassis No"
                  name="chassisNo"
                  size="small"
                  fullWidth
                  value={chassisNo}
                  onChange={(e) => setChassisNo(e.target.value)}
                  sx={{
                    "& .MuiInputBase-root": { height: 40, borderRadius: 2 },
                    "& .MuiInputLabel-root": { fontSize: "0.85rem" },
                  }}
                />
              </Grid>

              {/* Buttons */}
              <Grid item xs={12} sm={4}>
                <Box display="flex" gap={1} justifyContent="flex-end">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleFilterSubmit} // ✅ connect handler
                    sx={{
                      minHeight: 40,
                      fontSize: "0.8rem",
                      borderRadius: 2,
                      textTransform: "none",
                    }}
                  >
                    Submit
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleReset} // ✅ connect handler
                    sx={{
                      minHeight: 40,
                      fontSize: "0.8rem",
                      borderRadius: 2,
                      textTransform: "none",
                    }}
                  >
                    Reset
                  </Button>
                </Box>
              </Grid>
            </Grid>
            <TableContainer
              sx={{
                maxHeight: "50vh",
                "&::-webkit-scrollbar": { width: 6 },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: darkMode ? "#5FC8EC" : "#888",
                  borderRadius: 3,
                },
              }}
            >
              <Table stickyHeader size="small">
                <TableHead
                  sx={{
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                    background:
                      "linear-gradient(to bottom, #5FC8EC, rgb(214,223,225))",
                  }}
                >
                  <TableRow>
                    <TableHeadingCard
                      sx={{
                        color: "#000",
                        display: "flex",
                        width: "100%",
                        borderRadius: 2,
                      }}
                    >
                      {/* ID */}
                      <StyledCardContent
                        sx={{ flex: 0.4, justifyContent: "center" }}
                      >
                        <Typography variant="caption" sx={fontsTableHeading}>
                          ID
                        </Typography>
                      </StyledCardContent>

                      {/* RTO No */}
                      <StyledCardContent
                        sx={{
                          flex: 1,
                          justifyContent: "center",
                          borderLeft: "1px solid #000000ff",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={fontsTableHeading}
                          noWrap
                        >
                          RTO No
                        </Typography>
                      </StyledCardContent>

                      {/* Chassis No */}
                      <StyledCardContent
                        sx={{
                          flex: 1.5,
                          justifyContent: "center",
                          borderLeft: "1px solid #000000ff",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={fontsTableHeading}
                          noWrap
                        >
                          Chassis No
                        </Typography>
                      </StyledCardContent>

                      {/* Model */}
                      <StyledCardContent
                        sx={{
                          flex: 0.8,
                          justifyContent: "center",
                          borderLeft: "1px solid #000000ff",
                        }}
                      >
                        <Typography variant="caption" sx={fontsTableHeading}>
                          Model
                        </Typography>
                      </StyledCardContent>

                      {/* Datetime */}
                      <StyledCardContent
                        sx={{
                          flex: 1.2,
                          justifyContent: "center",
                          borderLeft: "1px solid #000000ff",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={fontsTableHeading}
                          noWrap
                        >
                          Datetime
                        </Typography>
                      </StyledCardContent>

                      {/* Action */}
                      <StyledCardContent
                        sx={{
                          flex: 0.5,
                          justifyContent: "center",
                          borderLeft: "1px solid #000000ff",
                        }}
                      >
                        <Typography variant="caption" sx={fontsTableHeading}>
                          Action
                        </Typography>
                      </StyledCardContent>
                    </TableHeadingCard>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <CircularProgress size={28} sx={{ color: "#5FC8EC" }} />
                      </TableCell>
                    </TableRow>
                  ) : paginatedData.length > 0 ? (
                    paginatedData.map((item, index) => (
                      <TableDataCardBody
                        key={index}
                        sx={{
                          bgcolor: "rgb(53 53 53)",
                          borderRadius: 2,
                          color: textColor,
                          display: "flex",
                          width: "100%",
                          border:
                            item.id === editRowId
                              ? "2px solid #5FC8EC"
                              : "1px solid transparent",
                          transition: "all 0.3s ease",
                        }}
                      >
                        {/* ID */}
                        <StyledCardContent
                          sx={{ flex: 0.4, justifyContent: "center" }}
                        >
                          <Typography variant="caption" sx={fontsTableBody}>
                            {(page - 1) * rowsPerPage + index + 1}
                          </Typography>
                        </StyledCardContent>

                        {/* RTO No */}
                        <StyledCardContent
                          sx={{ flex: 1, justifyContent: "center" }}
                        >
                          <Typography
                            variant="caption"
                            sx={fontsTableBody}
                            noWrap
                          >
                            {item.rto_no}
                          </Typography>
                        </StyledCardContent>

                        {/* Chassis No */}
                        <StyledCardContent
                          sx={{ flex: 1.5, justifyContent: "center" }}
                        >
                          <Typography
                            variant="caption"
                            sx={fontsTableBody}
                            noWrap
                          >
                            {item.chassi_no}
                          </Typography>
                        </StyledCardContent>

                        {/* Model */}
                        <StyledCardContent
                          sx={{ flex: 0.8, justifyContent: "center" }}
                        >
                          <Typography variant="caption" sx={fontsTableBody}>
                            {item.vehicle_model}
                          </Typography>
                        </StyledCardContent>

                        {/* Datetime */}
                        <StyledCardContent
                          sx={{ flex: 1.2, justifyContent: "center" }}
                        >
                          {(() => {
                            const formatted = new Date(
                              item.scheduled_datetime
                            ).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            });
                            const [date, time] = formatted.split(",");
                            return (
                              <>
                                <Typography
                                  variant="caption"
                                  sx={fontsTableBody}
                                  noWrap
                                >
                                  {date}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={fontsTableBody}
                                  noWrap
                                >
                                  {"," + time}
                                </Typography>
                              </>
                            );
                          })()}
                        </StyledCardContent>

                        {/* Action */}
                        <StyledCardContent
                          sx={{ flex: 0.5, justifyContent: "center" }}
                        >
                          <MoreHorizIcon
                            onClick={(e) => handleOpen(e, item)}
                            sx={{
                              color: "white",
                              cursor: "pointer",
                              fontSize: 14,
                            }}
                          />
                        </StyledCardContent>
                      </TableDataCardBody>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        align="center"
                        sx={{ py: 3, color: "gray" }}
                      >
                        No records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={2}
              px={1}
            >
              {/* Records Per Page */}
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" sx={{ color: textColor }}>
                  Records per page:
                </Typography>
                <Select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value));
                    setPage(1); // Reset to first page on limit change
                  }}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: "13px",
                    color: textColor,
                    borderColor: borderColor,
                    height: "30px",
                    minWidth: "70px",
                    backgroundColor: darkMode ? "#202328" : "#fff",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: borderColor,
                    },
                    "& .MuiSvgIcon-root": { color: textColor },
                  }}
                >
                  {[5, 10, 25, 50].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              {/* Page Navigation */}
              <Box
                sx={{
                  border: "1px solid #ffffff",
                  borderRadius: "6px",
                  px: 2,
                  py: 0.5,
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  color: textColor,
                  fontSize: "13px",
                  backgroundColor: darkMode ? "#202328" : "#fff",
                }}
              >
                <Box
                  onClick={() => page > 1 && setPage(page - 1)}
                  sx={{
                    cursor: page > 1 ? "pointer" : "not-allowed",
                    userSelect: "none",
                  }}
                >
                  &#8249;
                </Box>

                <Box>
                  {page}/ {Math.ceil(filteredVehicles.length / rowsPerPage)}
                </Box>

                <Box
                  onClick={() =>
                    page < Math.ceil(filteredVehicles.length / rowsPerPage) &&
                    setPage(page + 1)
                  }
                  sx={{
                    cursor:
                      page < Math.ceil(filteredVehicles.length / rowsPerPage)
                        ? "pointer"
                        : "not-allowed",
                    userSelect: "none",
                  }}
                >
                  &#8250;
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* rIght side form  */}
        <Grid item xs={12} md={5}>
          <Paper
            sx={{
              backgroundColor: bgColor,
              p: 2,
              borderRadius: 2,
              color: textColor,
              transition: "all 0.3s ease-in-out",
            }}
          >
            

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
<Typography
  variant="subtitle1"
  gutterBottom
  sx={{
    mb: 2,
    color: "#14c1ecff",
    textAlign: { xs: "center", md: "left" },
    letterSpacing: 0.5,
    fontSize: { xs: "0.95rem", md: "1.1rem" }, // ✅ slightly smaller
    fontWeight: 600,
  }}
>
  {editId
    ? "Edit Unclaimed Vehicle Details"
    : "Unclaimed Vehicle Details"}
</Typography>


              </Grid>
              <Grid item xs={12} sm={6}>
                {CanAddVehicles && (
                  <Box
                    display="flex"
                    justifyContent={{ xs: "center", md: "flex-end" }}
                    alignItems="center"
                    mb={2}
                    flexWrap="wrap"
                  >
                    <Button
  variant="contained"
  size="small"   // ✅ makes the button smaller
  startIcon={<AddCircleOutline />}
  onClick={handleAddUnclaimedVehicles}
  disabled={!editId}
  sx={{
    backgroundColor: editId
      ? "rgba(76, 175, 80, 0.9)"
      : "rgba(200, 200, 200, 0.5)",
    color: "#fff",
    textTransform: "none",
    "&:hover": {
      backgroundColor: editId
        ? "rgba(76, 175, 80, 1)"
        : "rgba(200, 200, 200, 0.5)",
    },
  }}
>
  Add New Unclaimed Vehicle
</Button>
                  </Box>
                )}
              </Grid>
              {/* Vehicle RTO No */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Vehicle RTO No"
                  value={vehicleRtoNo}
                  onChange={(e) => setVehicleRtoNo(e.target.value)}
                  error={!!errors.vehicleRtoNo}
                  helperText={errors.vehicleRtoNo}
                  sx={selectStyles}
                />
              </Grid>

              {/* Vehicle Chassi No */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Vehicle Chassi No"
                  value={vehicleChassiNo}
                  onChange={(e) => setVehicleChassiNo(e.target.value)}
                  error={!!errors.vehicleChassiNo}
                  helperText={errors.vehicleChassiNo}
                  sx={selectStyles}
                />
              </Grid>

              {/* Vehicle Color */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Vehicle Color"
                  value={vehicleColor}
                  onChange={(e) => setVehicleColor(e.target.value)}
                  error={!!errors.vehicleColor}
                  helperText={errors.vehicleColor}
                  sx={selectStyles}
                />
              </Grid>

              {/* Vehicle Model */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Vehicle Model"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  error={!!errors.vehicleModel}
                  helperText={errors.vehicleModel}
                  sx={selectStyles}
                />
              </Grid>

              {/* Upload File */}
              <Grid item xs={12} sm={6}>
                              <Button
                                variant="contained"
                                component="label"
                                fullWidth
                                sx={selectStyles}
                              >
                                {file ? "Change File" : "Upload File"}
                                <input
                                  type="file"
                                  hidden
                                  accept="image/*,.pdf"
                                  onChange={(e) => setFile(e.target.files[0])}
                                />
                              </Button>
              
                              {/* Display file name */}
                              {(file || existingFile) && (
                                <Box
                                  mt={1}
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="space-between"
                                >
                                  <Typography variant="body2" sx={{ color: "#fff" }}>
                                    {file
                                      ? file.name
                                      : existingFile.name || existingFile.split("/").pop()}
                                    {/* ✅ new file → name, else existing → name/url last part */}
                                  </Typography>
              
                                  {/* Show cancel button only if new file selected */}
                                  {file && (
                                    <Button
                                      size="small"
                                      color="error"
                                      onClick={() => setFile(null)}
                                    >
                                      Cancel
                                    </Button>
                                  )}
                                </Box>
                              )}
              
                              {errors.file && (
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#fff" }} // ✅ white text
                                >
                                  {errors.file}
                                </Typography>
                              )}
                            </Grid>

              {/* Scheduled Date & Time */}
              <Grid item xs={12} sm={6}>
                <TextField
                  type="datetime-local"
                  fullWidth
                  size="small"
                  value={scheduledDateTime}
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.scheduledDateTime}
                  helperText={errors.scheduledDateTime}
                  sx={selectStyles}
                />
              </Grid>

              {/* Buttons */}
              <Grid item xs={12} display="flex" justifyContent="center" gap={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={saveUnclaimedVehicle} // ✅ validation first
                >
                  {editId ? "Update" : "Submit"}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this vehicle? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            color="primary"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleDelete(itemToDelete);
              setDeleteDialogOpen(false);
            }}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* popover for actions */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <Box sx={{ p: 1, display: "flex", flexDirection: "column", gap: 1 }}>
          {canEditVehicles && (
            <Button size="small" onClick={() => handleEdit(selectedItem)}>
              Edit
            </Button>
          )}
          {canDeleteVehicles && (
            <Button
              size="small"
              color="error"
              onClick={() => {
                setItemToDelete(selectedItem);
                setDeleteDialogOpen(true); // open confirmation dialog
                handleClose(); // close popover
              }}
            >
              Delete
            </Button>
          )}
        </Box>
      </Popover>
    </Box>
  );
};

export default UnclaimedVehicles;
