import React, { useEffect, useState } from "react";
import { Grid, Box, Snackbar } from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { useLocation } from "react-router-dom";
import axios from "axios";

import SopTask from "../SOP/SopTask";
import IncidentDetails from "../SOP/IncidentDetails";
import CaseClosureDetails from "./CaseClosureDetails";
import { useAuth } from "../../../Context/ContextAPI";

function Sop({ darkMode, setDarkMode, comments }) {
  // Listen for logout event from other tabs
  window.addEventListener("storage", (e) => {
    if (e.key === "logout") {
      location.href = "/login";
    }
  });

  useEffect(() => {
    document.title = "DMS|Sop";
  }, []);

  const port = import.meta.env.VITE_APP_API_KEY;
  const Token = localStorage.getItem("access_token");
  const {
    newToken,
    responderScope,
    fetchResponderScope,
    setDisaterid,
    setDisasterIdFromSop,
  } = useAuth();
  const location = useLocation();

  const flagFromState = location?.state?.triggerStatus ?? 0;
  const [flag, setFlag] = useState(flagFromState);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidentDetails, setIncidentDetails] = useState(null);
  console.log(" incidentDetails", incidentDetails);
  const [incidentId, setIncidentId] = useState(null);
  const [incidentIdClosure, setIncidentIdClosure] = useState(null);

  console.log(incidentId, incidentIdClosure, 'incidentIdClosureincidentIdClosure');

  // const [disasterIdFromSop, setDisasterIdFromSop] = useState(null);
  const { setSelectedIncidentFromSop } = useAuth();
  const [highlightedId, setHighlightedId] = useState(null);



  const [dispatchList, setDispatchList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewmode, setViewmode] = useState("incident");

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // useEffect(() => {
  //   if (selectedIncident?.disaster_id_id) {
  //     console.log(
  //       "Setting disaster id in context:",
  //       selectedIncident.disaster_id_id
  //     );
  //     setDisaterid(selectedIncident.disaster_id_id);
  //     fetchResponderScope(selectedIncident.disaster_id_id);
  //   }
  // }, [selectedIncident]);


  useEffect(() => {
    if (selectedIncident?.disaster_id_id) {
      console.log(
        "Setting disaster id in context:",
        selectedIncident.disaster_id_id
      );
      setDisaterid(selectedIncident.disaster_id_id);
      fetchResponderScope(selectedIncident.disaster_id_id);
      setSelectedIncidentFromSop(selectedIncident); // Add this line
    }
  }, [selectedIncident]);



  useEffect(() => {
    const handleOnline = () => {
      setSnackbarMessage("System is Online ");
      setShowSnackbar(true);

      setTimeout(() => {
        setShowSnackbar(false);
        window.location.reload();
      }, 2000);
    };

    const handleOffline = () => {
      setSnackbarMessage("No Internet Connection ❌");
      setShowSnackbar(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);


  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const fetchDispatchList = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${port}/admin_web/dispatch_get/`, {
        headers: {
          Authorization: `Bearer ${Token || newToken}`,
        },
      });

      // Sort by latest created_at or ID
      const sortedData = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setDispatchList(sortedData);
    } catch (err) {
      console.error("Failed to fetch dispatch list", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDispatchList();
  }, []);

  // const fetchIncidentDetails = async () => {
  //   if (!incidentId) return;
  //   console.log("Fetching incident details for ID:", incidentId);
  //   try {
  //     setLoading(true);
  //     const res = await axios.get(
  //       `${port}/admin_web/incident_get/${incidentId}/`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${Token || newToken}`,
  //         },
  //       }
  //     );
  //     const incidentData = res.data;
  //     console.log(
  //       "Disaster Detail Fetched",
  //       incidentData.incident_details[0]?.disaster_type
  //     );
  //     setDisasterIdFromSop(incidentData.incident_details[0]?.disaster_type);

  //     setIncidentDetails(res.data);
  //     // console.log("Incident Details:", res.data);
  //     setSelectedIncident(res.data);
  //   } catch (error) {
  //     console.error("Error fetching incident details:", error);
  //     setSnackbarMessage("Failed to load incident details");
  //     setShowSnackbar(true);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const selectedIncidentValue = incidentId || incidentIdClosure;

  const fetchIncidentDetails = async () => {
    if (!selectedIncidentValue) return;
    console.log("Fetching incident details for ID:", selectedIncidentValue);
    try {
      setLoading(true);
      const res = await axios.get(
        `${port}/admin_web/incident_get/${selectedIncidentValue}/`,
        {
          headers: {
            Authorization: `Bearer ${Token || newToken}`,
          },
        }
      );
      const incidentData = res.data;
      console.log("Disaster Detail Fetched", incidentData);

      const details = incidentData.incident_details[0] || {};
      const enhancedIncident = {
        ...incidentData,
        incident_id: details.incident_id,
        disaster_name: details.disaster_name,
        alert_type: details.alert_type,
        inc_id: incidentData.inc_id,
        comments: incidentData.comments || [],
        respondersScope: incidentData["responders scope"] || [],
      };

      setDisasterIdFromSop(details.disaster_type);
      setIncidentDetails(incidentData);
      setSelectedIncident(enhancedIncident);
      setSelectedIncidentFromSop(enhancedIncident, incidentData);
    } catch (error) {
      console.error("Error fetching incident details:", error);
      setSnackbarMessage("Failed to load incident details");
      setShowSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedIncidentValue) {
      fetchIncidentDetails();
    }
  }, [selectedIncidentValue]);


  return (
    <Box
      sx={{
        ml: { xs: 2.5 },
        pr: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2, sm: 3 },
        mx: 0,
        px: 0,
        // backgroundColor: darkMode ? "#0a1929" : "#f5f5f5",
        minHeight: "100vh",
        transition: "background-color 0.5s ease-in-out, color 0.5s ease-in-out",
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <SopTask
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            flag={flag}
            setFlag={setFlag}
            setSelectedIncident={setSelectedIncident}
            setViewmode={setViewmode}
            dispatchList={dispatchList}
            loading={loading}
            incidentId={incidentId}
            setIncidentId={setIncidentId}
            setIncidentIdClosure={setIncidentIdClosure}
            incidentid={incidentId}
            incidentIdClosure={incidentIdClosure}
            selectedIncident={selectedIncident}
            fetchDispatchList={fetchDispatchList}
            highlightedId={highlightedId}
            setHighlightedId={setHighlightedId}
            fetchIncidentDetails={fetchIncidentDetails}
          />
        </Grid>

        {viewmode !== "closure" ? (
          <Grid item xs={12}>
            <IncidentDetails
              darkMode={darkMode}
              flag={flag}
              setFlag={setFlag}
              selectedIncident={selectedIncident}
              setSelectedIncident={setSelectedIncident}
              responderScope={responderScope}
              fetchResponderScope={fetchResponderScope}
              dispatchList={dispatchList}
              fetchDispatchList={fetchDispatchList}
              incidentDetails={incidentDetails}
              highlightedId={highlightedId}
              setHighlightedId={setHighlightedId}
              fetchIncidentDetails={fetchIncidentDetails}
            />
          </Grid>
        ) : (
          <Grid item xs={12}>
            <CaseClosureDetails
              darkMode={darkMode}
              flag={flag}
              setFlag={setFlag}
              setSelectedIncident={setSelectedIncident}
              selectedIncident={selectedIncident}
              responderScope={responderScope}
              fetchResponderScope={fetchResponderScope}
              fetchDispatchList={fetchDispatchList}
              highlightedId={highlightedId}
              setHighlightedId={setHighlightedId}
              fetchIncidentDetails={fetchIncidentDetails}
            />
          </Grid>
        )}

        <Snackbar
          open={showSnackbar}
          autoHideDuration={3000}
          onClose={() => setShowSnackbar(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setShowSnackbar(false)}
            severity={snackbarMessage.includes("Online") ? "success" : "error"}
            sx={{ width: "100%", fontWeight: "bold", fontSize: "16px" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Grid>
    </Box>
  );
}

export default Sop;
