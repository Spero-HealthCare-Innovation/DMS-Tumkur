import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tooltip,
  IconButton,
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

const UnclaimedBody = () => {
  const [formData, setFormData] = useState({
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
  const theme = useTheme();

  const isDarkMode = theme.palette.mode === "dark";
  const darkMode = true;
  const selectStyles = getCustomSelectStyles(isDarkMode);

  const labelColor = darkMode ? "#5FECC8" : "#1976d2";
  const borderColor = darkMode ? "#7F7F7F" : "#ccc";
  const fontFamily = "Roboto, sans-serif";
  const textColor = darkMode ? "#ffffff" : "#000000";
  const bgColor = darkMode ? "202328" : "#ffffff";

  const [staticData, setStaticData] = useState([
    {
      id: 1,
      name: "John Doe",
      age: 45,
      gender: "Male",
      vitals: "Stable",
      identificationMarks: "Scar on left hand",
      schedules: "Post-mortem",
      date: "2025-09-02",
      time: "10:30 AM",
    },
  ]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sceduledateTime, setSceduledateTime] = useState(null);
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStaticData((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        ...formData,
      },
    ]);
    handleClose();
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
      dateTime: "",
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
  const [personName, setpersonName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [vitals, setVitals] = useState("");
  const [identificationMarks, setIdentificationMarks] = useState("");
  const [datetime, setDatetime] = useState("");
  const [schedules, setSchedules] = useState("");

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
          Unclaimed Body
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
              color: textColor,
              transition: "all 0.3s ease-in-out",
            }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 1,
                display: "flex",
                alignItems: "center",
                gap: 2,
                mt: 1,
                mb: 1,
                width: "100%",
                maxWidth: "70%",
                minHeight: "50px",
              }}
            >
              <TextField
                size="small"
                placeholder="Person Name"
                value={personName}
                onChange={(e) => setpersonName(e.target.value)}
                sx={{ ...selectStyles, flex: 2, background: bgColor }}
                InputLabelProps={{ shrink: false }}
              />
              <TextField
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                sx={{ ...selectStyles, flex: 1 }}
                InputLabelProps={{ shrink: false }}
              />
              <Button
                variant="contained"
                color="primary"
                sx={{ minHeight: 36, px: 2, fontSize: "0.8rem" }}
              >
                Submit
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                sx={{ minHeight: 36, px: 2, fontSize: "0.8rem" }}
              >
                Reset
              </Button>
            </Paper>

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
                          Gender
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
                          Schedules
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
                  {staticData.map((row, index) => (
                    <TableDataCardBody
                      key={index}
                      sx={{
                        bgcolor: "rgb(53 53 53)",
                        borderRadius: 2,
                        color: textColor,
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        mb: 1, // spacing between rows
                      }}
                    >
                      {/* Sr No */}
                      <StyledCardContent
                        sx={{ flex: 0.4, justifyContent: "center" }}
                      >
                        <Typography variant="subtitle2" sx={fontsTableBody}>
                          {index + 1}
                        </Typography>
                      </StyledCardContent>

                      {/* Name */}
                      <StyledCardContent
                        sx={{
                          flex: 1.2,
                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="subtitle2" sx={fontsTableBody}>
                          {row.name}
                        </Typography>
                      </StyledCardContent>

                      {/* Age */}
                      <StyledCardContent
                        sx={{
                          flex: 0.5,
                          justifyContent: "center",
                        }}
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
                          {row.gender}
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

                      {/* Schedules */}
                      <StyledCardContent
                        sx={{ flex: 1.2, justifyContent: "center" }}
                      >
                        <Typography variant="subtitle2" sx={fontsTableBody}>
                          {row.schedules}
                        </Typography>
                      </StyledCardContent>

                      {/* Actions */}
                      <StyledCardContent
                        sx={{
                          flex: 0.5,
                          justifyContent: "center",
                        }}
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
                  ))}

                  {/* Single Popover (works for clicked row only) */}
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
                    <Button
                      fullWidth
                      variant="outlined"
                      color="primary"
                      startIcon={<Visibility sx={{ fontSize: 16 }} />}
                      onClick={() => handleView(selectedItem)}
                      sx={{ textTransform: "none", fontSize: "14px" }}
                    >
                      View
                    </Button>

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
                        setDeleteDepId(selectedItem.dep_id);
                        setOpenDeleteDialog(true);
                      }}
                      sx={{ textTransform: "none", fontSize: "14px" }}
                    >
                      Delete
                    </Button>
                  </Popover>
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
                  {page}/ {Math.ceil(staticData.length / rowsPerPage)}
                </Box>

                <Box
                  onClick={() =>
                    page < Math.ceil(staticData.length / rowsPerPage) &&
                    setPage(page + 1)
                  }
                  sx={{
                    cursor:
                      page < Math.ceil(staticData.length / rowsPerPage)
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
                Unclaimed Body Form
              </Typography>
              {hasPermission("BOLO", "Unclaimed Body", "Add") && (
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
            <form onSubmit={handleSubmit}>
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

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="DD-MM-YYYY"
                    sx={selectStyles}
                    type="datetime-local"
                    format="DD-MM-YYYY"
                    value={datetime}
                    onChange={(e) => setDatetime(e.target.value)}
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
                    value={gender}
                    displayEmpty
                    onChange={(e) => setGender(e.target.value)}
                    sx={selectStyles}
                    inputProps={{ "aria-label": "Select Gender" }}
                  >
                    <MenuItem value="" disabled>
                      Select Gender
                    </MenuItem>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
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

                {/* File Upload */}
                <Grid item xs={12} sm={6}>
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
                      //   onChange={handleFileChange}
                    />
                  </Button>
                  {formData.file && (
                    <Typography variant="body2" sx={{ mt: 1, color: "white" }}>
                      Selected: {formData.file.name}
                    </Typography>
                  )}
                </Grid>

                {/* Date */}
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
                  type="submit"
                  variant="contained"
                  sx={{ bgcolor: "#5FC8EC", "&:hover": { bgcolor: "#4FB0D0" } }}
                >
                  Submit
                </Button>
              </Box>
            </form>
          </Paper>
        </Grid>
      </Grid>
      {/* </Grid> */}
    </Box>
  );
};

export default UnclaimedBody;
