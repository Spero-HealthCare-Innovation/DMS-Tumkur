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
      date: "",
      time: "",
    });
  };
  return (
    <Box sx={{ p: 2, marginLeft: "3rem" }}>
      <Grid container spacing={2}>
        {/* Left Table */}
        <Grid item xs={12} md={7}>
          <Paper
            sx={{
              backgroundColor: "rgb(53 53 53)",
              p: 2,
              borderRadius: 2,
              transition: "all 0.3s ease-in-out",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: 600, color: "#5FC8EC" }}
            >
              Unclaimed Body Records
            </Typography>

            {/* Table Header */}
            <TableHeadingCard>
              <StyledCardContent sx={{ flex: 0.6 }}>
                <Typography variant="subtitle2" sx={fontsTableHeading}>
                  Sr. No
                </Typography>
              </StyledCardContent>
              <StyledCardContent sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={fontsTableHeading}>
                  Name
                </Typography>
              </StyledCardContent>
              <StyledCardContent sx={{ flex: 0.6 }}>
                <Typography variant="subtitle2" sx={fontsTableHeading}>
                  Age
                </Typography>
              </StyledCardContent>
              <StyledCardContent sx={{ flex: 0.8 }}>
                <Typography variant="subtitle2" sx={fontsTableHeading}>
                  Gender
                </Typography>
              </StyledCardContent>
              <StyledCardContent sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={fontsTableHeading}>
                  Vitals
                </Typography>
              </StyledCardContent>
              {/* <StyledCardContent sx={{ flex: 2 }}>
                <Typography variant="subtitle2" sx={fontsTableHeading}>
                  Identification Marks
                </Typography>
              </StyledCardContent> */}
              <StyledCardContent sx={{ flex: 1.2 }}>
                <Typography variant="subtitle2" sx={fontsTableHeading}>
                  Schedules
                </Typography>
              </StyledCardContent>
              {/* <StyledCardContent sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={fontsTableHeading}>
                  Date
                </Typography>
              </StyledCardContent>
              <StyledCardContent sx={{ flex: 0.8 }}>
                <Typography variant="subtitle2" sx={fontsTableHeading}>
                  Time
                </Typography>
              </StyledCardContent> */}
              <StyledCardContent sx={{ flex: 0.8 }}>
                <Typography variant="subtitle2" sx={fontsTableHeading}>
                  Actions
                </Typography>
              </StyledCardContent>
            </TableHeadingCard>

            {/* Table Body */}
            {staticData.map((row, index) => (
              <TableDataCardBody
                key={row.id}
                sx={{
                  bgcolor: "rgb(53 53 53)",
                  borderRadius: 2,
                  display: "flex",
                  width: "100%",
                  transition: "all 0.3s ease",
                  color: "white",
                }}
              >
                <StyledCardContent sx={{ flex: 0.6, justifyContent: "center" }}>
                  <Typography variant="subtitle2" sx={fontsTableBody}>
                    {index + 1}
                  </Typography>
                </StyledCardContent>
                <StyledCardContent sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={fontsTableBody}>
                    {row.name}
                  </Typography>
                </StyledCardContent>
                <StyledCardContent sx={{ flex: 0.6 }}>
                  <Typography variant="subtitle2" sx={fontsTableBody}>
                    {row.age}
                  </Typography>
                </StyledCardContent>
                <StyledCardContent sx={{ flex: 0.8 }}>
                  <Typography variant="subtitle2" sx={fontsTableBody}>
                    {row.gender}
                  </Typography>
                </StyledCardContent>
                <StyledCardContent sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={fontsTableBody}>
                    {row.vitals}
                  </Typography>
                </StyledCardContent>
                {/* <StyledCardContent sx={{ flex: 2 }}>
                  <Typography variant="subtitle2" sx={fontsTableBody}>
                    {row.identificationMarks}
                  </Typography>
                </StyledCardContent> */}
                <StyledCardContent sx={{ flex: 1.2 }}>
                  <Typography variant="subtitle2" sx={fontsTableBody}>
                    {row.schedules}
                  </Typography>
                </StyledCardContent>
                {/* <StyledCardContent sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={fontsTableBody}>
                    {row.date}
                  </Typography>
                </StyledCardContent>
                <StyledCardContent sx={{ flex: 0.8 }}>
                  <Typography variant="subtitle2" sx={fontsTableBody}>
                    {row.time}
                  </Typography>
                </StyledCardContent> */}
                <StyledCardContent sx={{ flex: 0.8, display: "flex", gap: 1 }}>
                  <Tooltip title="View">
                    <IconButton size="small" color="primary">
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton size="small" color="warning">
                      <EditOutlined fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error">
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </StyledCardContent>
              </TableDataCardBody>
            ))}
          </Paper>
        </Grid>

        {/* Right Form (same as AddDepartment structure) */}
        <Grid item xs={12} md={5}>
          <Paper
            sx={{
              backgroundColor: "rgb(53 53 53)", // same as left panel
              p: 2,
              borderRadius: 2,
              transition: "all 0.3s ease-in-out",
              color: "white", // text color white
            }}
          >
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: 600, color: "#5FC8EC" }}
            >
              Unclaimed Body Form
            </Typography>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={6}>
                  <TextField
                    label="Name"
                    name="name"
                    fullWidth
                    size="small"
                    value={formData.name}
                    onChange={handleChange}
                    InputLabelProps={{ style: { color: "white" } }}
                    InputProps={{ style: { color: "white" } }}
                  />
                </Grid>
                <Grid item xs={6} sm={6} md={6}>
                  <TextField
                    label="Age"
                    name="age"
                    type="number"
                    fullWidth
                    size="small"
                    value={formData.age}
                    onChange={handleChange}
                    InputLabelProps={{ style: { color: "white" } }}
                    InputProps={{ style: { color: "white" } }}
                  />
                </Grid>
                <Grid item xs={6} sm={6} md={6}>
                  <TextField
                    select
                    label="Gender"
                    name="gender"
                    fullWidth
                    size="small"
                    value={formData.gender}
                    onChange={handleChange}
                    InputLabelProps={{ style: { color: "white" } }}
                    SelectProps={{
                      style: { color: "white" },
                      MenuProps: {
                        PaperProps: {
                          sx: { bgcolor: "rgb(53 53 53)", color: "white" },
                        },
                      },
                    }}
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <TextField
                    label="Vitals"
                    name="vitals"
                    fullWidth
                    size="small"
                    value={formData.vitals}
                    onChange={handleChange}
                    InputLabelProps={{ style: { color: "white" } }}
                    InputProps={{ style: { color: "white" } }}
                  />
                </Grid>
                <Grid item xs={12} md={6} sm={6}>
                  <TextField
                    label="Identification Marks"
                    name="identificationMarks"
                    fullWidth
                    size="small"
                    value={formData.identificationMarks}
                    onChange={handleChange}
                    InputLabelProps={{ style: { color: "white" } }}
                    InputProps={{ style: { color: "white" } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
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
                      onChange={handleChange}
                    />
                  </Button>
                  {formData.file && (
                    <Typography variant="body2" sx={{ mt: 1, color: "white" }}>
                      Selected: {formData.file.name}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <TextField
                    label="Schedules"
                    name="schedules"
                    fullWidth
                    size="small"
                    value={formData.schedules}
                    onChange={handleChange}
                    InputLabelProps={{ style: { color: "white" } }}
                    InputProps={{ style: { color: "white" } }}
                  />
                </Grid>
                <Grid item xs={6} sm={6} md={6}>
                  <TextField
                    label="Date"
                    name="date"
                    type="date"
                    fullWidth
                    size="small"
                    InputLabelProps={{
                      shrink: true,
                      style: { color: "white" },
                    }}
                    InputProps={{ style: { color: "white" } }}
                    value={formData.date}
                    onChange={handleChange}
                  />
                </Grid>
             
              </Grid>

              {/* Buttons */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mt: 3,
                  gap: 2,
                }}
              >
                <Button
                  onClick={handleClose}
                  color="error"
                  variant="outlined"
                  sx={{ borderColor: "red", color: "red" }}
                >
                  Close
                </Button>
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
