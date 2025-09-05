import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tooltip,
  IconButton,
  Popper,
  MenuItem,
  Select,
  TextField,
  Button,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Popover,
  TableContainer,
  TableHead,
  Table,
  TableRow,
  TablePagination,
  Autocomplete,
  FormHelperText,
} from "@mui/material";
import {
  Visibility,
  EditOutlined,
  DeleteOutline,
  AddCircleOutline,
} from "@mui/icons-material";
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
import { useTheme } from "@mui/material/styles";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useAuth } from "../../../../Context/ContextAPI";
import { useLocation } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { Avatar } from "@mui/material";
import PreviewIcon from "@mui/icons-material/Preview";
import DeleteIcon from "@mui/icons-material/Delete";

const MissingPerson = () => {
  const port = import.meta.env.VITE_APP_API_KEY;
  // const Department = localStorage.getItem("user_Department");
  const token = localStorage.getItem("access_token");
  const {
    newToken,
    responderScope,
    setDisasterIncident,
    disaster,
    popupText,
    setPopupText,
    lattitude,
    setLattitude,
    longitude,
    setLongitude,
    suggestions,
    setQuery,
    setSuggestions,
  } = useAuth();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const darkMode = true;
  const location = useLocation();

  const selectStyles = getCustomSelectStyles(isDarkMode);
  const { handleSearchChange, handleSelectSuggestion, query } = useAuth();

  const labelColor = darkMode ? "#5FECC8" : "#1976d2";
  const borderColor = darkMode ? "#7F7F7F" : "#ccc";
  const fontFamily = "Roboto, sans-serif";
  const textColor = darkMode ? "#ffffff" : "#000000";
  const bgColor = darkMode ? "202328" : "#ffffff";

  const [fieldErrors, setFieldErrors] = useState({});
  const [nameEror, setNameError] = useState(false);
  const [NameErrorMsg, setNameErrorMsg] = useState("");
  const [ageError, setAgeError] = useState(false);
  const [genderError, setGenderError] = useState(false);
  const [vitalsError, setVitalsError] = useState(false);
  const [identificationMarksError, setIdentificationMarksError] =
    useState(false);
  const [contactNoError, setContactNoError] = useState(false);
  const [addressError, setAddressError] = useState(false);
  const [datetimeError, setDatetimeError] = useState(false);
  const [fileError, setFileError] = useState(false);

  const [addressErrorMsg, setAddressErrorMsg] = useState("");
  const [datetimeErrorMsg, setDatetimeErrorMsg] = useState("");
  const [fileErrorMsg, setFileErrorMsg] = useState("");
  const [contactNoErrorMsg, setContactNoErrorMsg] = useState("");
  const [ageErrorMsg, setAgeErrorMsg] = useState("");
  const [genderErrorMsg, setGenderErrorMsg] = useState("");
  const [vitalsErrorMsg, setVitalsErrorMsg] = useState("");
  const [identificationMarksErrorMsg, setIdentificationMarksErrorMsg] =
    useState("");
  const [isValid, setIsValid] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  // Filter state
  const [filters, setFilters] = useState({ personName: "", age: "" });
  const [filteredRows, setFilteredRows] = useState();
  // --- add near your other useState hooks ---
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [personName, setpersonName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  const [file, setFile] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [vitals, setVitals] = useState("");
  const [identificationMarks, setIdentificationMarks] = useState("");
  const [datetime, setDatetime] = useState("");
  const [schedules, setSchedules] = useState("");
  const [address, setAddress] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [deleteDepId, setDeleteDepId] = useState(null);
  const [existingFileName, setExistingFileName] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleClose = () => {
    setFormData({
      name: "",
      age: "",
      gender: "",
      vitals: "",
      identificationMarks: "",
      file: null,
      schedules: "",
      date: "",
      time: "",
    });
  };

  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setExistingFileName(""); // clear backend file if new upload
    }
  };

  const getPreviewUrl = () => {
    if (file) {
      return URL.createObjectURL(file); // ✅ works for new upload
    }
    if (existingFileName) {
      return `${port}${existingFileName}`; // ✅ works for edit mode
    }
    return null;
  };

  // Handle filter submit
  const handleFilterSubmit = () => {
    let newData = rows;

    if (filters.personName) {
      newData = newData.filter((row) =>
        row.name.toLowerCase().includes(filters.personName.toLowerCase())
      );
    }

    if (filters.age) {
      newData = newData.filter(
        (row) => row.age.toString() === filters.age.toString()
      );
    }

    setFilteredRows(newData);
  };

  // Reset filter
  const handleReset = () => {
    setFilters({ personName: "", age: "" });
    setFilteredRows(rows);
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [MissingPerson, setMissingPerson] = useState(null);
  const [missingPersonList, setMissingpersonList] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // "success" | "error" | "warning" | "info"
  });

  const handleOpenPopover = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleView = (item) => {
    console.log("View", item);
    handleClosePopover();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setAddressError(false);
    setAgeError(false);
    setContactNoError(false);
    setDatetimeError(false);
    setFileError(false);
    setGenderError(false);
    setIdentificationMarksError(false);
    setNameError(false);
    setNameErrorMsg("");
    setAgeErrorMsg("");
    setContactNoErrorMsg("");
    setDatetimeErrorMsg("");
    setFileErrorMsg("");
    setGenderErrorMsg("");
    setIdentificationMarksErrorMsg("");
    setAddressErrorMsg("");
    setVitalsErrorMsg("");

    setVitalsError(false);
    if (!personName.trim()) {
      setNameError(true);
      // setDepartmentErrorMsg("Department name is required.");
      isValid = false;
    }
    if (!age) {
      setAgeError(true);
    }
    if (!gender) {
      setGenderError(true);
    }
    if (!vitals) {
      setVitalsError(true);
    }
    if (!identificationMarks) {
      setIdentificationMarksError(true);
    }
    if (!contactNo) {
      setContactNoError(true);
    }
    if (!address) {
      setAddressError(true);
    }
    if (!datetime) {
      setDatetimeError(true);
    }
    if (!file) {
      setFileError(true);
    }
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", personName || "");
      formDataToSend.append("age", age || "");
      formDataToSend.append("gender", gender !== "" ? gender : null);
      formDataToSend.append("vitals", vitals || "");
      formDataToSend.append("identification_marks", identificationMarks || "");
      formDataToSend.append("contact_no", contactNo || "");
      formDataToSend.append("address", popupText || "");
      formDataToSend.append("scheduled_datetime", datetime || "");
      formDataToSend.append("latitude", lattitude || "");
      formDataToSend.append("longitude", longitude || "");

      if (file) {
        formDataToSend.append("file_upload", file);
      }

      const response = await fetch(`${port}/admin_web/MissingPerson_post/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token || newToken}`,
          // ❌ DO NOT set Content-Type here, fetch will set it automatically for FormData
        },
        body: formDataToSend,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Form submitted successfully:", data);
        setMissingpersonList((prev) => [...prev, data]);
        resetForm();

        // setpersonName("");
        // setAge("");
        // setGender("");
        // setVitals("");
        // setIdentificationMarks("");
        // setContactNo("");
        // setPopupText(""); // address clear
        // setDatetime("");
        // setLatitude("");
        // setLongitude("");
        // setFile(null);
        // setExistingFileName(""); // old file name clear
        // setEditingId(null); // reset edit mode

        setSnackbar({
          open: true,
          message: "Record submitted successfully!",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Failed to submit record!",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleEdit = async (item) => {
    try {
      const res = await fetch(
        `${port}/admin_web/MissingPerson_put/${item.id}/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch data");

      const data = await res.json();

      // Fill form states with fetched data
      setpersonName(data.name || "");
      setContactNo(data.contact_no || "");
      setAge(data.age || "");
      setGender(data.gender || "");
      setVitals(data.vitals || "");
      setIdentificationMarks(data.identification_marks || "");
      setQuery(data.address || "");
      setLattitude(data.latitude || "");
      setLongitude(data.longitude || "");
      setDatetime(data.scheduled_datetime || "");
      setFile(null); // fresh file reset
      if (data.file_upload) {
        setExistingFileName(data.file_upload);
        setPreviewUrl(`${port}${data.file_upload}`); // ✅ Force preview for backend image
      } else {
        setExistingFileName("");
        setPreviewUrl(null);
      }
      setEditingId(data.id); // track which record is being edited
      setIsEditMode(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

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

  // useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch(`${port}/admin_web/MissingPerson_get/`, {
        headers: {
          Authorization: `Bearer ${token || newToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMissingpersonList(data);
      } else {
        console.error("Failed to fetch mmissing person list.");
      }
    } catch (error) {
      console.error("Error fetching missing person list:", error);
    }
  };

  // fetchData();
  // }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);
  const filteredData = useMemo(() => {
    if (!searchQuery) return missingPersonList;
    const query = searchQuery.toLowerCase();

    return missingPersonList.filter(
      (item) =>
        item.name?.toLowerCase().includes(query) ||
        item.contact_no?.toLowerCase().includes(query) ||
        item.vitals?.toLowerCase().includes(query)
    );
  }, [missingPersonList, searchQuery]);
  const paginatedData = useMemo(() => {
    if (!filteredData?.length) return [];
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredData.slice(start, end);
  }, [page, rowsPerPage, filteredData]);

  const handleUpdate = async () => {
    const formDataToSend = new FormData();
    formDataToSend.append("name", personName || "");
    formDataToSend.append("contact_no", contactNo || "");
    formDataToSend.append("age", age || "");
    formDataToSend.append("gender", gender || "");
    formDataToSend.append("vitals", vitals || "");
    formDataToSend.append("identification_marks", identificationMarks || "");
    formDataToSend.append("address", popupText || "");
    formDataToSend.append("latitude", lattitude || "");
    formDataToSend.append("longitude", longitude || "");
    formDataToSend.append("scheduled_datetime", datetime || "");

    if (file) {
      formDataToSend.append("file_upload", file);
    }

    try {
      const res = await fetch(
        `${port}/admin_web/MissingPerson_put/${editingId}/`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${newToken}` }, // ✅ No Content-Type
          body: formDataToSend,
        }
      );

      if (!res.ok) {
        const errorText = await res.text(); // 👈 get backend error details
        throw new Error(errorText || "Update failed");
      }

      const result = await res.json();
      console.log("✅ Update result:", result);

      // 🔄 Refresh table immediately
      await fetchData();

      setSnackbar({
        open: true,
        message: "Record updated successfully!",
        severity: "success",
      });

      setEditingId(null);

      // reset form
      setpersonName("");
      setContactNo("");
      setAge("");
      setGender("");
      setVitals("");
      setIdentificationMarks("");
      setQuery("");
      setLattitude("");
      setLongitude("");
      setDatetime("");
      setFile(null);
    } catch (err) {
      console.error("❌ Update error:", err.message);
      setSnackbar({
        open: true,
        message: "Failed to update record! " + err.message,
        severity: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${port}/admin_web/MissingPerson_delete/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`, // agar token hai toh
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to delete record");

      setSnackbar({
        open: true,
        message: "Record deleted successfully",
        severity: "success",
      });

      fetchData(); // list refresh
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Failed to delete record",
        severity: "error",
      });
    } finally {
      setOpenDeleteDialog(false);
      handleClosePopover();
    }
  };

  const resetForm = () => {
    setpersonName("");
    setContactNo("");
    setAge("");
    setGender("");
    setVitals("");
    setPopupText(""); // address
    setIdentificationMarks("");
    setQuery("");
    setLattitude("");
    setLongitude("");
    setDatetime("");
    setFile(null);

    setEditingId(null); // reset editing id
    setIsEditMode(false); // disable Add button again
  };

  return (
    <Box sx={{ p: 2, marginLeft: "3rem" }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
          Missing Person
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {/* Left Table */}
        <Grid item xs={12} md={7}>
          <Paper
            sx={{
              backgroundColor: bgColor,
              p: 2,
              borderRadius: 2,
              transition: "all 0.3s ease-in-out",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            {/* Table Header */}
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
                          flex: 0.4,
                          borderRight: "1px solid black",
                          justifyContent: "center", // horizontal
                        }}
                      >
                        <Typography variant="subtitle2" sx={fontsTableHeading}>
                          Sr. No
                        </Typography>
                      </StyledCardContent>

                      <StyledCardContent
                        sx={{
                          flex: 1.2,
                          borderRight: "1px solid black",
                          //   display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="subtitle2" sx={fontsTableHeading}>
                          Name
                        </Typography>
                      </StyledCardContent>

                      <StyledCardContent
                        sx={{
                          flex: 1.2,
                          borderRight: "1px solid black",
                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="subtitle2" sx={fontsTableHeading}>
                          Contact Number
                        </Typography>
                      </StyledCardContent>

                      <StyledCardContent
                        sx={{
                          flex: 0.5,
                          borderRight: "1px solid black",
                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="subtitle2" sx={fontsTableHeading}>
                          Age
                        </Typography>
                      </StyledCardContent>

                      {/* <StyledCardContent
                        sx={{
                          flex: 0.8,
                          borderRight: "1px solid black",

                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="subtitle2" sx={fontsTableHeading}>
                          Photo
                        </Typography>
                      </StyledCardContent> */}

                      <StyledCardContent
                        sx={{
                          flex: 1,
                          borderRight: "1px solid black",
                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="subtitle2" sx={fontsTableHeading}>
                          Vitals
                        </Typography>
                      </StyledCardContent>

                      <StyledCardContent
                        sx={{
                          flex: 0.5,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="subtitle2" sx={fontsTableHeading}>
                          Action
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
                    "&::-webkit-scrollbar": { width: "6px" },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: darkMode ? "#5FC8EC" : "#888",
                      borderRadius: 3,
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                      backgroundColor: darkMode ? "#5FC8EC" : "#555",
                    },
                  }}
                >
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <StyledCardContent
                        sx={{
                          width: "100%",
                          textAlign: "center",
                          py: 3,
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ color: "#888" }}>
                          No Data Found
                        </Typography>
                      </StyledCardContent>
                    </TableRow>
                  ) : (
                    paginatedData.map((row, index) => (
                      <TableDataCardBody
                        key={row.id}
                        sx={{
                          bgcolor: "rgb(53 53 53)",
                          borderRadius: 2,
                          color: textColor,
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                          mb: 1,
                        }}
                      >
                        {/* Sr No */}
                        <StyledCardContent
                          sx={{ flex: 0.4, justifyContent: "center" }}
                        >
                          <Typography variant="subtitle2" sx={fontsTableBody}>
                            {(page - 1) * rowsPerPage + index + 1}
                          </Typography>
                        </StyledCardContent>

                        {/* Name */}
                        <StyledCardContent
                          sx={{ flex: 1.2, justifyContent: "center" }}
                        >
                          <Typography variant="subtitle2" sx={fontsTableBody}>
                            {row.name}
                          </Typography>
                        </StyledCardContent>

                        {/* Contact */}
                        <StyledCardContent
                          sx={{ flex: 1.2, justifyContent: "center" }}
                        >
                          <Typography variant="subtitle2" sx={fontsTableBody}>
                            {row.contact_no}
                          </Typography>
                        </StyledCardContent>

                        {/* Age */}
                        <StyledCardContent
                          sx={{ flex: 0.5, justifyContent: "center" }}
                        >
                          <Typography variant="subtitle2" sx={fontsTableBody}>
                            {row.age}
                          </Typography>
                        </StyledCardContent>

                        {/* Image */}
                        {/* <StyledCardContent
                          sx={{ flex: 0.8, justifyContent: "center" }}
                        >
                          <Typography variant="subtitle2" sx={fontsTableBody}>
                            {row.file_upload ? (
                              <img
                                src={`${port}${row.file_upload}`}
                                // alt={row.name}
                                style={{
                                  width: 35,
                                  height: 35,
                                  objectFit: "cover",
                                  borderRadius: 8,
                                  marginBottom: 4,
                                }}
                              />
                            ) : (
                              "No Image"
                            )}
                          </Typography>
                        </StyledCardContent> */}

                        {/* Vitals */}
                        <StyledCardContent
                          sx={{ flex: 1, justifyContent: "center" }}
                        >
                          <Typography variant="subtitle2" sx={fontsTableBody}>
                            {row.vitals}
                          </Typography>
                        </StyledCardContent>

                        {/* Actions */}
                        <StyledCardContent
                          sx={{ flex: 0.5, justifyContent: "center" }}
                        >
                          <MoreHorizIcon
                            onClick={(e) => handleOpenPopover(e, row)}
                            sx={{
                              color: "white",
                              cursor: "pointer",
                              fontSize: 20,
                              ...fontsTableBody,
                            }}
                          />
                        </StyledCardContent>
                      </TableDataCardBody>
                    ))
                  )}

                  <Popover
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    onClose={handleClosePopover}
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
                        p: 1.5,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        borderRadius: 2,
                        minWidth: 140,
                        boxShadow: 3,
                      },
                    }}
                  >
                    {/* View */}
                    {/* <Button
                      fullWidth
                      variant="outlined"
                      color="primary"
                      startIcon={<Visibility sx={{ fontSize: 16 }} />}
                      onClick={() => handleView(selectedItem)}
                      sx={{ textTransform: "none", fontSize: "14px" }}
                    >
                      View
                    </Button> */}

                    {/* Edit */}
                    <Button
                      fullWidth
                      variant="outlined"
                      color="warning"
                      startIcon={<EditOutlined sx={{ fontSize: 16 }} />}
                      onClick={() => handleEdit(selectedItem)}
                      sx={{ textTransform: "none", fontSize: "14px" }}
                    >
                      Edit
                    </Button>

                    {/* Delete */}
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteOutline sx={{ fontSize: 16 }} />}
                      onClick={() => {
                        setDeleteDepId(selectedItem?.id);
                        setOpenDeleteDialog(true);
                      }}
                      sx={{ textTransform: "none", fontSize: "14px" }}
                    >
                      Delete
                    </Button>
                  </Popover>

                  <Dialog
                    open={openDeleteDialog}
                    onClose={() => setOpenDeleteDialog(false)}
                  >
                    <DialogTitle>Confirm Delete</DialogTitle>
                    <DialogContent>
                      <Typography>
                        Are you sure you want to delete this record?
                      </Typography>
                    </DialogContent>
                    <DialogActions>
                      <Button
                        onClick={() => setOpenDeleteDialog(false)}
                        color="primary"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleDelete(deleteDepId)}
                        color="error"
                        variant="contained"
                      >
                        Delete
                      </Button>
                    </DialogActions>
                  </Dialog>
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
                  {page}/ {Math.ceil(missingPersonList.length / rowsPerPage)}
                </Box>

                <Box
                  onClick={() =>
                    page < Math.ceil(missingPersonList.length / rowsPerPage) &&
                    setPage(page + 1)
                  }
                  sx={{
                    cursor:
                      page < Math.ceil(missingPersonList.length / rowsPerPage)
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

        {/* Right Form (same as AddDepartment structure) */}
        <Grid item xs={12} md={5}>
          <Paper
            sx={{
              backgroundColor: bgColor,
              p: 2,
              borderRadius: 2,
              transition: "all 0.3s ease-in-out",
              color: "white",
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
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
                Missing Person Form
              </Typography>

              {hasPermission("BOLO", "Missing Person", "Add") && (
                <Button
                  variant="contained"
                  disabled={!isEditMode} // default disabled
                  startIcon={<AddCircleOutline />}
                  sx={{
                    backgroundColor: "rgba(223,76,76, 0.8)",
                    color: "#fff",
                    fontWeight: 600,
                    fontFamily: "Roboto",
                    textTransform: "none",
                    // px: 1,
                    py: 1,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    "&:hover": {
                      backgroundColor: "rgba(223,76,76, 0.8)",
                    },
                  }}
                  onClick={() => {
                    resetForm(); // clear fields
                    setOpenForm(true); // open form in "add" mode
                  }}
                >
                  Add Missing Record
                </Button>
              )}
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Full Name"
                  value={personName}
                  sx={selectStyles}
                  // onChange={(e) => setpersonName(e.target.value)}
                  onChange={(e) => {
                    const onlyLetters = e.target.value.replace(
                      /[^a-zA-Z\s]/g,
                      ""
                    );
                    setpersonName(onlyLetters);
                    setNameError(false);
                    setNameErrorMsg("");
                    error = { nameEror };
                    helperText = { NameErrorMsg };
                  }}
                />
                {nameEror && (
                  <FormHelperText
                    error
                    sx={{
                      marginLeft: "14px",
                      marginTop: "3px",
                      fontSize: "0.75rem",
                    }}
                  >
                    {NameErrorMsg || "Please enter a valid name"}
                  </FormHelperText>
                )}
              </Grid>
              {/* </Grid> */}
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Contact Number"
                  value={contactNo}
                  sx={selectStyles}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow only numbers
                    if (/^\d*$/.test(value)) {
                      setContactNo(value);
                    }
                  }}
                  error={contactNoError}
                  helperText={contactNoErrorMsg}
                  inputProps={{
                    maxLength: 10,
                    inputMode: "numeric",
                  }}
                />
                {contactNoError && (
                  <FormHelperText
                    error
                    sx={{
                      marginLeft: "14px",
                      marginTop: "3px",
                      fontSize: "0.75rem",
                    }}
                  >
                    {contactNoErrorMsg || "Please enter a contact number"}
                  </FormHelperText>
                )}
              </Grid>

              {/* Age */}
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  sx={{
                    ...selectStyles,
                    "& input[type=number]": {
                      MozAppearance: "textfield",
                    },
                    "& input[type=number]::-webkit-outer-spin-button": {
                      WebkitAppearance: "none",
                      margin: 0,
                    },
                    "& input[type=number]::-webkit-inner-spin-button": {
                      WebkitAppearance: "none",
                      margin: 0,
                    },
                  }}
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                  }}
                  error={ageError}
                  helperText={ageErrorMsg}
                />

                {ageError && (
                  <FormHelperText
                    error
                    sx={{
                      marginLeft: "14px",
                      marginTop: "3px",
                      fontSize: "0.75rem",
                    }}
                  >
                    {ageErrorMsg || "Please enter a valid age"}
                  </FormHelperText>
                )}
              </Grid>

              {/* Gender */}
              <Grid item xs={12} sm={6} md={6}>
                <Select
                  fullWidth
                  size="small"
                  // placeholder="Gender"
                  value={gender ?? ""}
                  displayEmpty
                  onChange={(e) => setGender(e.target.value)}
                  sx={selectStyles}
                  inputProps={{ "aria-label": "Select Gender" }}
                  error={genderError}
                  helperText={genderErrorMsg}
                >
                  <MenuItem value="" disabled>
                    Select Gender
                  </MenuItem>
                  <MenuItem value={1}>Male</MenuItem>
                  <MenuItem value={2}>Female</MenuItem>
                </Select>
                {genderError && (
                  <FormHelperText
                    error
                    sx={{
                      marginLeft: "14px",
                      marginTop: "3px",
                      fontSize: "0.75rem",
                    }}
                  >
                    {genderErrorMsg || "Please select a gender"}
                  </FormHelperText>
                )}
              </Grid>

              {/* Vitals */}
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  placeholder="Vitals"
                  fullWidth
                  size="small"
                  value={vitals}
                  onChange={(e) => setVitals(e.target.value)}
                  sx={selectStyles}
                  error={vitalsError}
                  helperText={vitalsErrorMsg}
                />
                {vitalsError && (
                  <FormHelperText
                    error
                    sx={{
                      marginLeft: "14px",
                      marginTop: "3px",
                      fontSize: "0.75rem",
                    }}
                  >
                    {vitalsErrorMsg || "Please enter vitals"}
                  </FormHelperText>
                )}
              </Grid>

              {/* Identification Marks */}
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  placeholder="Identification Marks"
                  fullWidth
                  size="small"
                  value={identificationMarks}
                  onChange={(e) => setIdentificationMarks(e.target.value)}
                  sx={selectStyles}
                  error={identificationMarksError}
                  helperText={identificationMarksErrorMsg}
                />
                {identificationMarksError && (
                  <FormHelperText
                    error
                    sx={{
                      marginLeft: "14px",
                      marginTop: "3px",
                      fontSize: "0.75rem",
                    }}
                  >
                    {identificationMarksErrorMsg ||
                      "Please enter identification marks"}
                  </FormHelperText>
                )}
              </Grid>
              <Grid item xs={12} md={6} sm={6}>
                <Autocomplete
                  fullWidth
                  freeSolo
                  size="small"
                  options={suggestions.map((item) => item.address.label)}
                  inputValue={query || ""}
                  onInputChange={(event, newValue) => {
                    setQuery(newValue);
                    setFieldErrors((prev) => ({
                      ...prev,
                      location: undefined,
                    }));
                    if (event)
                      handleSearchChange({ target: { value: newValue } });
                  }}
                  onChange={(event, newValue) => {
                    setQuery(newValue || "");
                    setFieldErrors((prev) => ({
                      ...prev,
                      location: undefined,
                    }));
                    const selected = suggestions.find(
                      (s) => s.address.label === newValue
                    );
                    if (selected) handleSelectSuggestion(selected);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Enter Address"
                      sx={{ ...selectStyles, mt: 0.5, fontFamily }}
                      error={!!fieldErrors.location}
                      helperText={fieldErrors.location}
                    />
                  )}
                  PaperComponent={({ children }) => (
                    <Paper
                      sx={{
                        backgroundColor: bgColor,
                        color: "#fff",
                        border: "1px solid #ccc",
                        borderRadius: 1,
                        maxHeight: 220,
                        overflowY: "auto",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                        "&::-webkit-scrollbar": {
                          width: "6px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          backgroundColor: "#0288d1",
                          borderRadius: "4px",
                        },
                        "&::-webkit-scrollbar-thumb:hover": {
                          backgroundColor: "#56c8f2",
                        },
                      }}
                    >
                      {children}
                    </Paper>
                  )}
                  PopperComponent={(props) => (
                    <Popper {...props} placement="bottom-start" />
                  )}
                />
              </Grid>
              {/* Date */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date"
                  name="date"
                  type="datetime-local"
                  fullWidth
                  size="small"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={selectStyles}
                  value={datetime}
                  onChange={(e) => setDatetime(e.target.value)}
                />
              </Grid>
            </Grid>
            {/* File Upload */}
            <Grid item xs={12} sm={6} md={8} sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {/* Upload Button */}
                <Button
                  variant="outlined"
                  component="label"
                  sx={{ color: "#5FC8EC", borderColor: "#5FC8EC" }}
                  size="small"
                >
                  Choose File
                  <input
                    type="file"
                    hidden
                    name="file"
                    accept={"image/*"}
                    onChange={handleFileChange}
                  />
                </Button>

                {/* 👇 Preview Icon (opens modal) */}
                {(file || existingFileName) && (
                  <Tooltip title="Preview Image">
                    <IconButton
                      onClick={() => setPreviewOpen(true)}
                      sx={{ color: "#5FC8EC" }}
                    >
                      <PreviewIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              {/* File status below */}
              {file ? (
                <Typography variant="body2" sx={{ mt: 1, color: "white" }}>
                  Selected: {file.name}
                </Typography>
              ) : existingFileName ? (
                <Typography variant="body2" sx={{ mt: 1, color: "white" }}>
                  Existing: {existingFileName.split("/").pop()}
                </Typography>
              ) : (
                <Typography variant="body2" sx={{ mt: 1, color: "gray" }}>
                  No file uploaded
                </Typography>
              )}

              {/* Image Preview Modal */}
              <Dialog
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                maxWidth="sm"
                fullWidth
              >
                <DialogContent sx={{ textAlign: "center" }}>
                  {getPreviewUrl() ? (
                    <>
                      <img
                        src={getPreviewUrl()}
                        alt="Preview"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "70vh",
                          borderRadius: 8,
                        }}
                      />
                      {/* Delete Button inside Modal */}
                      <Button
                        variant="outlined"
                        color="error"
                        sx={{ mt: 2 }}
                        onClick={() => {
                          setFile(null);
                          setExistingFileName("");
                          setPreviewUrl(null);
                          setPreviewOpen(false);
                        }}
                      >
                        Delete Image
                      </Button>
                    </>
                  ) : (
                    <Typography>No image available</Typography>
                  )}
                </DialogContent>
              </Dialog>
            </Grid>

            {/* Buttons */}
            <Box
              sx={{ display: "flex", justifyContent: "center", mt: 3, gap: 2 }}
            >
              {editingId ? (
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
                  onClick={handleUpdate}
                  variant="contained"
                >
                  Update
                </Button>
              ) : (
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
                  onClick={handleSubmit}
                  variant="contained"
                >
                  Submit
                </Button>
              )}
            </Box>
            {/* </form> */}
          </Paper>
        </Grid>
      </Grid>
      {/* </Grid> */}
    </Box>
  );
};

export default MissingPerson;
