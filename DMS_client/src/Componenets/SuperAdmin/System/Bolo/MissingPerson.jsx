import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { Visibility, EditOutlined, DeleteOutline } from "@mui/icons-material";
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
  const[nameEror,setNameError] = useState(false);
  const[ageError,setAgeError] = useState(false);
  const[genderError,setGenderError] = useState(false);
  const[vitalsError,setVitalsError] = useState(false);
  const[identificationMarksError,setIdentificationMarksError] = useState(false);
  const[contactNoError,setContactNoError] = useState(false);
  const[addressError,setAddressError] = useState(false);
  const[datetimeError,setDatetimeError] = useState(false);
  const[fileError,setFileError] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", personName || "");
      formDataToSend.append("age", age || "");
      formDataToSend.append("gender", gender !== "" ? gender : null);
      formDataToSend.append("vitals", vitals || "");
      formDataToSend.append("identification_marks", identificationMarks || "");
      formDataToSend.append("contact_no", contactNo || "");
      formDataToSend.append("address", address || "");
      formDataToSend.append("scheduled_datetime", datetime || "");
      formDataToSend.append("latitude", 3456.45);
      formDataToSend.append("longitude", 12345.45);

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

        // reset form
        setpersonName("");
        setContactNo("");
        setAge("");
        setGender("");
        setVitals("");
        setIdentificationMarks("");
        setAddress("");
        setDatetime("");
        setFile(null);

        alert("Missing person added successfully ✅");
      } else {
        console.error("Form submission failed:", await response.text());
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
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

  const [rows] = useState([
    { id: 1, name: "John Doe", age: 45 },
    { id: 2, name: "Jane Smith", age: 32 },
    { id: 3, name: "Rahul Sharma", age: 45 },
  ]);

  // Filter state
  const [filters, setFilters] = useState({ personName: "", age: "" });
  const [filteredRows, setFilteredRows] = useState(rows);
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
  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
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

  const handleEdit = (item) => {
    console.log("Edit", item);
    handleClosePopover();
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

  useEffect(() => {
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

    fetchData();
  }, []);
  return (
    <Box sx={{ p: 2, marginLeft: "3rem" }}>
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
                          flex: 0.5,
                          borderRight: "1px solid black",
                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="subtitle2" sx={fontsTableHeading}>
                          Age
                        </Typography>
                      </StyledCardContent>

                      <StyledCardContent
                        sx={{
                          flex: 0.8,
                          borderRight: "1px solid black",

                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="subtitle2" sx={fontsTableHeading}>
                          Photo
                        </Typography>
                      </StyledCardContent>

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
                          flex: 1.2,
                          borderRight: "1px solid black",
                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="subtitle2" sx={fontsTableHeading}>
                          Address
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
                  {missingPersonList.length === 0 ? (
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
                    missingPersonList
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((row, index) => (
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
                              {page * rowsPerPage + index + 1}
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

                          {/* Age */}
                          <StyledCardContent
                            sx={{ flex: 0.5, justifyContent: "center" }}
                          >
                            <Typography variant="subtitle2" sx={fontsTableBody}>
                              {row.age}
                            </Typography>
                          </StyledCardContent>

                          {/* Gender */}
                          <StyledCardContent
                            sx={{ flex: 0.8, justifyContent: "center" }}
                          >
                            <Typography variant="subtitle2" sx={fontsTableBody}>
                              {row.gender === 1
                                ? "Male"
                                : row.gender === 2
                                ? "Female"
                                : ""}{" "}
                            </Typography>
                          </StyledCardContent>

                          {/* Vitals */}
                          <StyledCardContent
                            sx={{ flex: 1, justifyContent: "center" }}
                          >
                            <Typography variant="subtitle2" sx={fontsTableBody}>
                              {row.vitals}
                            </Typography>
                          </StyledCardContent>

                          {/* Address */}
                          <StyledCardContent
                            sx={{ flex: 1.2, justifyContent: "center" }}
                          >
                            <Typography variant="subtitle2" sx={fontsTableBody}>
                              {row.address}
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
                  sx={{
                    bgcolor: "#5FC8EC",
                    "&:hover": { bgcolor: "#4FB0D0" },
                    fontSize: 14,
                  }}
                  onClick={() => setOpenForm(true)} // optional trigger
                >
                  + New Record
                </Button>
              )}
            </Box>

            {/* Form */}
            {/* <form onSubmit={handleSubmit}> */}
            <Grid container spacing={2}>
              {/* Name */}
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Full Name"
                  value={personName}
                  sx={selectStyles}
                  onChange={(e) => setpersonName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Contact Number"
                  value={contactNo}
                  sx={selectStyles}
                  onChange={(e) => setContactNo(e.target.value)}
                />
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
                  sx={selectStyles}
                />
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
                >
                  <MenuItem value="" disabled>
                    Select Gender
                  </MenuItem>
                  <MenuItem value={1}>Male</MenuItem>
                  <MenuItem value={2}>Female</MenuItem>
                </Select>
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
                />
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
                />
              </Grid>

              {/* <Grid item xs={12} sm={6} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Address"
                    sx={selectStyles}
                    onChange={handleSearchChange}
                    onClick={() => handleSelectSuggestion()}
                    value={query || ""}
                  />
                </Grid> */}

              <Grid item xs={12} md={6} sm={6}>
                <Box sx={{}}>
                  {/* <Typography
                      sx={{
                        color: labelColor,
                        fontWeight: 500,
                        fontFamily,
                        fontSize: "13.5px",
                      }}
                    >
                      Location *
                    </Typography> */}

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
                        placeholder="Enter Location"
                        sx={{ ...selectStyles, mt: 0.5, fontFamily }}
                        error={!!fieldErrors.location}
                        helperText={fieldErrors.location}
                      />
                    )}
                    PaperComponent={({ children }) => (
                      <Paper
                        sx={{
                          backgroundColor: "#fff",
                          color: "#000",
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
                </Box>
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
            <Grid item xs={12} sm={6} md={6} sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ color: "#5FC8EC", borderColor: "#5FC8EC" }}
              >
                Choose File
                <input
                  type="file"
                  hidden
                  name="file"
                  onChange={handleFileChange}
                />
              </Button>

              {file && (
                <Typography variant="body2" sx={{ mt: 1, color: "white" }}>
                  Selected: {file.name}
                </Typography>
              )}
            </Grid>

            {/* Buttons */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 3,
                gap: 2,
              }}
            >
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
