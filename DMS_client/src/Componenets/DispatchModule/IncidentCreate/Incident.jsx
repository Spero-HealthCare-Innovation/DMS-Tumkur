import { useEffect, useRef, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  TextField,
  Typography,
  MenuItem,
  Button,
  Checkbox,
  FormControlLabel,
  ListItemText,
  Stack,
} from "@mui/material";
import { FormControl, InputLabel, Select } from "@mui/material";
import { useAuth } from "../../../Context/ContextAPI";
import IncidentCreateMap from "./IncidentCreateMap";
import { Snackbar, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TimerIcon from "@mui/icons-material/Timer";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ResponderModal from "../SOP/ResponderModal";

const inputStyle = {
  mb: 0.5,
  color: "white",
};
const boxStyle = {
  mb: 2,
  pb: 1.5,
};

const Incident = ({ darkMode }) => {
  const port = import.meta.env.VITE_APP_API_KEY;
  // const googleKey = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY;
  const location = useLocation();
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const now = new Date();
  const formattedDate =
    now
      .toLocaleDateString("en-GB")
      .slice(0, 8)
      .replace(/\//g, "-")
      .slice(0, -2) + now.getFullYear().toString().slice(2);
  const { wardName, tehsilName, districtName } = useAuth();
  console.log(wardName, "fetching from map Ward");
  console.log(tehsilName, "fetching from map Tehsil");
  console.log(districtName, "fetching from map District");
  // Ward API
  const [ward, setWard] = useState([]);
  const [wardOfficer, setWardOfficer] = useState([]);
  const [selectedWard, setSelectedWard] = useState("");
  const [selectedWardOfficer, setSelectedWardOfficer] = useState([]);

  //responder modal
  const [activeResponder, setActiveResponder] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [assignedMap, setAssignedMap] = useState({});
  // const [responderList, setResponderList] = useState([]);

  const handleSaveFromModal = (data) => {
    setAssignedMap(data.assignedVehicles); // ✅ parent update
  };

  const {
    districts,
    fetchDistrictsByState,
    Tehsils,
    selectedDistrictId,
    selectedTehsilId,
    selectedCityID,
    setSelectedStateId,
    setSelectedDistrictId,
    setSelectedTehsilId,
    setSelectedCityId,
    fetchTehsilsByDistrict,
    setQuery,
    callType,
    selectedcallType,
    setselectedcallType,
    selectedSubchiefComplaint,
    setselectedSubchiefComplaint,
    subChiefComplaint,
    selectedChiefComplaint,
    ChiefComplaint,
    setselectedChiefComplaint,
    fetchResponderScope,
  } = useAuth();

  console.log(
    selectedChiefComplaint,
    "selectedChiefComplaintselectedChiefComplaintselectedChiefComplaint"
  );

  useEffect(() => {
    fetchDistrictsByState();
  }, []);

  useEffect(() => {
    if (districts.length > 0 && districtName) {
      const matchingDistrict = districts.find(
        (district) =>
          district.dis_name.toLowerCase() === districtName.toLowerCase()
      );
      if (matchingDistrict) {
        setSelectedDistrictId(matchingDistrict.dis_id);
      }
    }
  }, [districts, districtName]);

  useEffect(() => {
    if (Tehsils.length > 0 && tehsilName) {
      const matchingTehsil = Tehsils.find(
        (tehsil) => tehsil.tah_name.toLowerCase() === tehsilName.toLowerCase()
      );
      if (matchingTehsil) {
        setSelectedTehsilId(matchingTehsil.tah_id);
      }
    }
  }, [Tehsils, tehsilName]);

  useEffect(() => {
    if (ward.length > 0 && wardName) {
      const matchingWard = ward.find(
        (w) => w.ward_name.toLowerCase() === wardName.toLowerCase()
      );
      if (matchingWard) {
        setSelectedWard(matchingWard.pk_id);
      }
    }
  }, [ward, wardName]);

  useEffect(() => {
    if (selectedDistrictId) {
      fetchTehsilsByDistrict(selectedDistrictId);
    }
  }, [selectedDistrictId]);

  const handleCheckboxChangeWardOfficer = (event) => {
    const {
      target: { value },
    } = event;

    setSelectedWardOfficer(
      Array.isArray(value) ? value.map((v) => Number(v)) : []
    );
  };

  useEffect(() => {
    if (selectedTehsilId) {
      const fetchWardList = async () => {
        const res = await fetch(
          `${port}/admin_web/ward_get/${selectedTehsilId}/`,
          {
            headers: {
              Authorization: `Bearer ${token || newToken}`,
            },
          }
        );
        const data = await res.json();
        setWard(data);
      };
      fetchWardList();
    }
  }, [selectedTehsilId]);

  useEffect(() => {
    if (selectedWard) {
      const fetchWardOfficerList = async () => {
        const res = await fetch(
          `${port}/admin_web/ward_officer_get/${selectedWard}/`,
          {
            headers: {
              Authorization: `Bearer ${token || newToken}`,
            },
          }
        );
        const data = await res.json();
        setWardOfficer(data);
      };
      fetchWardOfficerList();
    }
  }, [selectedWard]);

  window.addEventListener("storage", (e) => {
    if (e.key === "logout") {
      location.href = "/login";
    }
  });

  useEffect(() => {
    document.title = "DMS|Incident Create";
  }, []);

  useEffect(() => {
    if (location.state?.startData) {
      console.log("Received startData:", location.state.startData);
      setSecondsElapsed(0);
      setTimerActive(true);
    }
  }, [location.state]);

  useEffect(() => {
    let intervalId;
    if (timerActive) {
      intervalId = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [timerActive]);

  const hours = Math.floor(secondsElapsed / 3600);
  const minutes = Math.floor(secondsElapsed / 60);
  const seconds = secondsElapsed % 60;
  const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setSecondsElapsed((prev) => prev + 1);
  //   }, 1000);

  //   return () => clearInterval(interval); // cleanup
  // }, []);
  // console.log(googleKey, 'googleKey');
  const navigate = useNavigate();
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
  } = useAuth();
  // console.log(popupText, 'popupTextpopupText');

  const { handleSearchChange, handleSelectSuggestion, query } = useAuth();
  const bgColor = darkMode ? "#202328" : "#ffffff";
  const labelColor = darkMode ? "#5FC8EC" : "#1976d2";
  const labelColor1 = darkMode ? "white" : "#1976d2";
  const fontFamily = "Roboto, sans-serif";
  const [selectedEmergencyValue, setSelectedEmergencyValue] = useState("");
  // console.log(responderScope, 'Fetching Scope Data');
  const [summary, setSummary] = useState([]);
  const [selectedDisaster, setSelectedDisaster] = useState("");
  const [alertType, setAlertType] = useState("");

  // POST API
  const [callerNumber, setCallerNumber] = useState("");
  const [callerName, setCallerName] = useState("");
  const [summaryId, setSummaryId] = useState("");
  const [comments, setComments] = useState("");
  const [sopId, setSopId] = useState([]);

  /// snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  // Google API Start
  // const { isLoaded } = useJsApiLoader({
  //     googleMapsApiKey: googleKey,
  //     libraries: libraries,
  // });

  const addressRef = useRef();

  const handlePlaceChanged = () => {
    console.log("place select function hitting...");
    if (addressRef.current) {
      const place = addressRef.current.getPlace();
      console.log("place object", place);

      if (!place.geometry || !place.geometry.location) {
        console.warn("No geometry found for the selected place");
        return;
      }

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      const formattedLat = parseFloat(lat.toFixed(6));
      const formattedLng = parseFloat(lng.toFixed(6));

      console.log("Selected Address:", place.formatted_address);
      console.log("Latitude:", formattedLat);
      console.log("Longitude:", formattedLng);
    }
  };

  // Google API End
  const handleCheckboxChange = (id, responder) => {
    setSopId((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id); // unselect
      } else {
        return [...prev, id]; // select
      }
    });
  };

  const selectedResponders = responderScope?.responder_scope?.filter((r) =>
    sopId.includes(r.res_id)
  );

  // ✅ Button click pe modal open
  const handleOpenModal = () => {
    setActiveResponder(selectedResponders[0]); // default tab first responder
    setOpenModal(true);
  };

  const [errors, setErrors] = useState({});

  // time duration
  const [hrs = 0, min = 0, sec = 0] = (formattedTime || "00:00:00")
    .split(":")
    .map((v) => Number(v) || 0);

  // Pad with leading zeros
  const pad = (n) => String(n).padStart(2, "0");

  // Final HH:MM:SS string
  const TimeDuration = `${pad(hrs)}:${pad(min)}:${pad(sec)}`;
  const handleSubmit = async () => {
    const newErrors = {};

    if (!selectedEmergencyValue)
      newErrors.inc_type = "Incident Type is required";
    if (!callerNumber) newErrors.caller_no = "Caller Number is required";
    if (!callerName) newErrors.caller_name = "Caller Name is required";
    if (!query && !popupText) newErrors.location = "Location is required";
    if (!summaryId) newErrors.summary = "Summary is required";
    if (selectedEmergencyValue === 1) {
      // if (!selectedcallType)
      //   newErrors.Call_Type = "Call Type is required";
      if (!alertType) newErrors.alert_type = "Alert Type is required";
      if (!comments) newErrors.comments = "Comment is required";
      if (!sopId || sopId.length === 0) {
        newErrors.responder_scope = "At least one responder must be selected";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const vehicleIds = Object.keys(assignedMap).filter(
      (key) => assignedMap[key]
    );
    if (vehicleIds.length === 0) {
      newErrors.assignAmbulance = "At least one vehicle must be assigned";
    }

    // Agar koi bhi error hai to wahi return kar do
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      inc_type: selectedEmergencyValue,
      // disaster_type: selectedDisaster,
      alert_type: alertType || null,
      location: popupText || query,
      latitude: lattitude,
      longitude: longitude,
      summary: summaryId,
      caller_no: callerNumber,
      caller_name: callerName,
      comments: comments,
      responder_scope: sopId,
      inc_added_by: "admin",
      inc_modified_by: "admin",
      caller_added_by: "admin",
      caller_modified_by: "admin",
      comm_added_by: "admin",
      comm_modified_by: "admin",
      mode: 1,
      district: selectedDistrictId,
      tahsil: selectedTehsilId,
      ward: selectedWard,
      ward_officer: selectedWardOfficer,
      vehicle: vehicleIds,
      call_type: selectedcallType,
      parent_complaint: selectedChiefComplaint,
      call_recieved_from: null,
      disaster_type: selectedSubchiefComplaint,
      time: formattedTime,
    };
    console.log(payload, "payload");

    try {
      const response = await fetch(`${port}/admin_web/manual_call_incident/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || newToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.status === 201) {
        setSnackbarMessage("Incident Created Successfully");
        setSnackbarOpen(true);
        setSelectedEmergencyValue("");
        setSelectedDisaster("");
        setAlertType("");
        setCallerNumber("");
        setCallerName("");
        setSummaryId("");
        setComments("");
        setSopId([]);
        setSelectedDistrictId("");
        setSelectedDistrictId("");
        setSelectedWard("");
        setSelectedWardOfficer([]);
        setErrors({});
        setPopupText("");
        setQuery("");
        setLattitude("");
        setLongitude("");

        setTimeout(() => {
          navigate("/sop");
        }, 3000);
      } else if (response.status === 500) {
        setSnackbarMessage("Internal Server Error");
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage(data?.detail || "Something went wrong");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setSnackbarMessage("Network error or server not reachable");
      setSnackbarOpen(true);
    }
  };

  const handleAlertTypeChange = (event) => {
    setAlertType(event.target.value);
  };

  const handleEmergencyChange = (event) => {
    setSelectedEmergencyValue(event.target.value);
  };

  useEffect(() => {
    if (selectedDisaster) {
      setDisasterIncident(selectedDisaster);
    }
  }, [selectedDisaster]);

  const [openSopModal, setOpenSopModal] = useState(false);

  const fetchSummary = async () => {
    const res = await fetch(
      `${port}/admin_web/DMS_Summary_Get/${selectedEmergencyValue}/`,
      {
        headers: {
          Authorization: `Bearer ${token || newToken}`,
        },
      }
    );
    const data = await res.json();
    setSummary(data);
  };

  useEffect(() => {
    if (selectedEmergencyValue) {
      fetchSummary();
    }
  }, [selectedEmergencyValue]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: darkMode ? "black" : "#f5f5f5",
        px: 2,
        py: 3,
      }}
    >
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper
            elevation={3}
            sx={{
              ...inputStyle,
              p: 2,
              borderRadius: 3,
              backgroundColor: bgColor,
              // height: 'auto',
              height: "auto",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: "bold", color: "#5FC8EC" }}
              >
                Create Incident
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontSize: "15px",
                  p: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  width: "fit-content",
                  borderRadius: "1em",
                }}
                gutterBottom
              >
                <Box
                  sx={{
                    backgroundColor: "#E0F2F1",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: "1em",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <CalendarMonthIcon sx={{ fontSize: 18, color: "#009688" }} />
                  <span style={{ color: "black", fontSize: "14px" }}>
                    {formattedDate}
                  </span>
                </Box>

                <Box
                  sx={{
                    backgroundColor: "#FFF3E0",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: "0.8em",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <AccessTimeIcon sx={{ fontSize: 18, color: "#FB8C00" }} />
                  <span style={{ color: "black", fontSize: "14px" }}>
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })}
                  </span>
                </Box>

                <Box
                  sx={{
                    backgroundColor: "#E8EAF6",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: "1.5em",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <TimerIcon sx={{ fontSize: 18, color: "#3F51B5" }} />
                  <span style={{ color: "black", fontSize: "14px" }}>
                    {formattedTime}
                  </span>
                </Box>
              </Typography>
            </Box>

            <Grid container spacing={1.6}>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Incident Type"
                  variant="outlined"
                  sx={inputStyle}
                  value={selectedEmergencyValue}
                  onChange={handleEmergencyChange}
                  error={!!errors.inc_type}
                  helperText={errors.inc_type}
                >
                  <MenuItem value={1}>Emergency</MenuItem>
                  <MenuItem value={2}>Non Emergency</MenuItem>
                </TextField>
              </Grid>
              {selectedEmergencyValue === 1 && (
                <>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Select Call Type"
                      variant="outlined"
                      sx={inputStyle}
                      value={selectedcallType}
                      onChange={(e) => setselectedcallType(e.target.value)}
                      // error={!!errors.disaster_type}
                      // helperText={errors.disaster_type}
                    >
                      <MenuItem disabled value="">
                        Select Call Type
                      </MenuItem>
                      {callType.map((item) => (
                        <MenuItem
                          key={item.call_type_id}
                          value={item.call_type_id}
                        >
                          {item.call_type_name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Select Chief Complaint"
                      variant="outlined"
                      sx={inputStyle}
                      value={selectedChiefComplaint}
                      onChange={(e) => {
                        const value = e.target.value;
                        setselectedChiefComplaint(value); // update context state
                        fetchResponderScope(value); // call API with selected chief complaint
                      }}
                      // onChange={(e) => setselectedChiefComplaint(e.target.value)}
                      // error={!!errors.disaster_type}
                      // helperText={errors.disaster_type}
                    >
                      <MenuItem disabled value="">
                        Select Chief Complaint
                      </MenuItem>
                      {ChiefComplaint.map((item) => (
                        <MenuItem key={item.pc_id} value={item.pc_id}>
                          {item.pc_name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Sub Chief Complaint"
                      variant="outlined"
                      sx={inputStyle}
                      value={selectedSubchiefComplaint}
                      onChange={(e) =>
                        setselectedSubchiefComplaint(e.target.value)
                      }
                      // error={!!errors.disaster_type}
                      // helperText={errors.disaster_type}
                    >
                      <MenuItem disabled value="">
                        Sub Chief Complaint
                      </MenuItem>
                      {subChiefComplaint.map((item) => (
                        <MenuItem
                          key={item.disaster_id}
                          value={item.disaster_id}
                        >
                          {item.disaster_name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Alert Type"
                      variant="outlined"
                      value={alertType}
                      onChange={handleAlertTypeChange}
                      sx={inputStyle}
                      error={!!errors.alert_type}
                      helperText={errors.alert_type}
                    >
                      <MenuItem value={1}>High</MenuItem>
                      <MenuItem value={2}>Medium</MenuItem>
                      <MenuItem value={3}>Low</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Call Received From"
                      variant="outlined"
                      sx={inputStyle}
                    >
                      <MenuItem value={1}>Social Media</MenuItem>
                      <MenuItem value={2}>WhatsApp</MenuItem>
                    </TextField>
                  </Grid>
                </>
              )}
              <Grid item xs={12} sm={selectedEmergencyValue === 1 ? 6 : 4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Caller Number"
                  variant="outlined"
                  sx={inputStyle}
                  value={callerNumber}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,10}$/.test(value)) {
                      setCallerNumber(value);
                    }
                  }}
                  inputProps={{
                    maxLength: 10,
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                  }}
                  error={!!errors.caller_no}
                  helperText={errors.caller_no}
                />
              </Grid>
              <Grid item xs={12} sm={selectedEmergencyValue === 1 ? 6 : 4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Caller Name"
                  variant="outlined"
                  sx={inputStyle}
                  value={callerName}
                  // onChange={(e) => setCallerName(e.target.value)}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[a-zA-Z\s]*$/.test(value)) {
                      setCallerName(value);
                    }
                  }}
                  error={!!errors.caller_name}
                  helperText={errors.caller_name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Location"
                  variant="outlined"
                  sx={inputStyle}
                  onChange={handleSearchChange}
                  onClick={() => handleSelectSuggestion()}
                  value={query || ""}
                  error={!!errors.location}
                  helperText={errors.location}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small" sx={inputStyle}>
                  <InputLabel id="district-label">District</InputLabel>
                  <Select
                    labelId="district-label"
                    id="district-select"
                    value={
                      districtName &&
                      districts.find(
                        (d) =>
                          d.dis_name.toLowerCase() ===
                          districtName.toLowerCase()
                      )
                        ? districts.find(
                            (d) =>
                              d.dis_name.toLowerCase() ===
                              districtName.toLowerCase()
                          ).dis_id
                        : selectedDistrictId || ""
                    }
                    label="District"
                    onChange={(e) => setSelectedDistrictId(e.target.value)}
                  >
                    {districts.map((district) => (
                      <MenuItem key={district.dis_id} value={district.dis_id}>
                        {district.dis_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Tehsil"
                  variant="outlined"
                  value={
                    tehsilName &&
                    Tehsils.find(
                      (t) =>
                        t.tah_name.toLowerCase() === tehsilName.toLowerCase()
                    )
                      ? Tehsils.find(
                          (t) =>
                            t.tah_name.toLowerCase() ===
                            tehsilName.toLowerCase()
                        ).tah_id
                      : selectedTehsilId || ""
                  }
                  onChange={(e) => setSelectedTehsilId(e.target.value)}
                  sx={inputStyle}
                >
                  {Tehsils.map((tehsil) => (
                    <MenuItem key={tehsil.tah_id} value={tehsil.tah_id}>
                      {tehsil.tah_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Ward"
                  variant="outlined"
                  value={selectedWard || ""}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  sx={{
                    ...inputStyle,
                    "& .MuiSelect-select": {
                      overflowY: "auto",
                      "&::-webkit-scrollbar": {
                        width: "6px",
                      },
                      "&::-webkit-scrollbar-track": {
                        background: darkMode ? "#2e2e2e" : "#f1f1f1",
                        borderRadius: "3px",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        background: darkMode ? "#555" : "#888",
                        borderRadius: "3px",
                      },
                      "&::-webkit-scrollbar-thumb:hover": {
                        background: darkMode ? "#777" : "#555",
                      },
                    },
                  }}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        style: {
                          maxHeight: 200,
                        },
                      },
                    },
                  }}
                >
                  {ward.map((ward) => (
                    <MenuItem key={ward.pk_id} value={ward.pk_id}>
                      {ward.ward_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Ward Officer</InputLabel>
                  <Select
                    multiple
                    value={selectedWardOfficer}
                    onChange={handleCheckboxChangeWardOfficer}
                    renderValue={(selected) =>
                      wardOfficer
                        .filter((officer) => selected.includes(officer.emp_id))
                        .map((officer) => officer.emp_name)
                        .join(", ")
                    }
                  >
                    {wardOfficer.map((wardOff) => (
                      <MenuItem key={wardOff.emp_id} value={wardOff.emp_id}>
                        <Checkbox
                          checked={selectedWardOfficer.includes(wardOff.emp_id)}
                        />
                        <ListItemText primary={wardOff.emp_name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  select
                  size="small"
                  label="Summary"
                  variant="outlined"
                  sx={{
                    ...inputStyle,
                    width: {
                      xs: "100%", // 📱 mobile full width
                      sm: "300px", // 📲 tablet
                      md: "675px", // 💻 desktop
                      // lg: "800px",
                    },
                  }}
                  value={summaryId}
                  onChange={(e) => setSummaryId(e.target.value)}
                  error={!!errors.summary}
                  helperText={errors.summary}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        sx: {
                          width: {
                            xs: "100%", // 📱 mobile
                            sm: "300px", // 📲 tablet
                            md: "675px", // 💻 desktop
                            // lg: "800px",
                          },
                          maxWidth: "none",
                          maxHeight: 400,
                        },
                      },
                    },
                  }}
                >
                  <MenuItem disabled value="">
                    Select Summary
                  </MenuItem>
                  {summary.map((item) => (
                    <MenuItem
                      key={item.sum_id}
                      value={item.sum_id}
                      sx={{
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        maxWidth: "100%",
                      }}
                    >
                      {item.summary}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {selectedEmergencyValue === 2 && (
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Comments"
                    multiline
                    className="textarea"
                    rows={3}
                    variant="outlined"
                    sx={{ ...inputStyle }}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    error={!!errors.comments}
                    helperText={errors.comments}
                  />
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <IncidentCreateMap />
        </Grid>

        {selectedEmergencyValue === 1 && (
          <Grid item xs={12}>
            <Paper
              elevation={3}
              sx={{
                ...inputStyle,
                p: 1.5,
                borderRadius: 3,
                backgroundColor: bgColor,
              }}
            >
              <Grid container spacing={2}>
                <Grid
                  item
                  xs={12}
                  md={3}
                  sx={{
                    borderRight: { md: `1px solid white` },
                    pr: 2,
                    mt: 1.5,
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: labelColor,
                        fontWeight: 500,
                        fontFamily,
                        fontSize: "16px",
                      }}
                    >
                      Incident Type
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontFamily,
                        mb: 2,
                        ml: 1,
                        color: labelColor1,
                        fontSize: "15px",
                        // color: selectedEmergencyValue === 1 ? 'red' : 'green'
                      }}
                    >
                      {selectedEmergencyValue === 1
                        ? "Emergency"
                        : "Non-Emergency"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: labelColor,
                        fontWeight: 500,
                        fontFamily,
                        fontSize: "16px",
                      }}
                    >
                      Alert Type
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontFamily,
                        mb: 2,
                        ml: 1,
                        color: labelColor1,
                        fontSize: "15px",
                      }}
                    >
                      {alertType === 1
                        ? "High"
                        : alertType === 2
                        ? "Medium"
                        : alertType === 2
                        ? "Low"
                        : "-"}
                    </Typography>
                  </Box>
                  {/* <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: labelColor,
                        fontWeight: 500,
                        fontFamily,
                        fontSize: "16px",
                      }}
                    >
                      Disaster Type
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontFamily,
                        mb: 2,
                        ml: 1,
                        color: labelColor1,
                        fontSize: "15px",
                      }}
                    >
                      {disaster.find(
                        (item) => item.disaster_id === selectedDisaster
                      )?.disaster_name || "-"}
                    </Typography>
                  </Box> */}
                </Grid>

                {/* SOP Section */}
                <Grid
                  item
                  xs={12}
                  md={5}
                  sx={{
                    px: 2,
                    borderRight: { md: `1px solid white` },
                    mt: 1.5,
                  }}
                >
                  <Box sx={boxStyle}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: labelColor,
                          fontWeight: 500,
                          fontFamily,
                          fontSize: "16px",
                        }}
                      >
                        Response Procedure
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => setOpenSopModal(true)}
                        sx={{ color: "orange", ml: 1 }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontFamily,
                        cursor: "pointer",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 300,
                        color: labelColor1,
                        marginLeft: "15px",
                      }}
                    >
                      {(() => {
                        const sops = responderScope?.sop_responses || [];
                        if (sops.length === 0) return "No SOP description";
                        const shown = sops
                          .slice(0, 2)
                          .map(
                            (sop) => sop.sop_description || "No SOP description"
                          );
                        let text = shown.join(", ");
                        if (sops.length > 2) text += " ...";
                        return text;
                      })()}
                    </Typography>
                    {/* </Tooltip> */}

                    <Dialog
                      open={openSopModal}
                      onClose={() => setOpenSopModal(false)}
                      maxWidth="sm"
                      fullWidth
                    >
                      <DialogTitle
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        All Response Procedures
                        <IconButton
                          aria-label="close"
                          onClick={() => setOpenSopModal(false)}
                          sx={{
                            color: (theme) => theme.palette.grey[500],
                            ml: 2,
                          }}
                          size="small"
                        >
                          <CloseIcon />
                        </IconButton>
                      </DialogTitle>
                      <DialogContent dividers>
                        {responderScope?.sop_responses?.length > 0 ? (
                          responderScope.sop_responses.map((sop, idx) => (
                            <Typography key={sop.sop_id || idx} sx={{ mb: 1 }}>
                              {sop?.sop_description || "No SOP description"}
                            </Typography>
                          ))
                        ) : (
                          <Typography>No SOP description</Typography>
                        )}
                      </DialogContent>
                    </Dialog>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: labelColor,
                        fontWeight: 500,
                        fontFamily,
                        fontSize: "16px",
                      }}
                    >
                      Responder Scope
                    </Typography>

                    <Stack spacing={1} mt={1}>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {responderScope?.responder_scope?.map((responder) => (
                          <FormControlLabel
                            key={responder.res_id}
                            control={
                              <Checkbox
                                checked={sopId.includes(responder.res_id)}
                                onChange={() =>
                                  handleCheckboxChange(responder.res_id)
                                }
                                sx={{ color: labelColor }}
                              />
                            }
                            label={
                              <Typography
                                variant="subtitle2"
                                sx={{ fontFamily }}
                              >
                                {responder.responder_name}
                              </Typography>
                            }
                          />
                        ))}
                      </Box>
                    </Stack>

                    {errors?.responder_scope && (
                      <Typography color="error" variant="body2" mt={1}>
                        {errors.responder_scope}
                      </Typography>
                    )}

                    {/* Button to open modal */}
                    <Button
                      variant="contained"
                      onClick={handleOpenModal}
                      disabled={sopId.length === 0}
                      sx={{ mt: 2 }}
                    >
                      Assign Ambulance
                    </Button>
                    {errors?.assignAmbulance && (
                      <Typography color="error" variant="body2" mt={1}>
                        {errors.assignAmbulance}
                      </Typography>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: labelColor,
                      fontWeight: 500,
                      fontFamily,
                      fontSize: "16px",
                    }}
                    gutterBottom
                  >
                    Comments
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    className="textarea"
                    rows={6}
                    variant="outlined"
                    sx={{ ...inputStyle }}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    error={!!errors.comments}
                    helperText={errors.comments}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}

        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              sx={{
                width: "10%",
                backgroundColor: "rgb(18,166,95)",
                color: "white",
                // fontWeight: "bold",
                borderRadius: "12px",
                mb: 5,
                textTransform: "none",
              }}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </Box>
        </Grid>
      </Grid>

      {openModal && (
        <ResponderModal
          open={openModal}
          responderList={selectedResponders}
          responder={activeResponder}
          lattitude={lattitude}
          longitude={longitude}
          assignedMap={assignedMap}
          onClose={() => setOpenModal(false)}
          onSave={(data) => {
            console.log("Saved Data:", data);
            setAssignedMap(data.assignedVehicles);
            setOpenModal(false);
          }}
        />
      )}
    </Box>
  );
};

export default Incident;
