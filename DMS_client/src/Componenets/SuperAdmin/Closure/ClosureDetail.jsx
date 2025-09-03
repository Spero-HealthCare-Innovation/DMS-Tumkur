import React, { useState } from 'react'
import { Box, Typography, TextField, Button, Paper, InputAdornment, Grid, Popover, Snackbar, FormControl, FormLabel, CircularProgress } from "@mui/material";
import { Select, MenuItem, IconButton, Popper } from "@mui/material";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { useTheme } from "@mui/material/styles";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import DownloadIcon from "@mui/icons-material/Download";
import { Search, ArrowBack, DeleteOutline, EditOutlined, AddCircleOutline } from "@mui/icons-material";
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
  EnquiryCardBody,
  EnquiryCard,

} from "./../../../CommonStyle/Style";
import { useAuth } from "./../../../Context/ContextAPI";

function ClosureDetail({ darkMode, fromDate, toDate, onChange, onDownload }) {
  const textColor = darkMode ? "#ffffff" : "#000000";
  const bgColor = "linear-gradient(to bottom, #53bce1, rgb(173, 207, 216))";
  const paper = darkMode ? "202328" : "#FFFFFF";
  const tableRow = "rgb(53 53 53)";
  const labelColor = darkMode ? "#5FECC8" : "#1976d2";
  const fontFamily = "Roboto, sans-serif";
  const borderColor = darkMode ? "#7F7F7F" : "#ccc";

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const selectStyles = getCustomSelectStyles(isDarkMode);
  const inputBgColor = darkMode
    ? "rgba(255, 255, 255, 0.16)"
    : "rgba(0, 0, 0, 0.04)";


  const port = import.meta.env.VITE_SOCKET1_API_KEY;
  const { newToken } = useAuth();
  const [showDownload, setShowDownload] = useState(false);
  const [closureData, setClosureData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Determine effective token (context token takes priority)
  const effectiveToken = newToken || localStorage.getItem("access_token");

  //  const onSubmit = () => {
  //   // your submit logic here
  //   console.log("Submit clicked");

  //   // show the download button
  //   setShowDownload(true);
  // };

  // const handleChange = (field, value) => {
  //   setFormData((prev) => ({ ...prev, [field]: value }));
  // };

  const handleChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: ''
  });

  const mockData = [
    {
      incidentId: "INC001",
      disasterType: "Flood",
      startBaseLocation: "Base A",
      atScene: "10:00 AM",
      fromScene: "10:30 AM",
      backToBase: "11:00 AM",
      remark: "Handled well",
    },
    {
      incidentId: "INC002",
      disasterType: "Cyclone",
      startBaseLocation: "Base B",
      atScene: "12:00 PM",
      fromScene: "12:45 PM",
      backToBase: "01:15 PM",
      remark: "Evacuation done",
    },
    // Add more objects to test pagination
  ];




  // Filter data based on search term
  const filteredData = closureData.filter(item =>
    item.incident_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.closure_remark?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginate filtered data
  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);


  // const formatDateForAPI = (date) => {
  //   if (!date) return '';
  //   const year = date.getFullYear();
  //   const month = String(date.getMonth() + 1).padStart(2, '0');
  //   const day = String(date.getDate()).padStart(2, '0');
  //   return `${year}-${month}-${day}`;
  // };


  const formatDateForAPI = (date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const fetchClosureData = async () => {
    if (!formData.fromDate || !formData.toDate) {
      setError('Please select both from and to dates');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fromDateStr = formatDateForAPI(formData.fromDate);
      const toDateStr = formatDateForAPI(formData.toDate);

      const response = await fetch(
        `${port}/incident_closure_report_daywise/?from_date=${fromDateStr}&to_date=${toDateStr}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${effectiveToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setClosureData(Array.isArray(data) ? data : []);
      setShowDownload(data.length > 0);
      setHasSubmitted(true);
      setPage(1); // Reset to first page
    } catch (err) {
      console.error('Error fetching closure data:', err);
      setError('Failed to fetch closure data. Please try again.');
      setClosureData([]);
      setShowDownload(false);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = () => {
    setShowDownload(true);

    if (effectiveToken) {
      fetchClosureData();
    } else {
      console.warn("No token found for department fetch.");
    }
  };

  // Download function to handle the download API call
  const handleDownload = async () => {
    if (!formData.fromDate || !formData.toDate) {
      setError('Please select both from and to dates before downloading');
      return;
    }

    setDownloadLoading(true);
    setError('');

    try {
      const fromDateStr = formatDateForAPI(formData.fromDate);
      const toDateStr = formatDateForAPI(formData.toDate);

      const response = await fetch(
        `${port}/download_incident_closure_report_daywise/?from_date=${fromDateStr}&to_date=${toDateStr}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${effectiveToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the filename from response headers or use a default name
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'incident_closure_report.xlsx'; // default filename

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob from response
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      console.log('Download completed successfully');
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download file. Please try again.');
    } finally {
      setDownloadLoading(false);
    }
  };




  return (
    <div style={{ marginLeft: "3.5rem" }}>


      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            pb: 2,
            mt: 3,
          }}
        >
          {/* Back Button */}
          {/* <IconButton
      size="small"
      sx={{
        backgroundColor: "#00f0c0",
        color: "#fff",
        "&:hover": { backgroundColor: "#00d8ac" },
        width: 30,
        height: 30,
      }}
    >
      <ArrowBackIosIcon sx={{ fontSize: 20, color: darkMode ? "#fff" : "#000" }} />
    </IconButton> */}

          {/* Title */}
          <Typography
            variant="h6"
            sx={{
              color: "rgb(95,200,236)",
              fontWeight: 600,
              fontFamily,
              fontSize: 18,
              minWidth: "120px",
              marginLeft: "2em",
            }}
          >
            Closure Report
          </Typography>

          {/* Search Field */}
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "gray", fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: "200px",
              "& .MuiOutlinedInput-root": {
                borderRadius: "25px",
                backgroundColor: darkMode ? "#1e293b" : "#fff",
                color: darkMode ? "#fff" : "#000",
                px: 1,
                py: 0.2,
                height: "35px",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: darkMode ? "#444" : "#ccc",
              },
              "& input": {
                padding: "6px 8px",
                fontSize: "13px",
              },
            }}
          />

          {/* From Date */}




          <Grid item md={4}>
            <DatePicker
              label="From Date *"
              format="yyyy-MM-dd"
              slotProps={{ textField: { size: 'small' } }}
              value={formData.fromDate || null}
              onChange={(newValue) => handleChange("fromDate", newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  placeholder="yyyy-MM-dd"
                  variant="outlined"
                  size="small"
                  required
                  error={!!validationErrors.fromdate}
                  helperText={validationErrors.fromdate}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    ...params.InputProps,
                    sx: {
                      color: textColor,
                      height: "35px",
                      fontSize: "0.45rem",
                      "& .MuiSvgIcon-root": {
                        color: "white",
                      },
                    },
                  }}
                  sx={textFieldStyle}
                />
              )}
            />
          </Grid>




          {/* To Date */}
          <Grid item>
            <DatePicker
              label="To Date *"
              format="yyyy-MM-dd"
              slotProps={{ textField: { size: 'small' } }}
              value={formData.toDate || null}
              onChange={(newValue) => handleChange("toDate", newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  placeholder="yyyy-MM-dd"
                  variant="outlined"
                  size="small"
                  required
                  error={!!validationErrors.startBaseLocation}
                  helperText={validationErrors.startBaseLocation}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    ...params.InputProps,
                    sx: {
                      color: textColor,
                      height: "35px",
                      fontSize: "0.45rem",
                      "& .MuiSvgIcon-root": {
                        color: "white",
                      },
                    },
                  }}
                  sx={textFieldStyle}
                />
              )}
            />
          </Grid>


          {/* Submit Button */}
          <Button
            variant="contained"
            size="small"
            sx={{
              backgroundColor: "rgb(18,166,95,0.8)",
              "&:hover": { backgroundColor: "rgb(18,166,95,0.8)" },
              height: 35,
              minWidth: 100,
              color: darkMode ? "#fff" : "#fff",
              textTransform: 'none'
            }}
            onClick={onSubmit}
          >
            Submit
          </Button>

          {/* Download Button */}
          {showDownload && (
            <Button
              variant="outlined"
              color="success"
              startIcon={downloadLoading ? <CircularProgress size={16} /> : <DownloadIcon />}
              size="small"
              sx={{ height: 35, minWidth: 130 }}
              onClick={handleDownload}
            >
              Download
            </Button>
          )}
        </Box>

        {/* Date icon styling */}
        <style>
          {`
      .custom-date-input::-webkit-calendar-picker-indicator {
        filter: invert(1);
        cursor: pointer;
      }
    `}
        </style>
      </LocalizationProvider>


      {error && (
        <Box sx={{ mb: 2 }}>
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        </Box>
      )}

      <Grid item xs={12} md={7}>
        <Paper elevation={3} sx={{ padding: 3, borderRadius: 3, backgroundColor: paper, mt: 1, mb: 5 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <EnquiryCard sx={{
                    backgroundColor: bgColor,
                    color: "#000",
                    display: "flex",
                    width: "100%",
                    borderRadius: 2,
                    position: "sticky",
                    p: 3,
                  }}>
                    <StyledCardContent
                      sx={{
                        flex: 0.6,
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
                        flex: 1.5,
                        borderRight: "1px solid black",
                        justifyContent: "center",
                        ...fontsTableHeading,
                      }}
                    >
                      <Typography variant="subtitle2">
                        Incident ID
                      </Typography>
                    </StyledCardContent>

                    <StyledCardContent
                      sx={{
                        flex: 1.6,
                        borderRight: "1px solid black",
                        justifyContent: "center",
                        ...fontsTableHeading,
                      }}
                    >
                      <Typography variant="subtitle2">
                       Chief Compaints
                      </Typography>
                    </StyledCardContent>
                    <StyledCardContent
                      sx={{
                        flex: 1.6,
                        borderRight: "1px solid black",
                        justifyContent: "center",
                        ...fontsTableHeading,
                      }}
                    >
                      <Typography variant="subtitle2">
                        Acknowledgement
                      </Typography>
                    </StyledCardContent>
                    <StyledCardContent
                      sx={{
                        flex: 1.6,
                        borderRight: "1px solid black",
                        justifyContent: "center",
                        ...fontsTableHeading,
                      }}
                    >
                      <Typography variant="subtitle2">
                        Start Base Location
                      </Typography>
                    </StyledCardContent>
                    <StyledCardContent
                      sx={{
                        flex: 1.6,
                        borderRight: "1px solid black",
                        justifyContent: "center",
                        ...fontsTableHeading,
                      }}
                    >
                      <Typography variant="subtitle2">
                        At Scene
                      </Typography>
                    </StyledCardContent>
                    <StyledCardContent
                      sx={{
                        flex: 1.6,
                        borderRight: "1px solid black",
                        justifyContent: "center",
                        ...fontsTableHeading,
                      }}
                    >
                      <Typography variant="subtitle2">
                        From Scene
                      </Typography>
                    </StyledCardContent>
                    <StyledCardContent
                      sx={{
                        flex: 1.6,
                        // borderRight: "1px solid black",
                        justifyContent: "center",
                        ...fontsTableHeading,
                      }}
                    >
                      <Typography variant="subtitle2">
                        Back to Base
                      </Typography>
                    </StyledCardContent>
                    {/* <StyledCardContent
                      sx={{
                        flex: 1.6,
                        // borderRight: "1px solid black",
                        justifyContent: "center",
                        ...fontsTableHeading,
                      }}
                    >
                      <Typography variant="subtitle2">
                        Remark
                      </Typography>
                    </StyledCardContent> */}

                    {/* <StyledCardContent
                              sx={{
                                flex: 1,
                                justifyContent: "center",
                                ...fontsTableHeading,
                              }}
                            >
                              <Typography variant="subtitle2">Actions</Typography>
                            </StyledCardContent> */}
                  </EnquiryCard>
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
                {loading ? (
                  <Box p={4} display="flex" justifyContent="center">
                    <CircularProgress sx={{ color: "rgb(95,200,236)" }} />
                  </Box>
                ) : !hasSubmitted ? (
                  <Box p={2}>
                    <Typography align="center" color="textSecondary">
                      Please select date range and click Submit to view records.
                    </Typography>
                  </Box>
                ) : paginatedData.length === 0 ? (
                  <Box p={2}>
                    <Typography align="center" color="textSecondary">
                      {searchTerm ? 'No records found matching your search.' : 'No records available for the selected date range.'}
                    </Typography>
                  </Box>
                ) : (
                  paginatedData.map((item, index) => (
                    <EnquiryCardBody
                      key={index}
                      sx={{
                        backgroundColor: tableRow,
                        p: 2,
                        borderRadius: 2,
                        color: textColor,
                        display: "flex",
                        width: "100%",
                        mb: 1,
                      }}
                    >
                      <StyledCardContent sx={{ flex: 0.6, justifyContent: "center" }}>
                        <Typography variant="subtitle2" sx={fontsTableBody}>
                          {(page - 1) * rowsPerPage + index + 1}
                        </Typography>
                      </StyledCardContent>
                      <StyledCardContent sx={{ flex: 2, justifyContent: "center", ...fontsTableBody }}>
                        <Typography variant="subtitle2" sx={{ fontSize: "12px" }}>{item.incident_id || 'N/A'}</Typography>
                      </StyledCardContent>
                      <StyledCardContent sx={{ flex: 2, justifyContent: "center", ...fontsTableBody }}>
                        <Typography variant="subtitle2" sx={{ fontSize: "12px" }}>{item.disaster_type}</Typography>
                      </StyledCardContent>
                      <StyledCardContent sx={{ flex: 2, justifyContent: "center", ...fontsTableBody }}>
                        <Typography variant="subtitle2" sx={{ fontSize: "12px" }}>{formatDateTime(item.closure_acknowledge)}</Typography>
                      </StyledCardContent>
                      <StyledCardContent sx={{ flex: 2, justifyContent: "center", ...fontsTableBody }}>
                        <Typography variant="subtitle2" sx={{ fontSize: "12px" }}>{formatDateTime(item.closure_start_base_location)}</Typography>
                      </StyledCardContent>
                      <StyledCardContent sx={{ flex: 2, justifyContent: "center", ...fontsTableBody }}>
                        <Typography variant="subtitle2" sx={{ fontSize: "12px" }}>{formatDateTime(item.closure_at_scene)}</Typography>
                      </StyledCardContent>
                      <StyledCardContent sx={{ flex: 2, justifyContent: "center", ...fontsTableBody }}>
                        <Typography variant="subtitle2" sx={{ fontSize: "12px" }}>{formatDateTime(item.closure_from_scene)}</Typography>
                      </StyledCardContent>
                      <StyledCardContent sx={{ flex: 2, justifyContent: "center", ...fontsTableBody }}>
                        <Typography variant="subtitle2" sx={{ fontSize: "12px" }}>{formatDateTime(item.closure_back_to_base)}</Typography>
                      </StyledCardContent>
                      {/* <StyledCardContent sx={{ flex: 2, justifyContent: "center", ...fontsTableBody }}>
                        <Typography variant="subtitle2" sx={{fontSize:"12px"}}>{item.closure_remark || 'N/A'}</Typography>
                      </StyledCardContent> */}
                    </EnquiryCardBody>
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
                  setPage(1);
                }}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: "13px",
                  color: textColor,
                  borderColor: borderColor,
                  height: "30px",
                  minWidth: "70px",
                  backgroundColor: darkMode ? "#202328" : "#FFFFFF",
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

            {/* Page Navigation - Updated to use filteredGroups */}
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
                backgroundColor: darkMode ? "#202328" : "#FFFFFF",
              }}
            >
              <Box
                onClick={() => page > 1 && setPage(page - 1)}
                sx={{
                  cursor: page > 1 ? "pointer" : "not-allowed",
                  userSelect: "none",
                }}>
                &#8249;
              </Box>
              <Box>{totalPages > 0 ? page : 0} / {totalPages}</Box>
              <Box
                onClick={() => page < totalPages && setPage(page + 1)}
                sx={{
                  cursor: page < totalPages ? "pointer" : "not-allowed",
                  userSelect: "none",
                }}>
                &#8250;
              </Box>
            </Box>
          </Box>
        </Paper>
      </Grid>
    </div>
  )
}

export default ClosureDetail
