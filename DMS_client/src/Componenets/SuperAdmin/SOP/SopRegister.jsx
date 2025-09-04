import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  Grid,
  Popover,
  Snackbar,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  Tooltip,
} from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import {
  Search,
  DeleteOutline,
  EditOutlined,
  Description,
} from "@mui/icons-material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { styled } from "@mui/material/styles";
import { Alert } from "@mui/material";
import { Select, MenuItem } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "../../../Context/ContextAPI";
import { getCustomSelectStyles } from "../../../CommonStyle/Style";
import CloseIcon from "@mui/icons-material/Close"; // Add this import at the top

function SopRegister({ darkMode }) {
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

  const EnquiryCardBody = styled("tr")(({ theme, status }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: theme.palette.mode === "dark" ? "#112240" : "#fff",
    color: theme.palette.mode === "dark" ? "#fff" : "#000",
    marginTop: "0.5em",
    borderRadius: "8px",
    padding: "10px 12px",
    transition: "all 0.3s ease",
    cursor: "pointer",
    "&:hover": {
      boxShadow: `0 0 8px ${status === "Completed"
        ? "#00e67699"
        : status === "Pending"
          ? "#f4433699"
          : "#88888855"
        }`,
    },
    height: "40px",
  }));

  const StyledCardContent = styled("td")({
    padding: "0 8px",
    display: "flex",
    alignItems: "center",
  });

  const fontsTableHeading = {
    fontFamily: "Roboto",
    fontWeight: 500,
    fontSize: 14,
    letterSpacing: 0,
    textAlign: "center",
  };

  const inputBgColor = darkMode
    ? "rgba(255, 255, 255, 0.16)"
    : "rgba(0, 0, 0, 0.04)";

  const fontsTableBody = {
    fontFamily: "Roboto",
    fontWeight: 400,
    fontSize: 17,
    letterSpacing: 0,
    textAlign: "center",
  };

  const port = import.meta.env.VITE_APP_API_KEY;
  const { newToken, disaster } = useAuth();
  const token = localStorage.getItem("access_token");
  const textColor = darkMode ? "#ffffff" : "#000000";
  const bgColor = "linear-gradient(to bottom, #53bce1, rgb(173, 207, 216))";
  const paper = darkMode ? "202328":"#FFFFFF";
  const tableRow = "rgb(53 53 53)";
  const labelColor = darkMode ? "#5FECC8" : "#1976d2";
  const fontFamily = "Roboto, sans-serif";
  const borderColor = darkMode ? "#7F7F7F" : "#ccc";

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const selectStyles = getCustomSelectStyles(isDarkMode);
  const [description, setDescription] = useState("");
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const userName = localStorage.getItem("userId");
  const [sop, setSop] = useState([]);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // GET API SOP
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [sopId, setSopId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const [open, setOpen] = useState(false);
  const iconRef = useRef(null);
  const popoverRef = useRef(null);

  const [disasterError, setDisasterError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);

  const validateForm = () => {
    let isValid = true;

    if (!selectedDisaster) {
      setDisasterError(true);
      isValid = false;
    } else {
      setDisasterError(false);
    }

    if (!description.trim()) {
      setDescriptionError(true);
      isValid = false;
    } else {
      setDescriptionError(false);
    }

    return isValid;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        iconRef.current &&
        !iconRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleSubmit = async () => {
    const payload = {
      sop_description: description,
      disaster_id: selectedDisaster,
      sop_added_by: userName,
      sop_modified_by: userName,
    };

    try {
      const response = await fetch(`${port}/admin_web/sop_post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || newToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.status === 201) {
        setSnackbarMessage("SOP Registered Successfully");
        setSnackbarOpen(true);
        await fetchSop();
        setDescription("");
        setSelectedDisaster("");
      } else if (response.status === 409) {
        setSnackbarMessage("SOP already exists with this disaster type");
        setSnackbarOpen(true);
        setDescription("");
        setSelectedDisaster("");
      } else if (response.status === 500) {
        setSnackbarMessage("Internal Server Error");
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage(data?.detail || "Something went wrong");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  //  const handleOpen = (event, item) => {
  //   setAnchorEl(event.currentTarget); // this ensures it opens next to the icon
  //   setSelectedItem(item);
  //   setOpen(true);
  // };

  const handleOpen = (event, item) => {
    const rect = event.currentTarget.getBoundingClientRect();
    iconRef.current = event.currentTarget;

    setPopoverPosition({
      top: rect.top + window.scrollY,
      left: rect.right + 8,
    });

    setSelectedItem(item);
    setOpen(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const fetchSop = async () => {
    try {
      const response = await fetch(`${port}/admin_web/sop_get`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || newToken}`,
        },
      });

      const data = await response.json();
      if (response.status === 200) {
        setSop(data);
        console.log(data, "SOP");
        setPage(1);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchSop();
  }, [port, token, newToken]);

  const handleEdit = async (selectedItem) => {
    const Id = selectedItem.sop_id;
    setSopId(Id);
    setIsEditMode(true);

    try {
      const res = await axios.get(`${port}/admin_web/sop_put/${Id}`, {
        headers: {
          Authorization: `Bearer ${token || newToken}`,
        },
      });
      const data = res.data[0];

      setSelectedDisaster(data.disaster_id);
      setDescription(data.sop_description);
    } catch (err) {
      console.error("Error fetching department data:", err);
    }
  };

  const handleUpdate = async () => {
    const payload = {
      sop_description: description,
      disaster_id: selectedDisaster,
      sop_modified_by: userName,
    };

    try {
      const response = await fetch(`${port}/admin_web/sop_put/${sopId}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || newToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 200) {
        setSnackbarMessage("SOP Updated Successfully");
        setSnackbarOpen(true);
        await fetchSop();
      } else if (response.status === 409) {
        setSnackbarMessage("SOP already exists with this disaster type");
        setSnackbarOpen(true);
        setDescription("");
        setSelectedDisaster("");
      } else if (response.status === 500) {
        setSnackbarMessage("Internal Server Error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleDelete = async (selectedItem) => {
    try {
      const res = await axios.delete(
        `${port}/admin_web/sop_delete/${selectedItem.sop_id}/`,
        {
          headers: {
            Authorization: `Bearer ${token || newToken}`,
          },
        }
      );

      console.log("Delete success:", res.data);
      setSnackbarMessage("SOP Deleted Successfully");
      await fetchSop();
      setSnackbarOpen(true);
      handleClose();
    } catch (err) {
      console.error("Error deleting department:", err);
    }
  };

  const totalPages = Math.ceil(sop.length / rowsPerPage);
  // const paginatedData = sop.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const anchorRect = anchorEl?.getBoundingClientRect();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = sop.filter(
    (item) =>
      item.disaster_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sop_description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Then paginate
  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const [descDialogOpen, setDescDialogOpen] = useState(false);
  const [descDialogText, setDescDialogText] = useState("");
  return (
    <div style={{ marginLeft: "3.5rem" }}>
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

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, pb: 2, mt: 3 }}>
        <Typography
          variant="h6"
          sx={{
            color: "rgb(95,200,236)",
            fontWeight: 600,
            fontFamily,
            fontSize: 18,
          }}
        >
          Register SOP
        </Typography>

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
            width: "250px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "25px",
              backgroundColor: darkMode ? "#1e293b" : "#fff",
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
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper
            elevation={3}
            sx={{
              padding: 2,
              borderRadius: 3,
              backgroundColor: paper,
              mt: 1,
              mb: 5,
              ml: 1,
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <EnquiryCard
                      sx={{
                        backgroundColor: bgColor,
                        color: "#000",
                        display: "flex",
                        width: "100%",
                        borderRadius: 2,
                        p: 2,
                      }}
                    >
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
                          flex: 1.9,
                          borderRight: "1px solid black",
                          justifyContent: "center",
                          ...fontsTableHeading,
                        }}
                      >
                        <Typography variant="subtitle2">
                          Disaster Name
                        </Typography>
                      </StyledCardContent>

                      <StyledCardContent
                        sx={{
                          flex: 2,
                          borderRight: "1px solid black",
                          justifyContent: "center",
                          ...fontsTableHeading,
                        }}
                      >
                        <Typography variant="subtitle2">Description</Typography>
                      </StyledCardContent>

                      <StyledCardContent
                        sx={{
                          flex: 0.5,
                          justifyContent: "center",
                          ...fontsTableHeading,
                        }}
                      >
                        <Typography variant="subtitle2">Action</Typography>
                      </StyledCardContent>
                    </EnquiryCard>
                  </TableRow>
                </TableHead>

                <Box sx={{
                  height: '250px',
                  overflowY: 'auto',
                  paddingRight: '10px',
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: darkMode ? '#2e2e2e' : '#f1f1f1',
                    borderRadius: '3px',
                    marginTop: '1rem',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: darkMode ? "#5FC8EC" : "#555",
                    borderRadius: '3px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: darkMode ? '#777' : '#555',
                  },
                }}>
                  <Table>
                    <TableBody>
                      {paginatedData.map((item, index) => (
                        <EnquiryCardBody
                          key={(page - 1) * rowsPerPage + index}
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
                          <StyledCardContent
                            sx={{ flex: 0.6, justifyContent: "center" }}
                          >
                            <Typography variant="subtitle2" sx={fontsTableBody}>
                              {(page - 1) * rowsPerPage + index + 1}
                            </Typography>
                          </StyledCardContent>

                          <StyledCardContent
                            sx={{
                              flex: 1.9,
                              justifyContent: "center",
                              ...fontsTableBody,
                            }}
                          >
                            <Typography variant="subtitle2">
                              {item.disaster_name || "-"}
                            </Typography>
                          </StyledCardContent>

                          <StyledCardContent
                            sx={{
                              flex: 2,
                              justifyContent: "left",
                              ...fontsTableBody,
                            }}
                          >
                            {/* <Tooltip
                          title={item.sop_description || ""}
                          arrow
                          disableHoverListener={!item.sop_description}
                        > */}
                            <Typography
                              variant="subtitle2"
                              sx={{
                                cursor: item.sop_description
                                  ? "pointer"
                                  : "default",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: 180, // adjust as needed for your layout
                              }}
                              onClick={() => {
                                if (item.sop_description) {
                                  setDescDialogText(item.sop_description);
                                  setDescDialogOpen(true);
                                }
                              }}
                            >
                              {item.sop_description
                                ? item.sop_description.length > 45
                                  ? item.sop_description.slice(0, 45) + "..."
                                  : item.sop_description
                                : "No Description"}
                            </Typography>
                            {/* </Tooltip> */}
                          </StyledCardContent>

                          <StyledCardContent
                            sx={{
                              flex: 0.3,
                              justifyContent: "center",
                              ...fontsTableBody,
                            }}
                          >
                            <MoreHorizIcon
                              onClick={(e) => handleOpen(e, item)}
                              sx={{
                                fontSize: "1.6em",
                                color: "rgb(95,200,236)",
                                cursor: "pointer",
                              }}
                            />
                          </StyledCardContent>
                        </EnquiryCardBody>
                      ))}
                      <Dialog
                        open={descDialogOpen}
                        onClose={() => setDescDialogOpen(false)}
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
                          Full Description
                          <Button
                            onClick={() => setDescDialogOpen(false)}
                            sx={{ minWidth: 0, color: "grey.700" }}
                          >
                            <CloseIcon />
                          </Button>
                        </DialogTitle>
                        <DialogContent>
                          <Typography>{descDialogText}</Typography>
                          <Box textAlign="right" mt={2}></Box>
                        </DialogContent>
                      </Dialog>
                    </TableBody>
                  </Table>
                </Box>

                {open && (
                  <Box
                    ref={popoverRef}
                    sx={{
                      position: "absolute",
                      top: popoverPosition.top,
                      left: popoverPosition.left,
                      backgroundColor: "background.paper",
                      p: 2,
                      borderRadius: 2,
                      boxShadow: 3,
                      minWidth: 140,
                      zIndex: 1500,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    <Button
                      fullWidth
                      variant="outlined"
                      color="warning"
                      startIcon={<EditOutlined />}
                      onClick={() => {
                        handleEdit(selectedItem);
                        setOpen(false);
                        setIsEditMode(true);
                        setShowSubmitButton(false);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteOutline />}
                      onClick={() => {
                        handleDelete(selectedItem);
                        setOpen(false);
                      }}
                    >
                      Delete
                    </Button>
                  </Box>
                )}
              </Table>
            </TableContainer>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={2}
              px={1}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" sx={{ color: textColor }}>
                  Records per page:
                </Typography>
                <Select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
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
                  backCoundColor: "#202328 !important",
                }}
              >
                <Box
                  onClick={() => page > 1 && setPage(page - 1)}
                  sx={{
                    cursor: page > 1 ? "pointer" : "not-allowed",
                    userSelect: "none",
                    opacity: page > 1 ? 1 : 0.5,
                  }}
                >
                  &#8249;
                </Box>

                <Typography variant="body2">
                  {page} / {totalPages || 1}
                </Typography>

                <Box
                  onClick={() => page < totalPages && setPage(page + 1)}
                  sx={{
                    cursor: page < totalPages ? "pointer" : "not-allowed",
                    userSelect: "none",
                    opacity: page < totalPages ? 1 : 0.5,
                  }}
                >
                  &#8250;
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4.9}>
          <Paper
            elevation={3}
            sx={{
              padding: 2,
              borderRadius: 3,
              backgroundColor: paper,
              mt: 1,
              mb: 5,
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12}>
                  {isEditMode && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        cursor: "pointer",
                      }}
                    >
                      <Button
                        variant="contained"
                        sx={{
                          mb: 1,
                          width: "40%",
                          backgroundColor: "rgb(223,76,76)",
                          color: "#fff",
                          borderRadius: "12px",
                          cursor: "pointer",
                          textTransform: "none",
                        }}
                        onClick={() => {
                          setSelectedDisaster("");
                          setDescription("");
                          setIsEditMode(false);
                          setShowSubmitButton(true);
                        }}
                      >
                        {"+ add sop"
                          .split(" ")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ")}
                      </Button>
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Disaster Type"
                    variant="outlined"
                    value={selectedDisaster || ""}
                    sx={{ backgroundColor: tableRow }}
                    onChange={(e) => {
                      setSelectedDisaster(e.target.value);
                      setDisasterError(false); // reset on change
                    }}
                    error={disasterError}
                    helperText={
                      disasterError ? "Please select a disaster type" : ""
                    }
                    SelectProps={{
                      MenuProps: {
                        PaperProps: {
                          style: {
                            maxHeight: 250,
                            width: "250",

                          },
                        },
                      },
                    }}
                  >
                    {disaster.map((item) => (
                      <MenuItem key={item.disaster_id} value={item.disaster_id}>
                        {item.disaster_name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={6} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Description"
                    InputLabelProps={{ shrink: false }}
                    multiline
                    value={description}
                    sx={{ backgroundColor: tableRow}}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setDescriptionError(false); // reset on change
                    }}
                    error={descriptionError}
                    helperText={descriptionError ? "Please enter a valid description" : ""}
                    minRows={1} // initial visible lines
                    maxRows={6} // maximum visible lines
                  />
                </Grid>
              </Grid>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 2,
                mt: 3,
                mb: 1,
              }}
            >
              <Button
                variant="contained"
                sx={{
                  mt: 2,
                  width: "40%",
                  backgroundColor: "rgb(18,166,95,0.8)",
                  color: "#fff",
                  borderRadius: "12px",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: bgColor,
                    color: "white !important",
                  },
                }}
                onClick={() => {
                  if (validateForm()) {
                    isEditMode ? handleUpdate() : handleSubmit();
                  }
                }}
              >
                {(() => {
                  const label = showSubmitButton ? "submit" : isEditMode ? "update" : "submit";
                  return label.charAt(0).toUpperCase() + label.slice(1);
                })()}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default SopRegister;
