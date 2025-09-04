import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Box, Typography, TextField, Button, Paper, InputAdornment, Grid, Popover, Snackbar } from "@mui/material";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import CircularProgress from '@mui/material/CircularProgress';
import { Search, ArrowBack, DeleteOutline, EditOutlined, AddCircleOutline } from "@mui/icons-material";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { styled } from "@mui/material/styles";
import { Alert } from '@mui/material';
import { Select, MenuItem, IconButton, Popper } from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "./../../../../Context/ContextAPI";
import Tooltip from "@mui/material/Tooltip";
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

} from "./../../../../CommonStyle/Style";


function Add_group({ darkMode }) {
  const port = import.meta.env.VITE_APP_API_KEY;

  const { newToken } = useAuth(); // pull token from context
  const [departmentList, setDepartmentList] = useState([]);
  const [departmentId, setDepartmentId] = useState("");
  const [groupName, setGroupName] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success'); // 'success', 'error', 'warning'
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // States for edit functionality
  const [isEditing, setIsEditing] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupNameError, setGroupNameError] = useState("");
  const [departmentError, setDepartmentError] = useState("");
  const [editSelectedRowId, setEditSelectedRowId] = useState(null);
  const [depName, setDepName] = useState([]);


  const userName = localStorage.getItem("userId");
  // console.log(userName, "userName");

  // Determine effective token (context token takes priority)
  const effectiveToken = newToken || localStorage.getItem("access_token");

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      console.log("Using token:", effectiveToken);

      const response = await axios.get(`${port}/admin_web/Department_get/`, {
        headers: {
          Authorization: `Bearer ${effectiveToken}`,
        },
      });

      // console.log(" Departments fetched:", response.data);
      setDepartmentList(response.data);
    } catch (err) {
      console.error(" Error fetching departments:", err);
      if (err.response) {
        console.error("Server Response:", err.response.data);
      }
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (effectiveToken) {
      fetchDepartments();
    } else {
      console.warn("No token found for department fetch.");
    }
  }, [effectiveToken]);

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

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState(null);

  const inputBgColor = darkMode
    ? "rgba(255, 255, 255, 0.16)"
    : "rgba(0, 0, 0, 0.04)";

  // Filter groups based on search term
  const filteredGroups = useMemo(() => {
    if (!searchTerm) return groups;

    return groups.filter(group =>
      group.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.departmentID.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [groups, searchTerm]);

  // Use filtered groups for pagination
  const paginatedData = filteredGroups.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Reset page to 1 when search term changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const open = Boolean(anchorEl);
  const handleOpen = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedGroup(item);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedGroup(null);
  };

  // Function to show alert
  const showAlert = (message, type = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 3000);
  };

  const resetForm = () => {
    setGroupName("");
    setDepartmentId("");
    setIsEditing(false);
    setEditingGroupId(null);
    setGroupNameError("");
    setDepartmentError("");

  };

  // const validateForm = () => {
  //   let isValid = true;

  //   // Reset errors
  //   setGroupNameError("");
  //   setDepartmentError("");

  //   // Validate group name
  //   if (!groupName.trim()) {
  //     setGroupNameError("Group name is required");
  //     isValid = false;
  //   }

  //   // Validate department selection
  //   if (!departmentId) {
  //     setDepartmentError("Please select a department");
  //     isValid = false;
  //   }

  //   return isValid;
  // };


  const handleAddNewGroup = () => {
    resetForm();
  };

  const handleSubmit = async () => {

    if (!validateForm()) {
      return;
    }

    if (!departmentId || !groupName) {
      alert("Please fill all required fields.");
      return;
    }

    const payload = {
      grp_code: "GRP001", // static
      permission_status: 1,
      grp_name: groupName,
      dep_id: parseInt(departmentId), // dynamic
      grp_is_deleted: false,
      grp_added_by: userName,
      grp_modified_by: userName,
    };

    try {
      setLoading(true);

      if (isEditing) {
        // Update existing group
        const response = await axios.put(
          `${port}/admin_web/group_put/${editingGroupId}/`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${effectiveToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Group updated:", response.data);
        showAlert("Group updated successfully!", "success");
      } else {
        // Create new group
        const response = await axios.post(
          `${port}/admin_web/group_post/`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${effectiveToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Group added:", response.data);
        showAlert("Group added successfully!", "success");
      }

      // Reset form and refresh data
      resetForm();
      await fetchGroups();

    } catch (err) {
      console.error("Error posting/updating group:", err);

      // Handle specific 409 error
      if (err.response && err.response.status === 409) {
        const detailMessage = err.response.data?.detail || "Conflict error";
        showAlert(`Failed to ${isEditing ? 'update' : 'add'} group: ${detailMessage}`, "error");
      } else {
        showAlert(`Failed to ${isEditing ? 'update' : 'add'} group. Please try again.`, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${port}/admin_web/Group_get/`, {
        headers: {
          Authorization: `Bearer ${effectiveToken}`,
        },
      });

      console.log("Groups fetched:", response.data);

      const formattedGroups = response.data.map(group => ({
        id: group.grp_id,
        departmentID: group.dep_name, // Display  name
        departmentIdValue: group.dep_id, // Edit  ID
        groupName: group.grp_name,
        fullData: group
      }));

      console.log("Formatted groups:", formattedGroups);
      setGroups(formattedGroups);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Handle Edit functionality
  const handleEdit = async (group) => {
    setIsEditing(true);
    setEditingGroupId(group.id);
    setEditSelectedRowId(group.id);

    try {
      const url = `${port}/admin_web/Group_get_idwise/${group.id}/`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${effectiveToken}`,
        },
      });

      const data = response.data?.[0];

      if (data) {
        setGroupName(data.grp_name || "");
        setDepartmentId(data.dep_id?.toString() || ""); // यहाँ departmentId set करें
        // setDepName को हटा दें, इसकी जरूरत नहीं है
      }

    } catch (err) {
      console.error("Error fetching group data:", err);
    }

    handleClose();
  };


  // Delete functionality
  const deleteGroup = async (groupId) => {
    try {
      setLoading(true);
      const response = await axios.delete(
        `${port}/admin_web/group_delete/${groupId}/`,
        {
          headers: {
            Authorization: `Bearer ${effectiveToken}`,
          },
        }
      );

      console.log('Delete success:', response.data);
      showAlert('Group deleted successfully!', 'success');

      // Refresh the groups list
      await fetchGroups();
      handleClose();

    } catch (error) {
      console.error('Delete failed:', error);
      if (error.response) {
        console.error("Server Response:", error.response.data);
        showAlert(`Failed to delete group: ${error.response.data.detail || 'Server error'}`, 'error');
      } else {
        showAlert('Failed to delete group. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    let isValid = true;

    // Reset errors
    setGroupNameError("");
    setDepartmentError("");

    // Validate group name
    if (!groupName.trim()) {
      setGroupNameError("Please fill Group Name");
      isValid = false;
    }

    // Validate department selection
    if (!departmentId) {
      setDepartmentError("Please select Department");
      isValid = false;
    }

    return isValid;
  };

  const [newGroup, setNewGroup] = useState(false);
  const [deleteGroups, setDeleteGroups] = useState(false);
  const [editGroup, setEditGroup] = useState(false);

  useEffect(() => {
    const storedPermissions = JSON.parse(localStorage.getItem("permissions"));

    if (storedPermissions && storedPermissions.length > 0) {
      const modules = storedPermissions[0].modules_submodule;
      console.log("modules_submodule:", modules);

      const systemUserModule = modules.find(
        (mod) => mod.moduleName === "System User"
      );

      if (systemUserModule) {
        const addGroupSubmodule = systemUserModule.selectedSubmodules.find(
          (sub) => sub.submoduleName === "Add Group"
        );

        if (addGroupSubmodule) {
          addGroupSubmodule.selectedActions?.forEach((act) => {
            if (act.actionName === "Add New group") {
              setNewGroup(true);
            }
            if (act.actionName === "Delete") {
              setDeleteGroups(true);
            }
            if (act.actionName === "Edit") {
              setEditGroup(true);
            }
          });
        }
      }
    }
  }, []);

  return (
    <div style={{ marginLeft: "3.5rem" }}>
      <Snackbar
        open={showSuccessAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={3000}
        onClose={() => setShowSuccessAlert(false)}
      >
        <Alert
          onClose={() => setShowSuccessAlert(false)}
          severity={alertType}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, pb: 1, mt: 2 }}>
        {/* Back Arrow */}
        {/* <IconButton size="small" sx={{
          backgroundColor: "#00f0c0",
          color: "#fff",
          "&:hover": {
            backgroundColor: "#00d8ac",
          },
          width: 30,
          height: 30,
        }}>
          <ArrowBackIosIcon sx={{ fontSize: 20, color: darkMode ? "#fff" : "#000", }} />
        </IconButton> */}

        {/* Label */}
        <Typography variant="h6" sx={{
          color: "#5FC8EC",
          fontWeight: 600,
          fontFamily,
          fontSize: 18,
          marginLeft: "1.5em",
        }}>
          {isEditing ? 'Edit Group' : 'Add Group'}
        </Typography>

        {/* Search Field with Filter */}

        <TextField
          variant="outlined"
          size="small"
          placeholder="Search by group name"
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
            ml: 5,
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
          <Paper elevation={3} sx={{ padding: 3, borderRadius: 3, backgroundColor: paper, mt: 1, mb: 5, ml: 1 }}>
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
                      fontFamily: "Roboto",
                      fontSize: "14px",
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
                          Group Name
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
                          Department Name
                        </Typography>
                      </StyledCardContent>

                      <StyledCardContent
                        sx={{
                          flex: 1,
                          justifyContent: "center",
                          ...fontsTableHeading,
                        }}
                      >
                        <Typography variant="subtitle2">Actions</Typography>
                      </StyledCardContent>
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
                  }}>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <CircularProgress size={30} sx={{ color: "rgb(95,200,236)" }} />
                      </TableCell>
                    </TableRow>
                  ) : paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Box p={2}>
                          <Typography align="center" color="textSecondary">
                            {searchTerm
                              ? "No groups found matching your search."
                              : "No groups available."}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
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
                          fontFamily: "Roboto",
                          border: editSelectedRowId === item.id ? "2px solid #5FC8EC" : "none",
                        }}
                      >
                        <StyledCardContent sx={{ flex: 0.6, justifyContent: "center" }}>
                          <Typography variant="subtitle2" sx={fontsTableBody}>
                            {(page - 1) * rowsPerPage + index + 1}
                          </Typography>
                        </StyledCardContent>

                        <StyledCardContent
                          sx={{ flex: 2, justifyContent: "center", ...fontsTableBody }}
                        >
                          <Tooltip title={item.groupName} arrow placement="top">
                            <Typography
                              variant="subtitle2"
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: 150, // adjust width as per layout
                              }}
                            >
                              {item.groupName.length > 35 ? item.groupName.slice(0, 35) + "..." : item.groupName}
                            </Typography>
                          </Tooltip>

                        </StyledCardContent>

                        <StyledCardContent
                          sx={{ flex: 2, justifyContent: "center", ...fontsTableBody }}
                        >
                          <Tooltip title={item.departmentID} arrow placement="top">
                            <Typography
                              variant="subtitle2"
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: 150,
                              }}
                            >
                              {item.departmentID.length > 35 ? item.departmentID.slice(0, 35) + "..." : item.departmentID}
                            </Typography>
                          </Tooltip>

                        </StyledCardContent>

                        <StyledCardContent
                          sx={{ flex: 1.2, justifyContent: "center", ...fontsTableBody }}
                        >
                          <MoreHorizIcon
                            onClick={(e) => handleOpen(e, item)}
                            sx={{
                              color: "rgb(95,200,236)",
                              cursor: "pointer",
                              fontSize: 28,
                              justifyContent: "center",
                              ...fontsTableBody,
                            }}
                          />
                        </StyledCardContent>
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
                  backgroundColor: darkMode ? "#202328" : "#FFFFFF",
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
                <Box>{page}/ {Math.ceil(filteredGroups.length / rowsPerPage)}</Box>
                <Box
                  onClick={() =>
                    page < Math.ceil(filteredGroups.length / rowsPerPage) &&
                    setPage(page + 1)
                  }
                  sx={{
                    cursor:
                      page < Math.ceil(filteredGroups.length / rowsPerPage)
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

        {(editGroup || deleteGroups) && (
          <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
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
                p: 2,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                borderRadius: 2,
                minWidth: 120,
              },
            }}
          >
            {editGroup && (
              <Button
                fullWidth
                variant="outlined"
                color="warning"
                startIcon={<EditOutlined />}
                onClick={() => handleEdit(selectedGroup)}
              >
                Edit
              </Button>
            )}

            {deleteGroups && (
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<DeleteOutline />}
                onClick={() => {
                  if (selectedGroup) {
                    deleteGroup(selectedGroup.id);
                  }
                }}
              >
                Delete
              </Button>
            )}
          </Popover>
        )}

        <Grid item xs={12} md={4.9}>
          <Paper elevation={3} sx={{ padding: 2, borderRadius: 3, backgroundColor: paper, mt: 1, mb: 5 }}>
            {newGroup && (
              <Box
                display="flex"
                justifyContent={{ xs: "center", md: "flex-end" }}
                alignItems="center"
                mb={2}
                flexWrap="wrap"
              >
                <Button
                  variant="contained"
                  startIcon={<AddCircleOutline />}
                  onClick={handleAddNewGroup}
                  disabled={!isEditing}
                  sx={{
                    backgroundColor: "rgb(223,76,76)",
                    color: "#fff",
                    fontWeight: 600,
                    fontFamily: "Roboto",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "rgb(223,76,76)",
                    },
                  }}
                >
                  Add New Group
                </Button>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              {/* Group Name TextField with Box wrapper */}
              <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Group Name"
                  label={groupName ? "" : "Group Name"}
                  InputLabelProps={{ shrink: false }}
                  sx={{
                    backgroundColor: darkMode ? "rgb(88,92,99)" : "#FFFFFF",
                    fontFamily: "Roboto",
                    ...inputStyle,
                    ...(groupNameError && {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#d32f2f !important",
                      },
                    }),
                  }}
                  value={groupName}
                  onChange={(e) => {
                    const value = e.target.value;
                    const regex = /^[a-zA-Z\s]*$/;
                    if (regex.test(value) || value === '') {
                      setGroupName(value);
                      if (groupNameError) setGroupNameError(""); // Clear error on change
                    }
                  }}
                  onKeyPress={(e) => {
                    const regex = /^[a-zA-Z\s]$/;
                    if (!regex.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
                {groupNameError && (
                  <Typography
                    sx={{
                      color: "#d32f2f",
                      fontSize: "12px",
                      marginTop: "4px",
                      marginLeft: "14px",
                      fontFamily: "Roboto",
                    }}
                  >
                    {groupNameError}
                  </Typography>
                )}
              </Box>

              {/* Department Select with Box wrapper */}
              <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <Select
                  fullWidth
                  displayEmpty
                  placeholder="Select Department"
                  value={departmentId} // यहाँ departmentId use करें, depName नहीं
                  onChange={(e) => {
                    setDepartmentId(e.target.value);
                    if (departmentError) setDepartmentError(""); // Clear error on change
                  }}
                  inputProps={{
                    "aria-label": "Select Department",
                  }}
                  sx={{
                    fontFamily: "Roboto",
                    ...selectStyles,
                    ...(departmentError && {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#d32f2f !important",
                      },
                    }),
                  }}
                  IconComponent={KeyboardArrowDownIcon}
                >
                  <MenuItem value="" disabled>
                    Select Department
                  </MenuItem>
                  {departmentList.map((department) => (
                    <MenuItem key={department.dep_id} value={department.dep_id.toString()}>
                      {department.dep_name}
                    </MenuItem>
                  ))}
                </Select>
                {departmentError && (
                  <Typography
                    sx={{
                      color: "#d32f2f",
                      fontSize: "12px",
                      marginTop: "4px",
                      marginLeft: "14px",
                      fontFamily: "Roboto",
                    }}
                  >
                    {departmentError}
                  </Typography>
                )}
              </Box>
            </Box>

            {newGroup && (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3, mb: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{
                    mt: 2,
                    width: "40%",
                    backgroundColor: "rgb(18,166,95,0.8) !important",
                    color: "#ffff",
                    fontWeight: "bold",
                    borderRadius: "12px",
                    fontFamily: "Roboto",
                    textTransform: 'none',
                    "&:hover": {
                      backgroundColor: "rgb(18,166,95,0.8)",
                      color: "white !important",
                      fontFamily: "Roboto",
                      textTransform: 'none'
                    },
                  }}
                >
                  {loading ? 'Loading...' : (isEditing ? 'Update' : 'Submit')}
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default Add_group