import {
  Paper,
  Grid,
  Typography,
  Box,
  Stack,
  Checkbox,
  FormControlLabel,
  Skeleton,
  Tooltip,
  MenuItem,
  TextField,
  InputAdornment,
  Autocomplete,
  Popper,
  Button,
  DialogActions,
} from "@mui/material";
import CommentsPanel from "./CommentsPanel";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useAuth } from "../../../Context/ContextAPI";
import { useEffect, useState } from "react";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import CloseIcon from "@mui/icons-material/Close";
import { ArrowDropDownCircleOutlined } from "@mui/icons-material";
import * as turf from "@turf/turf";
import ResponderModal from "./ResponderModal";

function IncidentDetails({
  darkMode,
  flag,
  setFlag,
  selectedIncident,
  responderScope,
  fetchDispatchList,
  incidentDetails,
  setSelectedIncident,
  fetchIncidentDetails,
  highlightedId,
  setHighlightedId,
}) {
  // Define colors and styles based on dark mode
  const labelColor = darkMode ? "#5FC8EC" : "#1976d2";
  const textColor = darkMode ? "#ffffff" : "#000000";
  const borderColor = darkMode ? "#7F7F7F" : "#ccc";
  const fontFamily = "Roboto, sans-serif";

  const boxStyle = {
    mb: 2,
    pb: 1.5,
    borderBottom: `1px solid ${borderColor}`,
  };
  const Style = {
    // mb: 2,
    // pb: 1.5,
    // // borderBottom: `1px solid ${borderColor}`,
  };

  const inputStyle = {
    mb: 0.5,
    color: "white",
  };

  // =================== STORAGE LISTENER FOR AUTO-LOGOUT ===================
  window.addEventListener("storage", (e) => {
    if (e.key === "logout") {
      location.href = "/login";
    }
  });
  // =================== ENVIRONMENT & LOCALSTORAGE VALUES ==================
  const port = import.meta.env.VITE_APP_API_KEY;
  const token = localStorage.getItem("access_token");
  const userName = localStorage.getItem("userId");
  window.addEventListener("storage", (e) => {
    if (e.key === "logout") {
      location.href = "/login";
    }
  });

  // ================================ STATES ================================
  const [selectedWard, setSelectedWard] = useState("");
  const [wardList, setWardList] = useState([]);
  const [selectedSummary, setSelectedSummary] = useState("");
  const [summaryList, setSummaryList] = useState([]);
  const [selectedWardOfficer, setSelectedWardOfficer] = useState([]);
  const [wardOfficerList, setWardOfficerList] = useState([]);
  const [selectedResponders, setSelectedResponders] = useState([]);
  const [lattitude, setLatitude] = useState("");
  const [Longitude, setLongitude] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  const [stateData, setStateData] = useState(null);

  // =========== FLAGS FOR MANUAL FIELD OVERRIDE ============================
  const [districtManual, setDistrictManual] = useState(false);
  const [tehsilManual, setTehsilManual] = useState(false);
  const [wardManual, setWardManual] = useState(false);

  //responder modal
  const [activeResponder, setActiveResponder] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [assignedMap, setAssignedMap] = useState({});
  const [vehicleIds, setVehicleIds] = useState([]);
  const [openAmbulanceModal, setOpenAmbulanceModal] = useState(false);

  // ✅ Button click pe modal open
  const handleOpenModal = () => {
    setActiveResponder(selectedResponders[0]); // default tab first responder
    setOpenModal(true);
  };

  // =================== CONTEXT (useAuth) VARIABLES ========================

  const {
    wardName,
    setWardName,
    tehsilName,

    districtName,
  } = useAuth();

  // ======= MORE CONTEXT FROM AUTH (FOR LOCATION / DROPDOWNS / API) ========
  const {
    newToken,
    disaterid,
    setResponderScopeForDispatch,
    responderScopeForDispatch,
    districts,
    fetchDistrictsByState,
    Tehsils,
    setTehsilName,
    setDistrictName,
    selectedDistrictId,
    selectedTehsilId,
    selectedCityID,
    setSelectedStateId,
    setSelectedDistrictId,
    setSelectedTehsilId,
    setSelectedCityId,
    fetchTehsilsByDistrict,
    query,
    handleSearchChange,
    suggestions,
    handleSelectSuggestion,
    location,
    latitude,
    longitude,
    setQuery,
  } = useAuth();

  // ==================== INCIDENT HANDLING ===============================
  let incident = {};

  if (selectedIncident?.inc_id) {
    incident = incidentDetails?.incident_details?.[0] || {};
  }

  // ============ FETCH DISTRICTS ON LOAD =============================
  useEffect(() => {
    fetchDistrictsByState();
  }, []);

  // ============ FETCH WARDS ON TEHSIL CHANGE ==========================

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
        setWardList(data);
      };
      fetchWardList();
    }
  }, [selectedTehsilId]);

  // ============ FETCH WARD OFFICERS ON WARD CHANGE =====================

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
        setWardOfficerList(data);
      };
      fetchWardOfficerList();
    }
  }, [selectedWard]);

  // =================== FETCH SUMMARY DATA =============================
  const fetchSummary = async () => {
    const res = await fetch(`${port}/admin_web/DMS_Summary_Get/1/`, {
      headers: {
        Authorization: `Bearer ${token || newToken}`,
      },
    });
    const data = await res.json();
    setSummaryList(data);
  };
  useEffect(() => {
    fetchSummary();
  }, []);

  // ============ SET LATITUDE/LONGITUDE FROM SELECTED INCIDENT ===========

  useEffect(() => {
    if (selectedIncident) {
      setLatitude(selectedIncident.latitude || "");
      setLongitude(selectedIncident.longitude || "");
    }
  }, [selectedIncident]);

  console.log(`Latitude: ${lattitude}, Longitude: ${Longitude}`);

  // ==================== GIS CODE START ================================

  // === Load GeoJSON for boundary matching ===
  useEffect(() => {
    fetch("/Boundaries/PUNEWARDS.geojson") // Your GeoJSON with ward, tehsil, district
      .then((res) => res.json())
      .then((data) => setStateData(data))
      .catch((err) => console.error("GeoJSON Load Error:", err));
  }, []);

  // === Load GeoJSON for boundary matching ===
  const getAdministrativeNames = (lat, lng, geojson) => {
    if (!geojson || !lat || !lng) return { ward: "", tehsil: "", district: "" };

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (isNaN(latNum) || isNaN(lngNum)) {
      console.log("❌ Invalid coordinates – skipping boundary match.");
      return { ward: "", tehsil: "", district: "" };
    }

    const point = turf.point([lngNum, latNum]);

    const matchedFeature = geojson.features.find((feature) =>
      turf.booleanPointInPolygon(point, feature)
    );

    if (matchedFeature) {
      const { Name1, Teshil, District } = matchedFeature.properties;
      return {
        ward: Name1 || "",
        tehsil: Teshil || "",
        //district: Name || ""
        district: District || "",
      };
    }

    return { ward: "", tehsil: "", district: "" };
  };

  // === Auto-set dropdowns based on matched boundaries ===
  useEffect(() => {
    if (!selectedIncident || !stateData || !stateData.features?.length) return;

    const { latitude, longitude } = selectedIncident;
    const { ward, tehsil, district } = getAdministrativeNames(
      latitude,
      longitude,
      stateData
    );

    if (!ward && !tehsil && !district) {
      console.log("⚠️ No match");
      return;
    }

    const matchedDistrict = districts?.find((d) => d.dis_name === district);
    const matchedTehsil = Tehsils?.find((t) => t.tah_name === tehsil);
    const matchedWard = wardList?.find((w) => w.ward_name === ward);

    if (matchedDistrict && !districtManual) {
      setSelectedDistrictId(matchedDistrict.dis_id);
    }
    if (matchedTehsil && !tehsilManual) {
      setSelectedTehsilId(matchedTehsil.tah_id);
    }
    if (matchedWard && !wardManual) {
      setSelectedWard(matchedWard.pk_id);
    }

    setWardName(ward);
    setTehsilName(tehsil);
    setDistrictName(district);
  }, [selectedIncident, stateData, districts, Tehsils, wardList]);

  // === Reset manual flags when incident changes ===

  useEffect(() => {
    if (selectedIncident) {
      setDistrictManual(false);
      setTehsilManual(false);
      setWardManual(false);
    }
  }, [selectedIncident]);
  // ==================== GIS CODE END ================================

  // ============ SET LOCATION INPUT FIELD BASED ON INCIDENT ============
  useEffect(() => {
    if (selectedIncident?.location) {
      setQuery(selectedIncident.location); // update input field via context
      handleSearchChange({ target: { value: selectedIncident.location } }); // trigger suggestions
    }
  }, [selectedIncident]);

  // ======== RESET FORM FIELDS WHEN NEW INCIDENT SELECTED =============

  useEffect(() => {
    if (selectedIncident) {
      setSelectedDistrictId("");
      setSelectedTehsilId("");
      setSelectedWard("");
      setSelectedWardOfficer([]);
      setSelectedSummary("");
    }
  }, [selectedIncident]);

  const respondersList = incidentDetails?.responders || [];

  const comments = incidentDetails?.comments || [];

  // Style for the box containing label and value
  // This can be customized further based on your design requirements

  // Function to render text with label and value

  // ================== RESPONDER & COMMENT DATA ========================
  // ============ SET DEFAULT RESPONDERS ===============================
  // useEffect(() => {
  //   if (Array.isArray(responderScope?.responder_scope)) {
  //     const defaultSelected = responderScope.responder_scope.map(
  //       (r) => r.res_id
  //     );
  //     setSelectedResponders(defaultSelected);
  //   }
  // }, [responderScope]);

  useEffect(() => {
    if (Array.isArray(responderScope?.responder_scope)) {
      setSelectedResponders([]); // default empty → sab unchecked
    }
  }, [responderScope]);

  // ================== FIELD VALIDATION LOGIC ==========================

  const [fieldErrors, setFieldErrors] = useState({});
  const validateFields = () => {
    const errors = {};
    if (!selectedDistrictId) errors.district = "District is required";
    if (!selectedTehsilId) errors.tehsil = "Tahsil is required";
    if (!selectedWard) errors.ward = "Ward is required";
    if (!selectedWardOfficer.length)
      errors.wardOfficer = "Ward Officer is required";
    if (!query) errors.location = "Location is required";
    if (!selectedSummary) errors.summary = "Summary is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return (
    <>
      <Typography variant="h6" color="#fff" sx={{ fontFamily, ml: 2 }}>
        Rules
      </Typography>

      <Paper
        elevation={3}
        sx={{
          p: 2,
          borderRadius: 2,
          backgroundColor: darkMode ? "202328" : "#fff",
          color: textColor,
          transition: "all 0.3s ease",
          mb: 5,
        }}
      >
        <Grid container>
          {/* Left Column */}
          <Grid
            item
            xs={12}
            md={4}
            sx={{
              borderRight: { md: `1px solid ${borderColor}` },
              pr: { md: 2 },
              mb: { xs: 2, md: 0 },
            }}
          >
            {flag === 1 ? (
              <Box
                sx={{
                  maxHeight: "280px",
                  overflowY: "auto",
                  pr: 1,
                  pb: 1,
                  scrollBehavior: "smooth",
                  "&::-webkit-scrollbar": {
                    width: "5px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: darkMode ? "#0288d1" : "#888",
                    borderRadius: 3,
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    backgroundColor: darkMode ? "#5FC8EC" : "#555",
                  },
                }}
              >
                <Grid container spacing={2}>
                  {/* DISTRICT */}
                  <Grid item xs={12} md={6}>
                    <Box sx={Style}>
                      <Typography
                        sx={{
                          color: labelColor,
                          fontWeight: 500,
                          fontFamily,
                          fontSize: "13.5px",
                        }}
                      >
                        District *
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        value={selectedDistrictId}
                        onChange={(e) => {
                          setDistrictManual(true); // Only this field is now manually controlled
                          setSelectedDistrictId(e.target.value);
                        }}
                        placeholder="Select District"
                        sx={{ mt: 0.5, fontFamily }}
                        error={!!fieldErrors.district}
                        helperText={fieldErrors.district}
                      >
                        <MenuItem value="" disabled>
                          Select District
                        </MenuItem>
                        {districts?.map((item) => (
                          <MenuItem key={item.dis_id} value={item.dis_id}>
                            {item.dis_name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  </Grid>

                  {/* TAHSIL */}
                  <Grid item xs={12} md={6}>
                    <Box sx={Style}>
                      <Typography
                        sx={{
                          color: labelColor,
                          fontWeight: 500,
                          fontFamily,
                          fontSize: "13.5px",
                        }}
                      >
                        Tahsil *
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        value={selectedTehsilId}
                        onChange={(e) => {
                          setTehsilManual(true);
                          setSelectedTehsilId(e.target.value);
                        }}
                        placeholder="Select Tahsil"
                        disabled={!selectedDistrictId}
                        sx={{ mt: 0.5, fontFamily }}
                        error={!!fieldErrors.tehsil}
                        helperText={fieldErrors.tehsil}
                      >
                        <MenuItem value="" disabled>
                          Select Tahsil
                        </MenuItem>
                        {Tehsils?.map((item) => (
                          <MenuItem key={item.tah_id} value={item.tah_id}>
                            {item.tah_name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  </Grid>

                  {/* WARD */}
                  <Grid item xs={12} md={6}>
                    <Box sx={Style}>
                      <Typography
                        sx={{
                          color: labelColor,
                          fontWeight: 500,
                          fontFamily,
                          fontSize: "13.5px",
                        }}
                      >
                        Ward *
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        value={selectedWard}
                        onChange={(e) => {
                          setWardManual(true);
                          setSelectedWard(e.target.value);
                        }}
                        placeholder="Select Ward"
                        sx={{
                          mt: 0.5,
                          ...inputStyle,
                          "& .MuiSelect-select": {
                            overflowY: "auto",
                            "&::-webkit-scrollbar": { width: "6px" },
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
                                maxWidth: 400,
                              },
                            },
                          },
                        }}
                        error={!!fieldErrors.ward}
                        helperText={fieldErrors.ward}
                      >
                        <MenuItem value="" disabled>
                          Select Ward
                        </MenuItem>
                        {wardList?.map((item) => (
                          <MenuItem key={item.pk_id} value={item.pk_id}>
                            {item.ward_name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  </Grid>

                  {/* WARD OFFICER */}
                  <Grid item xs={12} md={6}>
                    <Box sx={Style}>
                      <Typography
                        sx={{
                          color: labelColor,
                          fontWeight: 500,
                          fontFamily,
                          fontSize: "13.5px",
                        }}
                      >
                        Ward Officer *
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        SelectProps={{
                          multiple: true,
                          renderValue: (selected) =>
                            selected
                              .map((id) => {
                                const officer = wardOfficerList.find(
                                  (item) => item.emp_id === id
                                );
                                return officer ? officer.emp_name : id;
                              })
                              .join(", "),
                        }}
                        value={selectedWardOfficer}
                        onChange={(e) => setSelectedWardOfficer(e.target.value)}
                        disabled={!selectedWard}
                        sx={{ mt: 0.5, fontFamily }}
                        error={!!fieldErrors.wardOfficer}
                        helperText={fieldErrors.wardOfficer}
                      >
                        <MenuItem
                          value="all"
                          onClick={() => {
                            if (
                              selectedWardOfficer.length ===
                              wardOfficerList.length
                            ) {
                              setSelectedWardOfficer([]);
                            } else {
                              setSelectedWardOfficer(
                                wardOfficerList.map((item) => item.emp_id)
                              );
                            }
                          }}
                        ></MenuItem>
                        {wardOfficerList?.map((item) => (
                          <MenuItem key={item.emp_id} value={item.emp_id}>
                            <Checkbox
                              checked={
                                selectedWardOfficer.indexOf(item.emp_id) > -1
                              }
                            />
                            {item.emp_name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  </Grid>

                  {/* LOCATION */}
                  <Grid item xs={12}>
                    <Box sx={{}}>
                      <Typography
                        sx={{
                          color: labelColor,
                          fontWeight: 500,
                          fontFamily,
                          fontSize: "13.5px",
                        }}
                      >
                        Location *
                      </Typography>

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
                            sx={{ mt: 0.5, fontFamily }}
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

                  {/* SUMMARY */}
                  <Grid item xs={12}>
                    <Box sx={Style}>
                      <Typography
                        sx={{
                          color: labelColor,
                          fontWeight: 500,
                          fontFamily,
                          fontSize: "13.5px",
                        }}
                      >
                        Summary *
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        value={selectedSummary}
                        onChange={(e) => setSelectedSummary(e.target.value)}
                        placeholder="Select Summary"
                        sx={{ mt: 0.5, fontFamily }}
                        error={!!fieldErrors.summary}
                        helperText={fieldErrors.summary}
                      >
                        <MenuItem value="" disabled>
                          Select Summary
                        </MenuItem>
                        {summaryList?.map((item) => (
                          <MenuItem key={item.sum_id} value={item.sum_id}>
                            {item.summary}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <>
                <>
                  {incident?.mode === 2 ? (
                    <>
                      <Box
                        sx={{
                          // maxHeight: '250px', overflowY: 'auto',
                          scrollBehavior: "smooth",
                          "&::-webkit-scrollbar": {
                            width: "6px",
                          },
                          "&::-webkit-scrollbar-thumb": {
                            backgroundColor: darkMode ? "#0288d1" : "#888",
                            borderRadius: 3,
                          },
                          "&::-webkit-scrollbar-thumb:hover": {
                            backgroundColor: darkMode ? "#5FC8EC" : "#555",
                          },
                        }}
                      >
                        <Grid container spacing={2}>
                          {/* <Grid item xs={12} md={12}>
                          <Typography
                            variant="body2"
                            sx={{ color: labelColor, fontWeight: 500, fontFamily, fontSize: '18px', borderBottom: '1px solid #ccc' }}
                          >
                            Incident Details
                          </Typography>
                        </Grid> */}
                          {/* 
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: labelColor,
                                fontWeight: 500,
                                fontFamily,
                              }}
                            >
                              Caller Name
                            </Typography>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontFamily,
                                color: textColor,
                                wordBreak: "break-word",
                              }}
                            >
                              {incident?.caller_name || "N/A"}
                            </Typography>
                          </Box>
                        </Grid> */}

                          {/* <Grid item xs={12} md={6}>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: labelColor,
                                fontWeight: 500,
                                fontFamily,
                              }}
                            >
                              Caller Number
                            </Typography>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontFamily,
                                color: textColor,
                                wordBreak: "break-word",
                              }}
                            >
                              {incident?.caller_no || "N/A"}
                            </Typography>
                          </Box>
                        </Grid> */}

                          <Grid item xs={12} md={6}>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: labelColor,
                                  fontWeight: 500,
                                  fontFamily,
                                }}
                              >
                                Ward
                              </Typography>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontFamily,
                                  color: textColor,
                                  wordBreak: "break-word",
                                }}
                              >
                                {incident?.ward_name || "N/A"}
                              </Typography>
                            </Box>
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: labelColor,
                                  fontWeight: 500,
                                  fontFamily,
                                }}
                              >
                                Tehsil
                              </Typography>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontFamily,
                                  color: textColor,
                                  wordBreak: "break-word",
                                }}
                              >
                                {incident?.tahsil_name || "N/A"}
                              </Typography>
                            </Box>
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: labelColor,
                                  fontWeight: 500,
                                  fontFamily,
                                }}
                              >
                                District
                              </Typography>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontFamily,
                                  color: textColor,
                                  wordBreak: "break-word",
                                }}
                              >
                                {incident?.district_name || "N/A"}
                              </Typography>
                            </Box>
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: labelColor,
                                  fontWeight: 500,
                                  fontFamily,
                                }}
                              >
                                Location
                              </Typography>

                              {incident?.location &&
                              incident.location.length > 20 ? (
                                <Tooltip title={incident.location} arrow>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{
                                      fontFamily,
                                      color: textColor,
                                      wordBreak: "break-word",
                                      cursor: "pointer",
                                    }}
                                  >
                                    {incident.location.slice(0, 20)}...
                                  </Typography>
                                </Tooltip>
                              ) : (
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    fontFamily,
                                    color: textColor,
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {incident?.location || "N/A"}
                                </Typography>
                              )}
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: labelColor,
                                  fontWeight: 500,
                                  fontFamily,
                                }}
                              >
                                Ward Officer
                              </Typography>
                              {Array.isArray(incident?.ward_officer_name) &&
                              incident.ward_officer_name.length > 0 ? (
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    fontFamily,
                                    color: textColor,
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {incident.ward_officer_name
                                    .map((officer) => officer.ward_officer_name)
                                    .join(", ")}
                                </Typography>
                              ) : (
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    fontFamily,
                                    color: textColor,
                                    wordBreak: "break-word",
                                  }}
                                >
                                  N/A
                                </Typography>
                              )}
                            </Box>
                          </Grid>

                          <Grid item xs={12} md={12}>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: labelColor,
                                  fontWeight: 500,
                                  fontFamily,
                                }}
                              >
                                Summary
                              </Typography>

                              {incident?.summary_name &&
                              incident.summary_name.length > 40 ? (
                                <Tooltip title={incident.summary_name} arrow>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{
                                      fontFamily,
                                      color: textColor,
                                      wordBreak: "break-word",
                                      cursor: "pointer",
                                    }}
                                  >
                                    {incident.summary_name.slice(0, 40)}...
                                  </Typography>
                                </Tooltip>
                              ) : (
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    fontFamily,
                                    color: textColor,
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {incident?.summary_name || "N/A"}
                                </Typography>
                              )}
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </>
                  ) : (
                    <Box
                      sx={{
                        // maxHeight: '250px', overflowY: 'auto',
                        scrollBehavior: "smooth",
                        "&::-webkit-scrollbar": {
                          width: "6px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          backgroundColor: darkMode ? "#0288d1" : "#888",
                          borderRadius: 3,
                        },
                        "&::-webkit-scrollbar-thumb:hover": {
                          backgroundColor: darkMode ? "#5FC8EC" : "#555",
                        },
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: labelColor,
                                fontWeight: 500,
                                fontFamily,
                              }}
                            >
                              Caller Name
                            </Typography>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontFamily,
                                color: textColor,
                                wordBreak: "break-word",
                              }}
                            >
                              {incident?.caller_name || "N/A"}
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: labelColor,
                                fontWeight: 500,
                                fontFamily,
                              }}
                            >
                              Caller Number
                            </Typography>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontFamily,
                                color: textColor,
                                wordBreak: "break-word",
                              }}
                            >
                              {incident?.caller_no || "N/A"}
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: labelColor,
                                fontWeight: 500,
                                fontFamily,
                              }}
                            >
                              Ward
                            </Typography>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontFamily,
                                color: textColor,
                                wordBreak: "break-word",
                              }}
                            >
                              {incident?.ward_name || "N/A"}
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: labelColor,
                                fontWeight: 500,
                                fontFamily,
                              }}
                            >
                              Tehsil
                            </Typography>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontFamily,
                                color: textColor,
                                wordBreak: "break-word",
                              }}
                            >
                              {incident?.tahsil_name || "N/A"}
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: labelColor,
                                fontWeight: 500,
                                fontFamily,
                              }}
                            >
                              District
                            </Typography>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontFamily,
                                color: textColor,
                                wordBreak: "break-word",
                              }}
                            >
                              {incident?.district_name || "N/A"}
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: labelColor,
                                fontWeight: 500,
                                fontFamily,
                              }}
                            >
                              Location
                            </Typography>

                            {incident?.location &&
                            incident.location.length > 20 ? (
                              <Tooltip title={incident.location} arrow>
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    fontFamily,
                                    color: textColor,
                                    wordBreak: "break-word",
                                    cursor: "pointer",
                                  }}
                                >
                                  {incident.location.slice(0, 20)}...
                                </Typography>
                              </Tooltip>
                            ) : (
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontFamily,
                                  color: textColor,
                                  wordBreak: "break-word",
                                }}
                              >
                                {incident?.location || "N/A"}
                              </Typography>
                            )}
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: labelColor,
                                fontWeight: 500,
                                fontFamily,
                              }}
                            >
                              Ward Officer
                            </Typography>
                            {Array.isArray(incident?.ward_officer_name) &&
                            incident.ward_officer_name.length > 0 ? (
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontFamily,
                                  color: textColor,
                                  wordBreak: "break-word",
                                }}
                              >
                                {incident.ward_officer_name
                                  .map((officer) => officer.ward_officer_name)
                                  .join(", ")}
                              </Typography>
                            ) : (
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontFamily,
                                  color: textColor,
                                  wordBreak: "break-word",
                                }}
                              >
                                N/A
                              </Typography>
                            )}
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={12}>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: labelColor,
                                fontWeight: 500,
                                fontFamily,
                              }}
                            >
                              Summary
                            </Typography>

                            {incident?.summary_name &&
                            incident.summary_name.length > 40 ? (
                              <Tooltip title={incident.summary_name} arrow>
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    fontFamily,
                                    color: textColor,
                                    wordBreak: "break-word",
                                    cursor: "pointer",
                                  }}
                                >
                                  {incident.summary_name.slice(0, 40)}...
                                </Typography>
                              </Tooltip>
                            ) : (
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontFamily,
                                  color: textColor,
                                  wordBreak: "break-word",
                                }}
                              >
                                {incident?.summary_name || "N/A"}
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </>
              </>
            )}
          </Grid>

          {/* Middle Column */}
          <Grid
            item
            xs={12}
            md={4}
            sx={{
              borderRight: { md: `1px solid ${borderColor}` },
              px: { md: 2 },
              mb: { xs: 2, md: 0 },
            }}
          >
            {flag === 1 ? (
              <>
                {/* Alert-panel */}
                <Box sx={boxStyle}>
                  {/* Heading + Eye icon in one row */}
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ color: labelColor, fontWeight: 500, fontFamily }}
                    >
                      Response Procedure
                    </Typography>

                    {responderScope?.sop_responses?.[0]?.sop_description && (
                      <IconButton
                        size="small"
                        onClick={() => setOpenDialog(true)}
                        sx={{ color: "orange" }} // eye icon in orange
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  {/* Conditionally show response text or fallback */}
                  {selectedIncident?.inc_id === undefined ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle2" sx={{ fontFamily }}>
                        No response procedure available.
                      </Typography>
                    </Box>
                  ) : responderScope?.sop_responses?.[0]?.sop_description ? (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontFamily,
                          display: "-webkit-box",
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "normal", // required for clamping to work
                        }}
                      >
                        {responderScope.sop_responses[0].sop_description}
                      </Typography>

                      {/* Dialog showing full content */}
                      <Dialog
                        open={openDialog}
                        onClose={() => setOpenDialog(false)}
                        maxWidth="sm"
                        fullWidth
                      >
                        <DialogTitle
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            pr: 1,
                          }}
                        >
                          Response Procedure
                          <IconButton
                            aria-label="close"
                            onClick={() => setOpenDialog(false)}
                            size="small"
                          >
                            <CloseIcon />
                          </IconButton>
                        </DialogTitle>
                        <DialogContent>
                          <Typography
                            variant="body1"
                            sx={{ whiteSpace: "pre-line", fontFamily }}
                          >
                            {responderScope.sop_responses[0].sop_description}
                          </Typography>
                        </DialogContent>
                      </Dialog>
                    </Box>
                  ) : (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle2" sx={{ fontFamily }}>
                        No response procedure available.
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: labelColor, fontWeight: 500, fontFamily }}
                  >
                    Responder Scope
                  </Typography>
                  {responderScope?.responder_scope?.length > 0 ? (
                    <Stack spacing={1} mt={1}>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {responderScope.responder_scope.map(
                          ({ res_id, responder_name }) => (
                            <FormControlLabel
                              key={res_id}
                              control={
                                <Checkbox
                                  checked={selectedResponders.includes(res_id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      // add responder
                                      setSelectedResponders((prev) => [
                                        ...prev,
                                        res_id,
                                      ]);
                                      setActiveResponder({
                                        res_id,
                                        responder_name,
                                      });
                                    } else {
                                      // remove responder
                                      setSelectedResponders((prev) =>
                                        prev.filter((id) => id !== res_id)
                                      );
                                      if (activeResponder?.res_id === res_id) {
                                        setActiveResponder(null);
                                      }
                                    }
                                  }}
                                  sx={{ color: labelColor }}
                                />
                              }
                              label={
                                <Typography
                                  variant="subtitle2"
                                  sx={{ fontFamily }}
                                >
                                  {responder_name}
                                </Typography>
                              }
                            />
                          )
                        )}
                      </Box>

                      {/* View Responder Button */}
                      <Box mt={2}>
                        <Button
                          variant="contained"
                          size="small"
                          disabled={selectedResponders.length === 0} 
                          onClick={() => setOpenModal(true)}
                        >
                          View Responder
                        </Button>
                      </Box>
                    </Stack>
                  ) : (
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <Typography variant="subtitle2" sx={{ fontFamily }}>
                        Responder scope data not available.
                      </Typography>
                    </Box>
                  )}
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
              </>
            ) : (
              <>
                {/* Dispatch */}
                <Box sx={boxStyle}>
                  {/* Heading + Eye icon in one row */}
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ color: labelColor, fontWeight: 500, fontFamily }}
                    >
                      Response Procedure
                    </Typography>

                    {responderScope?.sop_responses?.[0]?.sop_description && (
                      <IconButton
                        size="small"
                        onClick={() => setOpenDialog(true)}
                        sx={{ color: "orange" }} // eye icon in orange
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  {/* Conditionally show response text or fallback */}
                  {selectedIncident?.inc_id === undefined ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle2" sx={{ fontFamily }}>
                        No response procedure available.
                      </Typography>
                    </Box>
                  ) : responderScope?.sop_responses?.[0]?.sop_description ? (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontFamily,
                          display: "-webkit-box",
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "normal", 
                        }}
                      >
                        {responderScope.sop_responses[0].sop_description}
                      </Typography>

                      {/* Dialog showing full content */}
                      <Dialog
                        open={openDialog}
                        onClose={() => setOpenDialog(false)}
                        maxWidth="sm"
                        fullWidth
                      >
                        <DialogTitle
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            pr: 1,
                          }}
                        >
                          Response Procedure
                          <IconButton
                            aria-label="close"
                            onClick={() => setOpenDialog(false)}
                            size="small"
                          >
                            <CloseIcon />
                          </IconButton>
                        </DialogTitle>
                        <DialogContent>
                          <Typography
                            variant="body1"
                            sx={{ whiteSpace: "pre-line", fontFamily }}
                          >
                            {responderScope.sop_responses[0].sop_description}
                          </Typography>
                        </DialogContent>
                      </Dialog>
                    </Box>
                  ) : (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle2" sx={{ fontFamily }}>
                        No response procedure available.
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: labelColor, fontWeight: 500, fontFamily }}
                  >
                    Responder Scope
                  </Typography>

                  {Array.isArray(incidentDetails?.["responders scope"]) &&
                  incidentDetails["responders scope"].length > 0 ? (
                    <Stack spacing={1} mt={1}>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {incidentDetails["responders scope"].map(
                          ({ responder_id, responder_name }) => {
                            const isChecked =
                              Array.isArray(incident?.responder_scope) &&
                              incident.responder_scope
                                .map(String)
                                .includes(String(responder_id));

                            return (
                              <FormControlLabel
                                key={responder_id}
                                control={
                                  <Checkbox
                                    checked={isChecked}
                                    disabled
                                    sx={{
                                      color: labelColor,
                                      "&.Mui-checked": {
                                        color: "#5FC8EC",
                                      },
                                      "&:hover": {
                                        backgroundColor:
                                          "rgba(0, 191, 165, 0.1)",
                                        borderRadius: "6px",
                                      },
                                    }}
                                  />
                                }
                                label={
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ fontFamily }}
                                  >
                                    {responder_name}
                                  </Typography>
                                }
                              />
                            );
                          }
                        )}
                      </Box>
                    </Stack>
                  ) : (
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      {/* <InfoOutlinedIcon color="disabled" /> */}
                      <Typography variant="subtitle2" sx={{ fontFamily }}>
                        No Responder Scope Assigned.
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Box mt={1}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setOpenAmbulanceModal(true)}
                    disabled={!selectedIncident} // <-- disable if no incident selected
                    sx={{
                      textTransform: "none",
                      borderRadius: "8px",
                      opacity: !selectedIncident ? 0.6 : 1, 
                    }}
                  >
                    View Responder
                  </Button>
                </Box>
              </>
            )}
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={4} pl={{ md: 2 }}>
            <Typography variant="subtitle2" mb={2} color="#5FC8EC">
              Comments
            </Typography>
            {selectedIncident ? (
              <CommentsPanel
                darkMode={darkMode}
                flag={flag}
                setFlag={setFlag}
                selectedResponders={selectedResponders}
                setSelectedResponders={setSelectedResponders}
                selectedIncident={selectedIncident}
                setSelectedIncident={setSelectedIncident}
                incidentDetails={incidentDetails}
                comments={comments}
                fetchDispatchList={fetchDispatchList}
                fetchIncidentDetails={fetchIncidentDetails}
                highlightedId={highlightedId}
                setHighlightedId={setHighlightedId}
                selectedDistrictId={selectedDistrictId}
                setSelectedDistrictId={setSelectedDistrictId}
                selectedTehsilId={selectedTehsilId}
                setSelectedTehsilId={setSelectedTehsilId}
                selectedWard={selectedWard}
                setSelectedWard={setSelectedWard}
                selectedWardOfficer={selectedWardOfficer}
                setSelectedWardOfficer={setSelectedWardOfficer}
                selectedSummary={selectedSummary}
                setSelectedSummary={setSelectedSummary}
                query={query}
                setQuery={setQuery}
                validateFields={validateFields}
                fieldErrors={fieldErrors}
                setFieldErrors={setFieldErrors}
                savedResponderData={vehicleIds}
              />
            ) : (
              <Typography
                variant="subtitle2"
                sx={{ fontFamily, color: "#fff", mt: 1 }}
              >
                Please select an incident to view comments.
              </Typography>
            )}
          </Grid>
        </Grid>

        {/* ASSIGND AMBULANCE MODAL */}

<Dialog
  open={openAmbulanceModal}
  onClose={() => setOpenAmbulanceModal(false)}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle
    sx={{
      backgroundColor: "#222",
      color: "#fff",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      p: 2,
    }}
  >
    <Typography variant="h6" sx={{ fontWeight: 600 }}>
      Assigned Responder
    </Typography>

    {/*  Close Icon on Right */}
    <IconButton
      aria-label="close"
      onClick={() => setOpenAmbulanceModal(false)}
      sx={{ color: "#fff" }}
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>

  <DialogContent dividers sx={{ backgroundColor: "#1a1a1a" }}>
    {Array.isArray(incidentDetails?.["responders scope"]) &&
    incidentDetails["responders scope"].length > 0 ? (
      incidentDetails["responders scope"].map(
        ({ responder_id, responder_name, vehicles }) => (
          <Box key={responder_id} mb={2}>
            {Array.isArray(vehicles) && vehicles.length > 0 ? (
              <Box>
                {vehicles.map((veh, idx) => (
                  <Box
                    key={idx}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      p: 1.5,
                      border: "1px solid #444",
                      borderRadius: 1,
                      mb: 1,
                      backgroundColor: "#333",
                      color: "#fff",
                    }}
                  >
                    {/*  Left side: responder name */}
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#fff" }}>
                      {responder_name}
                    </Typography>

                    {/*  Right side: vehicle number */}
                    <Typography variant="body2" sx={{ color: "#fff" }}>
                      {veh.vehicle_number}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: "#ccc" }}>
                No ambulances assigned
              </Typography>
            )}
          </Box>
        )
      )
    ) : (
      <Typography sx={{ color: "#ccc" }}>No responder scope available.</Typography>
    )}
  </DialogContent>
</Dialog>


      </Paper>
    </>
  );
}

export default IncidentDetails;
