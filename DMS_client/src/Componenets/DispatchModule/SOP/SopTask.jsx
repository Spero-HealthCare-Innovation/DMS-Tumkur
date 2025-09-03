import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  Grid,
  Table,
  TableBody,
  TableContainer,
  IconButton,
  Select,
  MenuItem,
  Chip,
  DialogActions,
  DialogContent,
  DialogTitle,
  Dialog,
} from "@mui/material";
import {
  Search,
  Visibility,
  AddCircleOutline,
  CheckCircle,
} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import { Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CustomPagination from "../../../common/CustomPagination";
import { Add } from "@mui/icons-material";
import { useAuth } from "../../../Context/ContextAPI";
import axios from "axios";
import { useSnackbar } from "../../../hooks/useSnackbar";

const EnquiryCard = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "linear-gradient(to bottom, #53bce1, rgb(173, 207, 216))",
  borderRadius: "8px 10px 0 0",
  padding: "6px 12px",
  color: "black",
  height: "40px",
}));
const EnquiryCardBody = styled("tr")(({ theme, alertType, isHighlighted }) => {
  const alertColors = {
    1: "#f44336", // High
    2: "#ff9800", // Medium
    3: "#888888", // Low
  };

  const glowColor = alertColors[alertType] || "transparent";
  const highlightBorder = isHighlighted
    ? "2px solid #5FC8EC"
    : "1px solid transparent";

  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: theme.palette.mode === "dark" ? "rgb(53 53 53)" : "#fff",
    color: theme.palette.mode === "dark" ? "#fff" : "#000",
    marginTop: "0.5em",
    borderRadius: "8px",
    padding: "10px 12px",
    transition: "box-shadow 0.3s ease, border-color 0.3s ease",
    cursor: "pointer",
    height: "45px",
    // border: `1px solid transparent`,
    border: highlightBorder,
    // border: highlightBorder, // ⭐ Right border added
    // "&:hover": {
    //   boxShadow: `0 0 8px 3px ${glowColor}88`,
    // },
  };
});
const StyledCardContent = styled("td")({
  padding: "0 8px",
  display: "flex",
  alignItems: "center",
});

const Alerts = [
  "Alert ID",
  // "Disaster ID",
  "Disaster Type",
  "Latitude",
  "Longitude",
  "Temperature",
  "Rain",
  "Severity ",
  "Time",
  "Added By",
  "Actions",
];

const DispatchHeaders = [
  "Incident ID",
  "Date & Time",
  "Chief Compaint",
  "Severity ",
  "Initiated By",
  "Actions",
];

function SopTask({
  darkMode,
  flag,
  setFlag,
  setSelectedIncident,
  setIncidentIdClosure,
  incidentIdClosure,
  setViewmode,
  dispatchList,
  loading = false,
  setIncidentId,
  incidentId,
  fetchDispatchList,
  highlightedId,
  setHighlightedId,
  fetchIncidentDetails
}) {
  const port = import.meta.env.VITE_APP_API_KEY;
  const socketUrl = import.meta.env.VITE_SOCKET_API_KEY;
  const AccessToken = localStorage.getItem("access_token");
  const { newToken } = useAuth();
  const location = useLocation();
  const [alerts, setAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(3);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);


  const {
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    showSnackbar,
    closeSnackbar,
  } = useSnackbar();

  const navigate = useNavigate();



  const dataList = flag === 1 ? alerts : dispatchList;


  const filteredDispatchList = dataList.filter((item) => {
    const searchLower = searchTerm.trim().toLowerCase();
    return (
      item.incident_id?.toString().toLowerCase().includes(searchLower) ||
      item.disaster_name?.toLowerCase().includes(searchLower) ||
      item.inc_added_by?.toLowerCase().includes(searchLower) ||
      item.inc_type?.toString().toLowerCase().includes(searchLower)
    );
  });
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  // 3. Pagination ke liye start/end indexes
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  // 4. Slice filtered data
  const paginatedDispatchList = filteredDispatchList.slice(startIndex, endIndex);

  // 5. Total pages filter ke according
  const totalPages = Math.ceil(filteredDispatchList.length / rowsPerPage) || 1;


  const { setSelectedIncidentFromSop, setDisasterIdFromSop, setCommentText } =
    useAuth();

  window.addEventListener("storage", (e) => {
    if (e.key === "logout") {
      location.href = "/login";
    }
  });

  useEffect(() => {
    const socket = new WebSocket(
      `${socketUrl}/ws/weather_alerts_trigger2?token=${AccessToken || newToken}`
    );

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log(data, "latest alert");
        setAlerts([data]);
        setSelectedIncident(data);
        setFlag(1);
        setViewmode("incident"); // Set view mode to incident when new data is received
        // Show snackbar when data is received
        setSnackbarMsg(data.message || "⚠️ New  alert triggered!");
        setOpenSnackbar(true);
        setCommentText("");
      } catch (error) {
        console.error("Invalid JSON:", event.data);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket closed");
    };
  });

  // useEffect(() => {
  //   let socket;
  //   // const timer = setTimeout(() => {
  //     socket = new WebSocket(
  //       `${socketUrl}/ws/weather_alerts_trigger2?token=${AccessToken || newToken}`
  //     );

  //     socket.onopen = () => {
  //       console.log("WebSocket connected");
  //     };

  //     socket.onmessage = (event) => {
  //       try {
  //         const data = JSON.parse(event.data);
  //         console.log(data, "latest alert");
  //         setAlerts([data]);
  //         setSelectedIncident(data);
  //         setFlag(1);
  //         setViewmode("incident"); // Set view mode to incident when new data is received
  //         // Show snackbar when data is received
  //         setSnackbarMsg(data.message || "⚠️ New  alert triggered!");
  //         setOpenSnackbar(true);
  //         setCommentText("");
  //       } catch (error) {
  //         console.error("Invalid JSON:", event.data);
  //       }
  //     };

  //     socket.onerror = (error) => {
  //       console.error("WebSocket error:", error);
  //     };

  //     socket.onclose = () => {
  //       console.log("WebSocket closed");
  //     };
  //   // }, 1000);

  //   return () => {
  //     console.log("Cleaning up timeout and socket");
  //     // clearTimeout(timer);
  //     if (socket) {
  //       socket.close();
  //     }
  //   };
  // }, []);

  const handleBack = () => {
    setFlag(0);
    setSelectedIncident(); // Clear selected incident
    setViewmode("incident"); // Reset view mode to incident
  };


  // const handleForward = () => {
  //   setFlag(1);
  //   setSelectedIncident(); // Clear selected incident
  //   setViewmode("incident"); // Reset view mode to incident
  // };

  const textColor = darkMode ? "#ffffff" : "#000000";
  const bgColor = darkMode ? "202328" : "#ffffff";
  const borderColor = darkMode ? "#7F7F7F" : "#ccc";
  const fontFamily = "Roboto, sans-serif";

  const handleClick = () => {
    navigate("/create-incident", { state: { startData: "start" } });
  };


  // api for cancel trigger 
  const handleCancelTrigger = async () => {
    const payload = {
      id: selectedAlert,
    };

    try {
      const response = await axios.post(
        `${port}/admin_web/cancel-trigger/`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AccessToken || newToken}`,
          },
        }
      );

      showSnackbar("Alert cancelled successfully!", "success");
      setOpenCancelDialog(false);
      setFlag(0);
      fetchDispatchList();
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to cancel alert!", "error");
    }
  };

  // useEffect(() => {
  //   const navEntry = performance.getEntriesByType("navigation")[0];
  //   const isReload = navEntry?.type === "reload";

  //   if (isReload) {
  //     setOpenCancelDialog(true);
  //     setFlag(1); // flag becomes 1 on reload
  //   }
  // }, [port, AccessToken, newToken]);

  // // Whenever the dialog closes, reset flag to 0
  // useEffect(() => {
  //   if (!openCancelDialog) {
  //     setFlag(0);
  //   }
  // }, [openCancelDialog]);

  // brouswer and tab close logout functionality
  //   let isPageReloaded = false;

  // // When page loads, mark it as reloaded in sessionStorage
  // window.addEventListener('load', () => {
  //   sessionStorage.setItem('isReloaded', 'true');
  // });

  // // In beforeunload, detect if it's a refresh
  // window.addEventListener('beforeunload', (event) => {
  //   const navEntries = performance.getEntriesByType('navigation');
  //   const navType = navEntries.length > 0 ? navEntries[0].type : null;

  //   // Detect reload via performance API or sessionStorage flag
  //   isPageReloaded = navType === 'reload' || sessionStorage.getItem('isReloaded') === 'true';

  //   if (!isPageReloaded) {
  //     // It's a tab/browser close → perform logout logic
  //     localStorage.setItem('logout', Date.now().toString());
  //     // Optionally: Clear sessionStorage/localStorage/cookies if needed
  //     // sessionStorage.clear();
  //     // localStorage.clear();
  //     // document.cookie = ""; // example to clear cookies
  //   }

  //   // Clean up the sessionStorage flag (optional)
  //   sessionStorage.removeItem('isReloaded');
  // });

  const [createIncident, setCreateIncident] = useState(false);
  const [view, setView] = useState(false);
  const [closure, setClosure] = useState(false);

  useEffect(() => {
    const storedPermissions = JSON.parse(localStorage.getItem("permissions"));

    if (storedPermissions && storedPermissions.length > 0) {
      const modules = storedPermissions[0].modules_submodule;

      const sopModule = modules.find((mod) => mod.moduleName === "SOP");

      if (sopModule) {
        console.log("SOP Module:", sopModule);

        sopModule.selectedSubmodules?.forEach((sub) => {
          console.log("Submodule:", sub.submoduleName);

          sub.selectedActions?.forEach((act) => {
            console.log("Action:", act.actionName);

            if (act.actionName === "Create Incident") {
              setCreateIncident(true);
            }
            if (act.actionName === "View") {
              setView(true);
            }
            if (act.actionName === "Closure") {
              setClosure(true);
            }
          });
        });
      } else {
        console.warn("SOP module not found in permissions");
      }
    }
  }, []);

  return (
    <Paper
      elevation={3}
      sx={{ padding: 2, borderRadius: 3, backgroundColor: bgColor }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, pb: 2 }}>
        {/* Back Button */}
        {flag === 1 && (
          <Tooltip title="Go Back to Alert Tasks">
            <ArrowBackIcon
              onClick={handleBack}
              sx={{
                cursor: "pointer",
                fontSize: 26,
                color: darkMode ? "#fff" : "#000",
                "&:hover": {
                  color: "#00f0c0",
                },
              }}
            />
          </Tooltip>
        )}
        {/* Forward Button */}
        {/* {flag === 0 && (
          <Tooltip title="Go Forward to Dispatch SOP">
            <ArrowForwardIcon
              onClick={handleForward}
              sx={{
                cursor: "pointer",
                fontSize: 26,
                color: darkMode ? "#fff" : "#000",
                "&:hover": {
                  color: "#00f0c0",
                },
              }}
            />
          </Tooltip>
        )} */}

        {/* Title */}
        <Typography
          variant="h6"
          sx={{ color: textColor, fontWeight: 500, fontFamily }}
        >
          {flag === 1 ? "Alert Task" : "Dispatch List"}
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

        {createIncident && (
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{
              ml: "auto",
              backgroundColor: "rgb(223, 76, 76)",
              color: "black",
              borderRadius: "18px",
              "&:hover": {
                backgroundColor: "rgb(223, 76, 76)",
                border: `1px solid ${darkMode ? "#fff" : "#000"}`,
              },
              height: 36,
              transition: "width 0.3s ease",
              overflow: "hidden",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Add sx={{ color: darkMode ? "#fff" : "#000000" }} />
            <Typography
              variant="body2"
              sx={{
                marginLeft: 1,
                color: "#fff",
                whiteSpace: "nowrap",
              }}
            >
              Create Incident
            </Typography>
          </IconButton>
        )}

      </Box>

      {flag === 1 ? (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {/* Header Row */}
            <EnquiryCard
              sx={{
                display: "flex",
                flexDirection: "row",
                // backgroundColor: "#5FECC8",
              }}
            >
              {Alerts.map((label, idx) => (
                <StyledCardContent
                  key={idx}
                  sx={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "8px",
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={400}>
                    {label}
                  </Typography>
                </StyledCardContent>
              ))}
            </EnquiryCard>

            {/* Table Content */}
            {alerts.length === 0 ? (
              <Box p={2}>
                <Typography align="center" color="textSecondary">
                  No alerts available.
                </Typography>
              </Box>
            ) : (
              alerts.map((item) => (
                <EnquiryCardBody
                  key={item.pk_id}
                  status={item.status}
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    marginTop: "8px",
                  }}
                >
                  <StyledCardContent sx={{ flex: 1, justifyContent: "center" }}>
                    <Typography variant="subtitle2">{item.pk_id}</Typography>
                  </StyledCardContent>
                  {/* <StyledCardContent sx={{ flex: 1, justifyContent: "center" }}>
                    <Typography variant="subtitle2">{item.disaster_id_id}</Typography>
                  </StyledCardContent> */}
                  <StyledCardContent sx={{ flex: 1, justifyContent: "center" }}>
                    <Typography variant="subtitle2">
                      {item.disaster_name}
                    </Typography>
                  </StyledCardContent>
                  <StyledCardContent sx={{ flex: 1, justifyContent: "center" }}>
                    <Typography variant="subtitle2">{item.latitude}</Typography>
                  </StyledCardContent>
                  <StyledCardContent sx={{ flex: 1, justifyContent: "center" }}>
                    <Typography variant="subtitle2">
                      {item.longitude}
                    </Typography>
                  </StyledCardContent>
                  <StyledCardContent sx={{ flex: 1, justifyContent: "center" }}>
                    <Typography variant="subtitle2">
                      {item.temperature_2m}
                    </Typography>
                  </StyledCardContent>

                  <StyledCardContent sx={{ flex: 1, justifyContent: "center" }}>
                    <Typography variant="subtitle2">{item.rain}</Typography>
                  </StyledCardContent>
                  <StyledCardContent sx={{ flex: 1, justifyContent: "center" }}>
                    <Typography variant="subtitle2">
                      {{
                        1: "High",
                        2: "Medium",
                        3: "Low",
                        4: "Very Low",
                      }[item.alert_type] || "Unknown"}
                    </Typography>
                  </StyledCardContent>
                  <StyledCardContent sx={{ flex: 1, justifyContent: "center" }}>
                    <Typography
                      variant="subtitle2"
                      // sx={{ fontSize: "12px" }}
                      textAlign="center"
                    >
                      {item.alert_datetime
                        ? new Date(item.alert_datetime).toLocaleString(
                          "en-US",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          }
                        )
                        : "N/A"}
                    </Typography>
                  </StyledCardContent>
                  <StyledCardContent sx={{ flex: 1, justifyContent: "center" }}>
                    <Typography variant="subtitle2">{item.added_by}</Typography>
                  </StyledCardContent>
                  <StyledCardContent
                    sx={{
                      flex: 1,
                      justifyContent: "center",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Tooltip title="Cancel alert">
                      <IconButton
                        size="large"
                        color="error"
                        onClick={() => {
                          console.log("Cancel clicked for", item);
                          setSelectedAlert(item.pk_id);
                          setOpenCancelDialog(true);
                        }}
                        sx={{
                          "&:hover": {
                            backgroundColor: "rgba(255, 0, 0, 0.1)",
                          },
                        }}
                        aria-label="cancel"
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </StyledCardContent>
                </EnquiryCardBody>
              ))
            )}
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TableContainer>
              <Table>
                <TableBody>
                  {/* <EnquiryCard>
                    {DispatchHeaders.map((header, idx) => (
                      <StyledCardContent
                        key={header}
                        style={{
                          flex: 1,
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight={500}>
                          {header}
                        </Typography>
                      </StyledCardContent>
                    ))}
                  </EnquiryCard> */}

                  <EnquiryCard>
                    <StyledCardContent sx={{ flex: 1, justifyContent: "center" }}>
                      <Typography variant="subtitle2" fontWeight={500}>
                        Incident ID
                      </Typography>
                    </StyledCardContent>

                    <StyledCardContent sx={{ flex: 1.5, justifyContent: "center" }}>
                      <Typography variant="subtitle2" fontWeight={500}>
                        Date & Time
                      </Typography>
                    </StyledCardContent>

                    <StyledCardContent sx={{ flex: 1.5, justifyContent: "center" }}>
                      <Typography variant="subtitle2" fontWeight={500}>
                        Chief Complaint
                      </Typography>
                    </StyledCardContent>

                    <StyledCardContent
                      sx={{ flex: 1, justifyContent: "center", minWidth: 80, maxWidth: 100 }}
                    >
                      <Typography variant="subtitle2" fontWeight={500}>
                        Severity
                      </Typography>
                    </StyledCardContent>

                    <StyledCardContent sx={{ flex: 1, justifyContent: "center" }}>
                      <Typography variant="subtitle2" fontWeight={500} sx={{ ml: 6 }}>
                        Initiated By
                      </Typography>
                    </StyledCardContent>

                    <StyledCardContent
                      sx={{ flex: 1, justifyContent: "center", display: "flex", gap: 1 }}
                    >
                      <Typography variant="subtitle2" fontWeight={500}>
                        Actions
                      </Typography>
                    </StyledCardContent>
                  </EnquiryCard>

                  <Box
                    sx={{
                      maxHeight: 170,
                      overflowY: "auto",
                      mt: 1,
                      pr: 1,
                      "&::-webkit-scrollbar": {
                        width: "6px",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: darkMode ? "#5FC8EC" : "#888",
                        borderRadius: 3,
                      },
                      "&::-webkit-scrollbar-thumb:hover": {
                        backgroundColor: darkMode ? "#888" : "#555",
                      },
                    }}
                  >
                    {paginatedDispatchList.length === 0 ? (
                      <Box p={2} width="100%">
                        <Typography align="center" color="textSecondary">
                          No tasks available.
                        </Typography>
                      </Box>
                    ) : (
                      paginatedDispatchList.map((item) => (
                        <EnquiryCardBody
                          key={item.incident_id}
                          alertType={item.inc_type}
                          isHighlighted={item.incident_id === highlightedId}
                        >
                          <StyledCardContent
                            sx={{ flex: 1, justifyContent: "center" }}
                          >
                            <Typography variant="subtitle2">
                              {item.incident_id || "N/A"}
                            </Typography>
                          </StyledCardContent>

                          <StyledCardContent
                            sx={{ flex: 1.5, justifyContent: "center" }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ textAlign: "center", fontSize: "13px" }}
                            >
                              {item.inc_added_date
                                ? new Date(item.inc_added_date).toLocaleString(
                                  "en-US",
                                  {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  }
                                )
                                : "N/A"}
                            </Typography>
                          </StyledCardContent>

                          <StyledCardContent
                            sx={{ flex: 1.5, justifyContent: "center" }}
                          >
                            <Typography variant="subtitle2">
                              {item.disaster_name || "N/A"}
                            </Typography>
                          </StyledCardContent>

                          {/* Alert Type */}
                          <StyledCardContent
                            sx={{ flex: 1, justifyContent: "center", minWidth: 80, maxWidth: 100 }}
                          >
                            <Typography variant="subtitle2">
                              {{
                                1: "High",
                                2: "Medium",
                                3: "Low",
                                4: "Very Low",
                              }[item.alert_type] || "Unknown"}
                            </Typography>
                          </StyledCardContent>

                          {/* Initiated By */}
                          <StyledCardContent
                            sx={{ flex: 1, justifyContent: "center", }}
                          >
                            <Typography variant="subtitle2" sx={{ ml: 6 }}>
                              {item.inc_added_by || "N/A"}
                            </Typography>
                          </StyledCardContent>

                          {/* Actions */}
                          <StyledCardContent
                            sx={{
                              flex: 1,
                              justifyContent: "center",
                              gap: 1,
                              display: "flex",
                            }}
                          >
                            {view ?
                              (
                                <Tooltip title="View Details">
                                  <IconButton
                                    onClick={() => {
                                      setSelectedIncident(item);
                                      setIncidentId(item.inc_id);
                                      setSelectedIncidentFromSop(item);
                                      setDisasterIdFromSop(item.disaster_name);
                                      setHighlightedId(item.incident_id);
                                      console.log("Incident idd", incidentId);
                                      setFlag(0);
                                      setViewmode("incident");
                                    }}
                                  >
                                    <Visibility
                                      sx={{ color: "orange", fontSize: 28, ml: 4 }}
                                    />
                                  </IconButton>
                                </Tooltip>
                              )
                              :
                              (
                                <>-</>
                              )
                            }

                            {closure ? (
                              <Tooltip title="Closure Details">
                                <IconButton
                                  onClick={() => {
                                    setSelectedIncident(item);
                                    setIncidentIdClosure(item.inc_id);
                                    setSelectedIncidentFromSop(item);
                                    setDisasterIdFromSop(item.disaster_name);
                                    setHighlightedId(item.incident_id);
                                    setFlag(0);
                                    setViewmode("closure");
                                    fetchIncidentDetails();
                                  }}
                                  size="large"
                                >
                                  <TextSnippetIcon sx={{ color: "rgb(122 255 242)", fontSize: 20 }} />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <>-</>
                            )}
                          </StyledCardContent>
                        </EnquiryCardBody>
                      ))
                    )}
                  </Box>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      )
      }
      {/* Pagination Component */}
      {
        flag === 0 ? (
          <Box mt={2}>
            <CustomPagination
              darkMode={darkMode}
              page={page}
              setPage={setPage}
              rowsPerPage={rowsPerPage}
              setRowsPerPage={setRowsPerPage}
              totalPages={totalPages}
              textColor={textColor}
              borderColor={borderColor}
              bgColor={bgColor}
              inputBgColor={darkMode ? "#1e293b" : "#fff"}
              rowsPerPageOptions={[3, 10, 20, 50]}
            />
          </Box>
        ) : null
      }

      {/* SNACKBAR FOR ALERT SHOW */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={5000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="info"
          sx={{
            width: "100%",
            bgcolor: darkMode ? "#0a1929" : "#fff",
            color: darkMode ? "#fff" : "#000",
            boxShadow: darkMode
              ? "0 2px 10px rgba(255, 255, 255, 0.1)"
              : "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          elevation={6}
          variant="filled"
          onClose={closeSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%", fontWeight: 500 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* dilog for alert cancel? */}
      <Dialog
        open={openCancelDialog}
        onClose={() => setOpenCancelDialog(false)}
      >
        <DialogTitle>Confirm Cancellation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel alert ID{" "}
            <strong>{incidentId?.pk_id}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)}>No</Button>
          <Button
            onClick={handleCancelTrigger}
            color="error"
            variant="contained"
          >
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Paper >
  );
}

export default SopTask;
