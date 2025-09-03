import { useEffect, useState, useRef, useMemo } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Snackbar,
  Alert,
  Skeleton,
  Avatar,
  Stack,
  Tooltip,
} from "@mui/material";
import { useAuth } from "../../../Context/ContextAPI";

function CommentsPanel({
  darkMode,
  setFlag,
  flag,
  selectedIncident,
  selectedResponders,
  setSelectedResponders,
  fetchDispatchList,
  incidentDetails,
  fetchIncidentDetails,
  highlightedId,
  setHighlightedId,
  selectedDistrictId,
  selectedTehsilId,
  selectedWard,
  selectedWardOfficer,
  selectedSummary,
  query,

  setSelectedDistrictId,
  setSelectedTehsilId,
  setSelectedWard,
  setSelectedWardOfficer,
  setSelectedSummary,
  setQuery,
  validateFields,
  fieldErrors,
  setFieldErrors,
  vehicleIds,
}) {
  console.log(vehicleIds, "vehicleIds");
  const port = import.meta.env.VITE_APP_API_KEY;
  const userName = localStorage.getItem("userId");
  const { newToken, commentText, setCommentText } = useAuth();
  const Token = localStorage.getItem("access_token");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  console.log(selectedIncident, "selectedIncident in Comment");
  window.addEventListener("storage", (e) => {
    if (e.key === "logout") {
      location.href = "/login";
    }
  });

  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  const [allComments, setAllComments] = useState([]);
  console.log(commentText, "allCommentsssssssssss");

  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const bottomRef = useRef(null);

  const textColor = darkMode ? "#ffffff" : "#000000";
  const bgColor = darkMode ? "202328" : "#ffffff";

  const paperStyle = {
    padding: 1,
    marginTop: 0.5,
    borderRadius: 3,
    width: "100%",
    // maxWidth: 600,
    // minHeight: 220,
    // maxHeight: 800,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: bgColor,
    color: textColor,
    transition: "background-color 0.5s ease-in-out, color 0.5s ease-in-out",
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchComments = async () => {
    try {
      setIsLoadingComments(true);
      const response = await fetch(`${port}/admin_web/comment_get`);
      const data = await response.json();
      setAllComments(data || []);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [fetchIncidentDetails]);

  const handlealertSaveClick = async () => {
    // Prepare error object
    const errors = {};

    if (!commentText.trim()) errors.comment = "Comment is required";
    if (!selectedDistrictId) errors.district = "District is required";
    if (!selectedTehsilId) errors.tehsil = "Tehsil is required";
    if (!selectedWard) errors.ward = "Ward is required";
    if (!selectedWardOfficer || selectedWardOfficer.length === 0)
      errors.wardOfficer = "Ward Officer is required";
    if (!selectedSummary) errors.summary = "Summary is required";
    if (!query) errors.location = "Location is required";

    // If any errors, set them and show snackbar
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSnackbar({
        open: true,
        message: "Please fill all required fields.",
        severity: "error",
      });
      return;
    } else {
      setFieldErrors({});
    }

    const payload = {
      responder_scope: selectedResponders.map(String),
      alert_id: selectedIncident?.pk_id,
      disaster_type: selectedIncident?.disaster_id_id,
      comments: commentText,
      comm_added_by: userName,
      inc_added_by: userName,
      latitude: selectedIncident?.latitude,
      longitude: selectedIncident?.longitude,
      alert_type: selectedIncident?.alert_type,
      mode: "2",
      district: selectedDistrictId,
      tahsil: selectedTehsilId,
      ward: selectedWard,
      ward_officer: selectedWardOfficer.map(Number),
      summary: selectedSummary,
      location: query,
      vehicle: vehicleIds || [] ,
      
    };
    console.log("Payload to be sent:", payload);

    try {
      const response = await fetch(`${port}/admin_web/DMS_Incident_Post/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Token || newToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Dispatch alert sent successfully!",
          severity: "success",
        });
        setCommentText("");
        setSelectedResponders([]);
        setFlag(0);

        setHighlightedId(null);

        setSelectedDistrictId("");
        setSelectedTehsilId("");
        setSelectedWard("");
        setSelectedWardOfficer("");
        setSelectedSummary("");
        setQuery("");
        setFieldErrors({});
        await fetchDispatchList();
      } else {
        throw new Error("API Error");
      }
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Failed to send dispatch alert.",
        severity: "error",
      });
    }
  };

  const handleCommentSendClick = async () => {
    if (!commentText.trim()) return;

    try {
      const response = await fetch(
        `${port}/admin_web/comments_post/${selectedIncident?.inc_id}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Token || newToken}`,
          },
          body: JSON.stringify({
            comments: commentText,
            comm_added_by: userName,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to log comment activity.");

      setSnackbar({
        open: true,
        message: "Comment sent successfully!",
        severity: "success",
      });

      setCommentText("");
      await fetchDispatchList();
      fetchIncidentDetails();
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Failed to send comment.",
        severity: "error",
      });
    }
  };

  const getInitials = (name) => name?.charAt(0)?.toUpperCase() || "?";
  const incidentComments = useMemo(() => {
    if (
      Array.isArray(incidentDetails?.comments) &&
      incidentDetails.comments.length > 0
    ) {
      return incidentDetails.comments;
    }
    if (selectedIncident) {
      return allComments.filter(
        (item) => String(item?.incident_id) === String(selectedIncident?.inc_id)
      );
    }
    return [];
  }, [incidentDetails, allComments, selectedIncident]);

  const [saveButton, setSaveButton] = useState(false);

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

            if (act.actionName === "Save") {
              setSaveButton(true);
            }
          });
        });
      } else {
        console.warn("SOP module not found in permissions");
      }
    }
  }, []);

  return (
    <Paper elevation={1} sx={paperStyle}>
      {flag !== 1 && selectedIncident?.inc_id && (
        <Box
          mb={2}
          sx={{
            minHeight: 150,
            maxHeight: 150,

            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 1,
            px: 1,
            pr: 0.5,
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
          {incidentComments.length > 0 ? (
            incidentComments.map(
              ({
                comm_id,
                comments: commentMsg,
                comm_added_by,
                comm_added_date,
              }) => {
                const isOwnComment = comm_added_by === userName;
                return (
                  <Box
                    key={comm_id}
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="flex-end">
                      {/* Avatar */}
                      <Tooltip title={comm_added_by} arrow>
                        <Avatar
                          sx={{
                            bgcolor: "#0288d1", // Same for all
                            fontSize: 14,
                          }}
                        >
                          {comm_added_by
                            ? comm_added_by.charAt(0).toUpperCase()
                            : "?"}
                        </Avatar>
                      </Tooltip>

                      {/* Message Box */}
                      <Box
                        sx={{
                          backgroundColor: darkMode
                            ? "rgb(77,77,77)"
                            : "#f3f4f6",
                          color: darkMode ? "#e2e8f0" : "#111827",
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                          maxWidth: "80%",
                          wordBreak: "break-word",
                          whiteSpace: "pre-line",
                          textAlign: "left",
                        }}
                      >
                        <Typography variant="body2">
                          {commentMsg || "No comment message"}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontSize: "0.7rem", opacity: 0.7 }}
                        >
                          {comm_added_date
                            ? new Date(comm_added_date).toLocaleString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "N/A"}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                );
              }
            )
          ) : (
            <Typography variant="body2" color="text.secondary">
              No comments for this incident.
            </Typography>
          )}
          <div ref={bottomRef} />
        </Box>
      )}

      {flag === 1 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            borderRadius: 2,
            px: 2,
            py: 1.5,
            mt: 1,
          }}
        >
          <TextField
            placeholder="Type an Comment..."
            variant="outlined"
            fullWidth
            multiline
            minRows={4}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            InputProps={{
              sx: {
                fontSize: "0.95rem",
                color: textColor,
              },
            }}
          />
          {saveButton && (
            <Button
              variant="contained"
              color="primary"
              onClick={handlealertSaveClick}
              disabled={!commentText.trim()}
              sx={{ alignSelf: "flex-end", px: 4, textTransform: "none" }}
            >
              Save
            </Button>
          )}
        </Box>
      ) : selectedIncident?.inc_id ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            backgroundColor: darkMode ? "rgb(53, 51, 51)" : "#f9f9f9",
            borderRadius: 2,
            px: 1,
            py: 0.5,
            mt: 1,
          }}
        >
          <TextField
            placeholder={placeholderVisible ? "Type a comment..." : ""}
            variant="standard"
            fullWidth
            multiline
            maxRows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onFocus={() => setPlaceholderVisible(false)}
            onBlur={(e) => {
              if (e.target.value.trim() === "") setPlaceholderVisible(true);
            }}
            InputProps={{
              disableUnderline: true,
              sx: {
                fontSize: "0.9rem",
                color: textColor,
                px: 1,
                py: 0.5,
              },
            }}
            sx={{ backgroundColor: "transparent" }}
          />

          <Button
            variant="contained"
            onClick={handleCommentSendClick}
            disabled={!commentText.trim()}
            sx={{
              backgroundColor: "#0F4D0F",
              color: "#fff",
              borderRadius: 2,
              px: 3,
              whiteSpace: "nowrap",
              height: "100%",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#006400",
              },
            }}
          >
            Send
          </Button>
        </Box>
      ) : (
        // No Incident Selected UI
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, textAlign: "center", fontSize: "0.9rem" }}
        >
          Please select an incident
        </Typography>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default CommentsPanel;
