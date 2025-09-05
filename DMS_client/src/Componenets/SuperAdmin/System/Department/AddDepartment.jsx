import React, { use, useEffect, useMemo } from "react";
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
import { useState } from "react";
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

const AddDepartment = ({ darkMode, flag, setFlag, setSelectedIncident }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  console.log(anchorEl, "anchorEl");

  const port = import.meta.env.VITE_APP_API_KEY;
  const { newToken } = useAuth();
  const Department = localStorage.getItem("user_Department");
  const token = localStorage.getItem("access_token");
  const {
    states,
    districts,
    Tehsils,
    Citys,
    selectedStateId,
    setSelectedStateId,
    setSelectedDistrictId,
    selectedDistrictId,
    selectedTehsilId,
    setSelectedTehsilId,
    selectedCityID,
    setSelectedCityId,
  } = useAuth();

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const selectStyles = getCustomSelectStyles(isDarkMode);
  const open = Boolean(anchorEl);

  const navigate = useNavigate();
  const userName = localStorage.getItem("userId");
  console.log(userName, "userName");

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedDisasterId, setSelectedDisasterId] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [departments, setDepartments] = useState([]);
  const [allEditData, setAllEditData] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteDepId, setDeleteDepId] = useState(null);

  const [page, setPage] = useState(1);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deptId, setDeptId] = useState(null);
  const [deptFetchId, setDeptFetchId] = useState(null);
  console.log(deptFetchId, "deptFetchId");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [disasterList, setDisasterList] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [stateError, setStateError] = useState(false);
  const [districtError, setDistrictError] = useState(false);
  const [tehsilError, setTehsilError] = useState(false);
  const [cityError, setCityError] = useState(false);
  const [disasterError, setDisasterError] = useState(false);
  const [departmentError, setDepartmentError] = useState(false);
  const [departmentErrorMsg, setDepartmentErrorMsg] = useState("");
  const [snackbarmsgAddDept, setSnackbarMessageAdded] = useState("");
  const [snackbarupdate, setSnackbarMessageUpdated] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isNewEntry, setIsNewEntry] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const [editRowId, setEditRowId] = useState(null);
  const [error, setError] = useState(null);

  const labelColor = darkMode ? "#5FECC8" : "#1976d2";
  const borderColor = darkMode ? "#7F7F7F" : "#ccc";
  const fontFamily = "Roboto, sans-serif";
  const textColor = darkMode ? "#ffffff" : "#000000";
  const bgColor = darkMode ? "202328" : "#ffffff";

  const TableDataColor = darkMode
    ? "rgba(0, 0, 0, 0.04)"
    : "rgba(255, 255, 255, 0.16)";

  const inputBgColor = darkMode
    ? "rgba(255, 255, 255, 0.16)"
    : "rgba(0, 0, 0, 0.04)";

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // or "error"
  });

  const searchData = [
    ...departments.map((dep) => ({ label: dep.dep_name, type: "Department" })),
    ...states.map((st) => ({ label: st.state_name, type: "State" })),
    ...districts.map((dist) => ({
      label: dist.district_name,
      type: "District",
    })),
    ...Tehsils.map((teh) => ({ label: teh.tehsil_name, type: "Tehsil" })),
    ...Citys.map((city) => ({ label: city.city_name, type: "City" })),
  ];

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (!value) {
      setSuggestions([]);
      setFilteredResults([]); // Clear the results if input is empty
      return;
    }

    const filtered = searchData.filter((item) =>
      item.label.toLowerCase().includes(value.toLowerCase())
    );

    setSuggestions(filtered);
    setFilteredResults(filtered); // ← Show matched results directly
  };

  const handleOpen = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleEdit = async (selectedItem) => {
    const depId = selectedItem.dep_id;
    console.log("Editing Department ID:", depId);
    setDeptFetchId(depId);
    setEditRowId(depId); // Set selected row for border
    // setSelectedItem(selectedItem); // if used for Popover

    try {
      const res = await axios.get(
        `${port}/admin_web/Department_get_idwise/${depId}`,
        {
          headers: {
            Authorization: `Bearer ${token || newToken}`,
          },
        }
      );
      console.log(
        `Fetching ID Wise Data`,
        res.data[0].dep_name,
        res.data[0].state_id,
        res.data[0].dis_id,
        res.data[0].tah_id,
        res.data[0].cit_id,
        res.data[0].disaster_id
      );
      setIsEditMode(true); // This enables buttons that depend on isEditMode
      setAllEditData(res.data);
      console.log("dddddd", res.data);

      setDepartmentName(res.data[0].dep_name || "");
      setSelectedStateId(res.data[0].state_id || "");
    } catch (err) {
      console.error("Error fetching department data:", err);

      setError(err);
    }
  };

  const handleUpdate = async () => {
    const payload = {
      dep_name: departmentName,
      state_id: selectedStateId,
      dis_id: selectedDistrictId,
      tah_id: selectedTehsilId,
      cit_id: selectedCityID,
      disaster_id: selectedDisasterId,
      dep_modified_by: userName,
    };

    try {
      const response = await fetch(
        `${port}/admin_web/department_put/${deptFetchId}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || newToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const resData = await response.json();
        console.log("Updated Department:", resData);

        // Refresh department list
        await fetchDepartments();

        // Show snackbar
        setSnackbarMessageUpdated("Department updated successfully!");

        // Clear form
        setDepartmentName("");
        setSelectedStateId("");
        setSelectedDistrictId("");
        setSelectedTehsilId("");
        setSelectedCityId("");
        setSelectedDisasterId("");

        // Exit edit mode
        setIsEditMode(false);
        setEditId(null);

        // Auto hide snackbar
        setTimeout(() => setShowSuccessAlert(false), 3000);
      } else {
        const errorData = await response.json();
        console.error("Update failed:", errorData);
        snackbarMessage("Failed to update department.");
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  // Set District after districts are loaded
  useEffect(() => {
    if (isEditMode && selectedStateId && allEditData.length > 0) {
      const disId = allEditData[0]?.dis_id;
      if (districts.find((d) => d.dis_id === disId)) {
        setSelectedDistrictId(disId);
      }
    }
  }, [districts, selectedStateId]);

  useEffect(() => {
    if (isEditMode && selectedDistrictId && allEditData.length > 0) {
      const tahId = allEditData[0]?.tah_id;
      if (Tehsils.find((t) => t.tah_id === tahId)) {
        setSelectedTehsilId(tahId);
      }
    }
  }, [Tehsils, selectedDistrictId]);

  useEffect(() => {
    if (isEditMode && selectedTehsilId && allEditData.length > 0) {
      const citId = allEditData[0]?.cit_id;
      if (Citys.find((c) => c.cit_id === citId)) {
        setSelectedCityId(citId);
      }
    }
  }, [Citys, selectedTehsilId]);

  useEffect(() => {
    if (isEditMode && allEditData.length > 0) {
      const disasterId = allEditData[0]?.disaster_id;
      const foundDisaster = disasterList.find(
        (d) => d.disaster_id === disasterId
      );
      if (foundDisaster) {
        setSelectedDisasterId(disasterId);
      }
    }
  }, [isEditMode, allEditData, disasterList]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const filteredDepartments = useMemo(() => {
    if (!searchQuery) return departments;
    const query = searchQuery.toLowerCase();

    return departments.filter(
      (item) =>
        item.dep_name?.toLowerCase().includes(query) ||
        item.state_name?.toLowerCase().includes(query) ||
        item.dst_name?.toLowerCase().includes(query) ||
        item.tah_name?.toLowerCase().includes(query) ||
        item.city_name?.toLowerCase().includes(query)
    );
  }, [departments, searchQuery]);

  const paginatedData = useMemo(() => {
    if (!filteredDepartments?.length) return [];

    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredDepartments.slice(start, end);
  }, [page, rowsPerPage, filteredDepartments]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${port}/admin_web/Department_get/`, {
        headers: {
          Authorization: `Bearer ${token || newToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
        console.log("Departments fetched:", data);
      } else {
        const errorText = await response.text();
        console.error(
          "Failed to fetch departments:",
          response.status,
          errorText
        );
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Call on component mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  const saveDepartment = async (e) => {
    if (e) e.preventDefault(); // Prevent form refresh

    // Field validations
    setDepartmentError(false);
    setDepartmentErrorMsg("");
    setStateError(false);
    setDistrictError(false);
    setTehsilError(false);
    setCityError(false);
    setDisasterError(false);
    let isValid = true;

    if (!departmentName.trim()) {
      setDepartmentError(true);
      // setDepartmentErrorMsg("Department name is required.");
      isValid = false;
    }

    if (!selectedStateId) {
      setStateError(true);
      isValid = false;
    }

    if (!selectedDistrictId) {
      setDistrictError(true);
      isValid = false;
    }

    if (!selectedTehsilId) {
      setTehsilError(true);
      isValid = false;
    }

    if (!selectedCityID) {
      setCityError(true);
      isValid = false;
    }

    if (!selectedDisasterId) {
      setDisasterError(true);
      isValid = false;
    }

    if (!isValid) return; // Stop submission if any validation fails

    const payload = {
      dep_name: departmentName,
      state_id: selectedStateId,
      dis_id: selectedDistrictId,
      tah_id: selectedTehsilId,
      cit_id: selectedCityID,
      disaster_id: selectedDisasterId,
      dep_modified_by: userName,
      dep_added_by: userName,
    };

    console.log("Payload before POST:", payload);

    try {
      const response = await fetch(`${port}/admin_web/department_post/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || newToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const resData = await response.json();
        console.log("Department saved:", resData);

        await fetchDepartments(); // Refresh department list
        setSnackbarMessageAdded("Department added successfully!");
        setShowSuccessAlert(true);
        setTimeout(() => setShowSuccessAlert(false), 3000);

        // ✅ Clear form fields
        setDepartmentName("");
        setSelectedDisasterId("");
        setSelectedStateId("");
        setSelectedDistrictId("");
        setSelectedTehsilId("");
        setSelectedCityId("");

        // ✅ Clear errors
        setDepartmentError(false);
        setDepartmentErrorMsg("");
        setStateError(false);
        setDistrictError(false);
        setTehsilError(false);
        setCityError(false);
        setDisasterError(false);

        setDeptId(null);
      } else {
        const errorData = await response.json();
        if (
          errorData?.detail === "Department with this dep_name already exists."
        ) {
          setDepartmentError(true);
          // setDepartmentErrorMsg("Department name already exists.");
        } else {
          console.error("Failed to save department:", errorData);
        }
      }
    } catch (error) {
      console.error("Error posting department:", error);
    }
  };

  useEffect(() => {
    const fetchDisasters = async () => {
      try {
        const response = await fetch(
          `${port}/admin_web/DMS_Disaster_Type_Get/`,
          {
            headers: {
              Authorization: `Bearer ${token || newToken}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setDisasterList(data);
        } else {
          console.error("Failed to fetch disaster types");
        }
      } catch (error) {
        console.error("Error fetching disasters:", error);
      }
    };

    fetchDisasters();
  }, []);

  const handleDelete = async () => {
    try {
      const res = await axios.delete(
        `${port}/admin_web/department_delete/${deleteDepId}/`,
        {
          headers: {
            Authorization: `Bearer ${token || newToken}`,
          },
        }
      );

      console.log("Delete success:", res.data);
      setDepartments((prev) =>
        prev.filter((item) => item.dep_id !== deleteDepId)
      );
      setSnackbarMessage("Department deleted successfully.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setOpenDeleteDialog(false);
      setDeleteDepId(null);
      handleClose(); // close popover
    } catch (err) {
      console.error("Error deleting department:", err);
      setSnackbarMessage("Failed to delete department. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setOpenDeleteDialog(false);
    }
  };

  const handleAddNewDepartment = () => {
    // Clear all form fields
    setDepartmentName("");
    setSelectedDisasterId("");
    setSelectedStateId("");

    setSelectedDistrictId("");
    setSelectedTehsilId("");
    setSelectedCityId("");

    // Clear validation errors
    setDepartmentError(false);
    setDepartmentErrorMsg("");
    setStateError(false);
    setDistrictError(false);
    setTehsilError(false);
    setCityError(false);
    setDisasterError(false);

    // Exit edit mode and reset edit ID
    setIsEditMode(false);
    setEditId(null);
    setDeptId(null); // if used
    setIsNewEntry(true);
  };

  const validateForm = () => {
    let isValid = true;

    if (!departmentName.trim()) {
      setDepartmentError(true);
      setDepartmentErrorMsg("Please enter department name");
      isValid = false;
    }

    if (!selectedStateId) {
      setStateError(true);
      isValid = false;
    }

    if (!selectedDistrictId) {
      setDistrictError(true);
      isValid = false;
    }

    if (!selectedTehsilId) {
      setTehsilError(true);
      isValid = false;
    }

    if (!selectedCityID) {
      setCityError(true);
      isValid = false;
    }

    if (!selectedDisasterId) {
      setDisasterError(true);
      isValid = false;
    }

    return isValid;
  };

  useEffect(() => {
    if (selectedStateId && isNewEntry) {
      // fetchDistricts(selectedStateId);
    }
  }, [selectedStateId, isNewEntry]);

  // localStorage se check karne ke liye function
  const hasPermission = (moduleName, submoduleName, actionName) => {
    const stored = localStorage.getItem("permissions");
    console.log("Stored permissions:", stored);

    if (!stored) {
      console.log("No permissions found in localStorage.");
      return false;
    }

    const permissions = JSON.parse(stored);
    console.log("Parsed permissions:", permissions);

    // Module find karo
    const module = permissions[0]?.modules_submodule.find(
      (m) => m.moduleName === moduleName
    );
    console.log(`Looking for module "${moduleName}":`, module);
    if (!module) {
      console.log(`Module "${moduleName}" not found.`);
      return false;
    }

    // Submodule find karo
    const submodule = module.selectedSubmodules.find(
      (s) => s.submoduleName === submoduleName
    );
    console.log(`Looking for submodule "${submoduleName}":`, submodule);
    if (!submodule) {
      console.log(`Submodule "${submoduleName}" not found.`);
      return false;
    }

    // Action find karo
    const hasAction = submodule.selectedActions.some(
      (a) => a.actionName === actionName
    );
    console.log(`Checking action "${actionName}":`, hasAction);

    return hasAction;
  };

  const [newDepartment, setNewDepartment] = useState(false);
  const [deleteDepartments, setDeleteDepartments] = useState(false);
  const [editDepartment, setEditDepartment] = useState(false);

  useEffect(() => {
    const storedPermissions = JSON.parse(localStorage.getItem("permissions"));

    if (storedPermissions && storedPermissions.length > 0) {
      const modules = storedPermissions[0].modules_submodule;
      console.log("modules_submodule:", modules);

      const systemUserModule = modules.find(
        (mod) => mod.moduleName === "System User"
      );

      if (systemUserModule) {
        const addDepartmentSubmodule = systemUserModule.selectedSubmodules.find(
          (sub) => sub.submoduleName === "Add Department"
        );

        if (addDepartmentSubmodule) {
          addDepartmentSubmodule.selectedActions?.forEach((act) => {
            if (act.actionName === "Add New Department") {
              setNewDepartment(true);
            }
            if (act.actionName === "Delete") {
              setDeleteDepartments(true);
            }
            if (act.actionName === "Edit") {
              setEditDepartment(true);
            }
          });
        }
      }
    }
  }, []);

  return (
    <Box sx={{ p: 2, marginLeft: "3rem" }}>
      <Snackbar
        open={Boolean(snackbarmsgAddDept)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        autoHideDuration={3000}
        onClose={() => setSnackbarMessageAdded(null)}
        message={snackbarmsgAddDept}
      />
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
              Add Department
            </Typography>
            <TextField
              placeholder="Search by name"
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
                        setFilteredResults([]);
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
                  borderColor: darkMode ? "#444" : "#ccc",
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
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeadingCard
                      sx={{
                        color: "#000",
                        display: "flex",
                        width: "100%",
                        borderRadius: 2,
                        position: "sticky",
                        bgcolor:
                          "linear-gradient(to bottom, #5FC8EC,rgb(214, 223, 225))",
                        // p: 1,
                      }}
                    >
                      <StyledCardContent
                        sx={{
                          flex: 0.3,
                          borderRight: "1px solid black",
                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="subtitle2" sx={fontsTableHeading}>
                          Sr. No
                        </Typography>
                      </StyledCardContent>
                      <StyledCardContent
                        sx={{
                          flex: 2.5,
                          borderRight: "1px solid black",
                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="subtitle2" sx={fontsTableHeading}>
                          Department Name
                        </Typography>
                      </StyledCardContent>
                      {/* <StyledCardContent
                        sx={{
                          flex: 1.2,
                          borderRight: "1px solid black",
                          justifyContent: "center",
                          ...fontsTableHeading,
                        }}
                      >
                        <Typography variant="subtitle2">Disaster ID</Typography>
                      </StyledCardContent> */}
                      <StyledCardContent
                        sx={{
                          flex: 1,
                          borderRight: "1px solid black",
                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="subtitle2" sx={fontsTableHeading}>
                          State
                        </Typography>
                      </StyledCardContent>
                      <StyledCardContent
                        sx={{
                          flex: 0.6,
                          borderRight: "1px solid black",
                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="subtitle2" sx={fontsTableHeading}>
                          District
                        </Typography>
                      </StyledCardContent>
                      {/* <StyledCardContent
                        sx={{
                          flex: 1,
                          borderRight: "1px solid black",
                          justifyContent: "center",
                          ...fontsTableHeading,
                        }}
                      >
                        <Typography variant="subtitle2">Tehsil</Typography>
                      </StyledCardContent> */}
                      {/* <StyledCardContent
                        sx={{
                          flex: 1,
                          justifyContent: "center",
                          borderRight: "1px solid black",
                          ...fontsTableHeading,
                        }}
                      >
                        <Typography variant="subtitle2">City</Typography>
                      </StyledCardContent> */}
                      <StyledCardContent
                        sx={{
                          flex: 0.4,
                          justifyContent: "center",
                          ...fontsTableHeading,
                        }}
                      >
                        <Typography variant="subtitle2" sx={fontsTableHeading}>
                          Actions
                        </Typography>
                      </StyledCardContent>
                    </TableHeadingCard>
                  </TableRow>
                </TableHead>

                <TableBody
                  sx={{
                    display: "block",
                    maxHeight: "50vh",
                    overflowY: "auto",
                    scrollBehavior: "smooth",
                    width: "100%",
                    "&::-webkit-scrollbar": {
                      width: "6px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: darkMode ? "#5FC8EC" : "#888",
                      borderRadius: 3,
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                      backgroundColor: darkMode ? "#5FC8EC" : "#555",
                    },
                  }}
                >
                  {" "}
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <CircularProgress size={30} sx={{ color: "#5FC8EC" }} />
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData
                      // .slice((page - 1) * rowsPerPage, page * rowsPerPage)
                      .map((item, index) => (
                        <TableDataCardBody
                          key={index}
                          sx={{
                            bgcolor: "rgb(53 53 53)",
                            borderRadius: 2,
                            color: textColor,
                            display: "flex",
                            width: "100%",
                            border:
                              item.dep_id === editRowId
                                ? "2px solid #5FC8EC"
                                : "1px solid transparent",

                            transition: "all 0.3s ease",
                          }}
                        >
                          <StyledCardContent
                            sx={{
                              flex: 0.8,
                              justifyContent: "center",
                            }}
                          >
                            <Typography variant="subtitle2" sx={fontsTableBody}>
                              {(page - 1) * rowsPerPage + index + 1}
                            </Typography>
                          </StyledCardContent>

                          <StyledCardContent
                            sx={{
                              flex: 2.5,
                              justifyContent: "center",
                              alignItems: "center",
                              display: "flex",
                              minWidth: 0,
                            }}
                          >
                            <Tooltip
                              title={item.dep_name || "No Department Name"}
                              arrow
                              placement="top"
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  maxWidth: 150,
                                  ...fontsTableBody,
                                }}
                              >
                                {item.dep_name && item.dep_name.length > 35
                                  ? item.dep_name.slice(0, 35) + "..."
                                  : item.dep_name || "No Department Name"}
                              </Typography>
                            </Tooltip>
                          </StyledCardContent>

                          {/* <StyledCardContent
                            sx={{
                              flex: 1.5,
                              justifyContent: "center",
                              ...fontsTableBody,
                            }}
                          >
                            <Typography variant="subtitle2">
                              {item.disaster}
                            </Typography>
                          </StyledCardContent> */}
                          <StyledCardContent
                            sx={{
                              flex: 0.8,
                              justifyContent: "center",
                            }}
                          >
                            <Typography variant="subtitle2" sx={fontsTableBody}>
                              {item.state_name}
                            </Typography>
                          </StyledCardContent>
                          <StyledCardContent
                            sx={{
                              flex: 0.8,
                              justifyContent: "center",
                            }}
                          >
                            <Typography variant="subtitle2" sx={fontsTableBody}>
                              {item.dst_name}
                            </Typography>
                          </StyledCardContent>

                          {/* <StyledCardContent
                            sx={{
                              flex: 0.8,
                              justifyContent: "center",
                              ...fontsTableBody,
                            }}
                          >
                            <Typography variant="subtitle2">
                              {item.tah_name}
                            </Typography>
                          </StyledCardContent> */}
                          {/* <StyledCardContent
                            sx={{
                              flex: 1.3,
                              justifyContent: "center ",
                              ...fontsTableBody,
                            }}
                          >
                            <Typography variant="subtitle2">
                              {item.city_name}
                            </Typography>
                          </StyledCardContent> */}
                          <StyledCardContent
                            sx={{
                              flex: 0.3,
                              justifyContent: "center",
                            }}
                          >
                            <MoreHorizIcon
                              onClick={(e) => handleOpen(e, item)}
                              sx={{
                                color: "white",
                                cursor: "pointer",
                                // fontSize: 35,
                                justifyContent: "center",
                                fontSize: 14,
                                ...fontsTableBody,
                              }}
                            />
                          </StyledCardContent>

                          {(editDepartment || deleteDepartments) && (
                            <Popover
                              open={open}
                              anchorEl={anchorEl}
                              onClose={handleClose}
                              anchorOrigin={{
                                vertical: "center",
                                horizontal: "right",
                              }}
                              transformOrigin={{
                                vertical: "center",
                                horizontal: "left",
                              }}
                              PaperProps={{
                                sx: {
                                  p: 2,
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 1.5,
                                  borderRadius: 2,
                                  minWidth: 120,
                                },
                              }}
                            >
                              {editDepartment && (
                                <Button
                                  fullWidth
                                  variant="outlined"
                                  color="warning"
                                  startIcon={
                                    <EditOutlined
                                      sx={{
                                        fontSize: "14px",
                                        alignItems: "center",
                                      }}
                                    />
                                  }
                                  onClick={() => handleEdit(selectedItem)}
                                  sx={{
                                    textTransform: "none",
                                    fontSize: "14px",
                                  }}
                                >
                                  Edit
                                </Button>
                              )}

                              {deleteDepartments && (
                                <Button
                                  fullWidth
                                  variant="outlined"
                                  color="error"
                                  startIcon={
                                    <DeleteOutline
                                      sx={{
                                        fontSize: "14px",
                                        alignItems: "center",
                                      }}
                                    />
                                  }
                                  onClick={() => {
                                    setDeleteDepId(selectedItem.dep_id);
                                    setOpenDeleteDialog(true);
                                  }}
                                  sx={{
                                    textTransform: "none",
                                    fontSize: "14px",
                                  }}
                                >
                                  Delete
                                </Button>
                              )}
                            </Popover>
                          )}

                          <Snackbar
                            open={snackbarOpen}
                            autoHideDuration={3000}
                            onClose={() => setSnackbarOpen(false)}
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "center",
                            }}
                          >
                            <Alert
                              onClose={() => setSnackbarOpen(false)}
                              severity={snackbarSeverity}
                              variant="filled"
                              sx={{ width: "100%" }}
                            >
                              {snackbarMessage}
                            </Alert>
                          </Snackbar>
                        </TableDataCardBody>
                      ))
                  )}
                </TableBody>
              </Table>
              <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                maxWidth="xs"
                fullWidth
              >
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                  <Typography>
                    Are you sure you want to delete this department?
                  </Typography>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setOpenDeleteDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDelete}
                    color="error"
                    variant="contained"
                  >
                    Delete
                  </Button>
                </DialogActions>
              </Dialog>
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
                  {page}/ {Math.ceil(filteredDepartments.length / rowsPerPage)}
                </Box>

                <Box
                  onClick={() =>
                    page <
                    Math.ceil(filteredDepartments.length / rowsPerPage) &&
                    setPage(page + 1)
                  }
                  sx={{
                    cursor:
                      page < Math.ceil(filteredDepartments.length / rowsPerPage)
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
            {newDepartment && (
              <Box
                display="flex"
                justifyContent={{ xs: "center", md: "flex-end" }}
                alignItems="center"
                mb={2}
                flexWrap="wrap"
              >
                {hasPermission("System User", "Add Department", "Add New  Department") && (
                  <Button
                    variant="contained"
                    startIcon={<AddCircleOutline />}
                    disabled={!isEditMode}
                    onClick={handleAddNewDepartment}
                    sx={{
                      backgroundColor: "rgba(223,76,76, 0.8)",
                      color: "#fff",
                      fontWeight: 600,
                      fontFamily: "Roboto",
                      textTransform: "none",
                      px: 1,
                      py: 1,
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      "&:hover": {
                        backgroundColor: "rgba(223,76,76, 0.8)",
                      },
                    }}
                  >
                    Add New Department
                  </Button>
                )}
              </Box>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Department Name"
                  value={departmentName}
                  onChange={(e) => {
                    const onlyLetters = e.target.value.replace(
                      /[^a-zA-Z\s]/g,
                      ""
                    );
                    setDepartmentName(onlyLetters);
                    setDepartmentError(false);
                    setDepartmentErrorMsg("");
                  }}
                  error={departmentError}
                  helperText={departmentErrorMsg}
                  InputLabelProps={{ shrink: false }}
                  sx={selectStyles}
                ></TextField>
                {departmentError && (
                  <FormHelperText
                    error
                    sx={{
                      marginLeft: "14px",
                      marginTop: "3px",
                      fontSize: "0.75rem",
                    }}
                  >
                    {departmentErrorMsg || "Please enter a department name"}
                  </FormHelperText>
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <Select
                  value={selectedStateId}
                  onChange={(e) => {
                    setSelectedStateId(e.target.value);
                    setStateError(false);
                    setIsNewEntry(false);
                  }}
                  size="small"
                  fullWidth
                  error={stateError}
                  displayEmpty
                  inputProps={{ "aria-label": "Select State" }}
                  sx={selectStyles}
                >
                  <MenuItem value="" disabled>
                    <em>Select State</em>
                  </MenuItem>
                  {states.map((state) => (
                    <MenuItem key={state.state_id} value={state.state_id}>
                      {state.state_name}
                    </MenuItem>
                  ))}
                </Select>

                {stateError && (
                  <FormHelperText
                    error
                    sx={{
                      marginLeft: "14px",
                      marginTop: "3px",
                      fontSize: "0.75rem",
                    }}
                  >
                    Please select a state
                  </FormHelperText>
                )}
              </Grid>

              {/* District - Dropdown */}
              <Grid item xs={12} sm={6}>
                <Select
                  value={selectedDistrictId}
                  onChange={(e) => {
                    setSelectedDistrictId(e.target.value);
                    setDistrictError(false);
                  }}
                  fullWidth
                  size="small"
                  error={districtError}
                  helperText={districtError ? "Please select a district" : ""}
                  displayEmpty
                  inputProps={{ "aria-label": "Select District" }}
                  disabled={!selectedStateId}
                  sx={selectStyles}
                >
                  <MenuItem value="" disabled>
                    Select District
                  </MenuItem>
                  {districts.map((d) => (
                    <MenuItem key={d.dis_id} value={d.dis_id}>
                      {d.dis_name}
                    </MenuItem>
                  ))}
                </Select>
                {districtError && (
                  <FormHelperText
                    error
                    sx={{
                      marginLeft: "14px",
                      marginTop: "3px",
                      fontSize: "0.75rem",
                    }}
                  >
                    Please select a district
                  </FormHelperText>
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <Select
                  value={selectedTehsilId}
                  onChange={(e) => {
                    setSelectedTehsilId(e.target.value);
                    setTehsilError(false);
                  }}
                  fullWidth
                  error={tehsilError}
                  helperText={tehsilError ? "Please select a tehsil" : ""}
                  displayEmpty
                  inputProps={{ "aria-label": "Select Tehsil" }}
                  sx={selectStyles}
                >
                  <MenuItem value="" disabled>
                    Select Tehsil
                  </MenuItem>
                  {Tehsils.map((t) => (
                    <MenuItem key={t.tah_id} value={t.tah_id}>
                      {t.tah_name}
                    </MenuItem>
                  ))}
                </Select>
                {tehsilError && (
                  <FormHelperText
                    error
                    sx={{
                      marginLeft: "14px",
                      marginTop: "3px",
                      fontSize: "0.75rem",
                    }}
                  >
                    Please select a tehsil
                  </FormHelperText>
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <Select
                  value={selectedCityID}
                  onChange={(e) => {
                    setSelectedCityId(e.target.value);
                    setCityError(false);
                  }}
                  fullWidth
                  error={cityError}
                  helperText={cityError ? "Please select a city" : ""}
                  displayEmpty
                  inputProps={{ "aria-label": "Select City" }}
                  sx={selectStyles}
                >
                  <MenuItem value="" disabled>
                    Select City
                  </MenuItem>
                  {Citys.map((city) => (
                    <MenuItem key={city.cit_id} value={city.cit_id}>
                      {city.cit_name}
                    </MenuItem>
                  ))}
                </Select>
                {cityError && (
                  <FormHelperText
                    error
                    sx={{
                      marginLeft: "14px",
                      marginTop: "3px",
                      fontSize: "0.75rem",
                    }}
                  >
                    Please select a city
                  </FormHelperText>
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <Select
                  value={selectedDisasterId}
                  onChange={(e) => {
                    setSelectedDisasterId(e.target.value);
                    setDisasterError(false);
                  }}
                  error={disasterError}
                  helperText={disasterError ? "Please select a disaster" : ""}
                  displayEmpty
                  fullWidth
                  inputProps={{ "aria-label": "Select Disaster" }}
                  sx={selectStyles}
                >
                  <MenuItem value="" disabled>
                    Select Disaster
                  </MenuItem>
                  {disasterList.map((d) => (
                    <MenuItem key={d.disaster_id} value={d.disaster_id}>
                      {d.disaster_name}
                    </MenuItem>
                  ))}
                </Select>
                {disasterError && (
                  <FormHelperText
                    error
                    sx={{
                      marginLeft: "14px",
                      marginTop: "3px",
                      fontSize: "0.75rem",
                    }}
                  >
                    Please select a disaster
                  </FormHelperText>
                )}
              </Grid>

              <Grid item xs={12}>
                {isEditMode ? (
                  <Box display="flex" gap={2} mt={2}>
                    <Button
                      color="warning"
                      sx={{
                        mt: 1,
                        width: "40%",
                        backgroundColor: "rgba(18,166,95, 0.8)",
                        color: "#fff",
                        textTransform: "none",
                        fontWeight: "600",
                        fontFamily: "Roboto",
                        borderRadius: "12px",
                        mx: "auto",
                        display: "block",
                      }}
                      onClick={() => handleUpdate(editId)}
                    >
                      Update
                    </Button>
                  </Box>
                ) : (
                  <>
                    {newDepartment && (
                      <Button
                        color="warning"
                        sx={{
                          mt: 2,
                          width: "40%",
                          backgroundColor: "rgba(18,166,95, 0.8)",
                          color: "#fff",
                          fontWeight: "600",
                          fontFamily: "Roboto",
                          textTransform: "none",
                          borderRadius: "12px",
                          mx: "auto",
                          display: "block",
                        }}
                        onClick={saveDepartment}
                      >
                        Submit
                      </Button>
                    )}
                  </>
                )}
              </Grid>
              <Snackbar
                open={snackbarupdate}
                autoHideDuration={3000}
                onClose={() => setSnackbarMessageUpdated(false)}
                message={snackbarupdate}
              />
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddDepartment;
