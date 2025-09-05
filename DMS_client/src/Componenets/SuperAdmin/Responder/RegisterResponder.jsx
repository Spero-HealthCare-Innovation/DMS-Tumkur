import React, { useEffect, useMemo } from "react";
import {
    Paper,
    Grid,
    Typography,
    Button,
    Box,
    TextField,
    MenuItem,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    InputAdornment,
    Select,
    Popover,
    Snackbar,
    Alert,
    Autocomplete,
    FormHelperText,
    FormControl,
    InputLabel,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TableCell,
    CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import { Checkbox, ListItemText } from '@mui/material';
import { Search, DeleteOutline, EditOutlined, } from "@mui/icons-material";

import {
    AddCircleOutline,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import CloseIcon from "@mui/icons-material/Close";

import {
    TableDataCardBody,
    TableHeadingCard,
    fontsTableBody,
    getCustomSelectStyles,
    fontsTableHeading,
    StyledCardContent,
} from "../../../CommonStyle/Style";
import { useAuth } from "../../../Context/ContextAPI";
import axios from "axios";
import { select } from "framer-motion/client";
import Tooltip from "@mui/material/Tooltip";

const RegisterResponder = ({ darkMode, flag, setFlag, setSelectedIncident }) => {
    const port = import.meta.env.VITE_APP_API_KEY;
    const { newToken, disaster } = useAuth();
    const token = localStorage.getItem("access_token");
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
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
    const userName = localStorage.getItem('userId');
    const [isEditMode, setIsEditMode] = useState(false);
    const [showSubmitButton, setShowSubmitButton] = useState(false);
    const [selectedResponders, setSelectedResponders] = useState([]);
    const [selectedDisaster, setSelectedDisaster] = useState(null);
    const [responder, setResponder] = useState([]);
    const [responderTableData, setResponderTableData] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    // Edit
    const [responderID, setResponderID] = useState(null);

    const getResponderData = async () => {
        try {
            const response = await fetch(`${port}/admin_web/Disaster_Responder_get/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token || newToken}`,
                },
            });

            const data = await response.json();
            if (response.status === 200) {
                setResponderTableData(data);
                console.log(data, "SOP");
                setPage(1);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    useEffect(() => {
        getResponderData();
    }, [port, token, newToken]);

    const fetchResponder = async () => {
        try {
            const response = await fetch(`${port}/admin_web/responder_get/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token || newToken}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setResponder(data);
                console.log("Responder list:", data);
            } else {
                console.error("Failed to fetch responders. Status:", response.status);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    useEffect(() => {
        fetchResponder();
    }, [port, token, newToken]);

    const handleChange = (event) => {
        setSelectedResponders(event.target.value);
    };

    const [disasterError, setDisasterError] = useState(false);
    const [responderError, setResponderError] = useState(false);

    const handleSubmit = async () => {
        let hasError = false;

        if (!selectedDisaster) {
            setDisasterError(true);
            hasError = true;
        } else {
            setDisasterError(false);
        }

        if (selectedResponders.length === 0) {
            setResponderError(true);
            hasError = true;
        } else {
            setResponderError(false);
        }

        const payload = {
            res_id: selectedResponders,
            dis_id: selectedDisaster,
            dr_added_by: userName,
            dr_modified_by: userName
        };

        try {
            const response = await fetch(`${port}/admin_web/Disaster_Responder_post/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token || newToken}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (response.status === 201) {
                setSnackbarMessage("Responder Registered Successfully");
                setSnackbarOpen(true);
                setSelectedDisaster("");
                setSelectedResponders([]);
                await getResponderData();
            }
            // else if (response.status === 400) {
            //     setSnackbarMessage("Select Fields To SUbmit the Form");
            //     setSnackbarOpen(true);
            // }
            else if (response.status === 409) {
                setSnackbarMessage("Responder already exists with this disaster type");
                setSnackbarOpen(true);
            } else if (response.status === 500) {
                setSnackbarMessage("Internal Server Error");
                setSnackbarOpen(true);
            } else {
                setSnackbarMessage(data?.detail || "Something went wrong");
                setSnackbarOpen(true);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleUpdate = async () => {
        const payload = {
            res_id: selectedResponders,
            dis_id: selectedDisaster,
            dr_added_by: userName,
            dr_modified_by: userName
        };

        try {
            const response = await fetch(`${port}/admin_web/disaster_responder_put/${responderID}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token || newToken}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.status === 200) {
                setSnackbarMessage("Responder Data Updated Successfully");
                setSnackbarOpen(true);
                await getResponderData();
                setSelectedDisaster("");
                setSelectedResponders([]);
            }
            else if (response.status === 409) {
                setSnackbarMessage("SOP already exists with this disaster type");
                setSnackbarOpen(true);
                // setDescription("");
                // setSelectedDisaster("");
            } else if (response.status === 500) {
                setSnackbarMessage("Internal Server Error");
                setSnackbarOpen(true);
            }
        } catch (error) {
            console.error('Update error:', error);
        }
    };

    /// POP UP 
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);

    const handleClick = (event, row) => {
        setAnchorEl(event.currentTarget);
        setSelectedItem(row);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    const handleEdit = async (selectedItem) => {
        const Id = selectedItem.pk_id;
        console.log(Id, "idddddddddd");

        setResponderID(Id);
        setIsEditMode(true);

        try {
            const res = await axios.get(
                `${port}/admin_web/disaster_responder_put/${Id}/`,
                {
                    headers: {
                        Authorization: `Bearer ${token || newToken}`,
                    },
                }
            );
            const data = res.data[0];

            setSelectedDisaster(data.dis_id);
            setSelectedResponders(data.res_id);
            // setDescription(data.sop_description);
        } catch (err) {
            console.error("Error fetching department data:", err);
        }
    };

    const handleDelete = async (selectedItem) => {
        try {
            const res = await axios.delete(
                `${port}/admin_web/Disaster_Responder_delete/${selectedItem.pk_id}/`,
                {
                    headers: {
                        Authorization: `Bearer ${token || newToken}`,
                    },
                }
            );

            console.log("Delete success:", res.data);
            setSnackbarMessage("Responder Data Deleted Successfully");
            await getResponderData();
            setSnackbarOpen(true);
            handleClose();
        } catch (err) {
            console.error("Error deleting department:", err);
        }
    };


    const [searchQuery, setSearchQuery] = useState("");

    const filteredData = responderTableData.filter((row) => {
        const disasterMatch = row.disaster_name?.toLowerCase().includes(searchQuery);
        const responderMatch = row.res_id.some((responder) =>
            responder.responder_name?.toLowerCase().includes(searchQuery)
        );
        return disasterMatch || responderMatch;
    });

    const paginatedData = filteredData.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );
    const [loading, setLoading] = useState(false);

    return (
        <Box sx={{ p: 2, marginLeft: "3rem" }}>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: 1.5,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                color: "rgb(95,200,236)",
                                fontWeight: 600,
                                fontFamily,
                                fontSize: 18,
                            }}
                        >
                            Register Responder
                        </Typography>
                        <TextField
                            variant="outlined"
                            size="small"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
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
                </Box>
            </Box>

            <Grid container spacing={2}>
                <Grid item xs={12} md={7}>
                    <Paper
                        sx={{
                            backgroundColor: paper,
                            p: 2,
                            borderRadius: 2,
                            color: textColor,
                            transition: "all 0.3s ease-in-out",
                        }}
                    >
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableHeadingCard
                                            sx={{
                                                backgroundColor: bgColor,
                                                color: "#000",
                                                display: "flex",
                                                width: "100%",
                                                borderRadius: 2,
                                                // p: 3,
                                            }}
                                        >
                                            <StyledCardContent
                                                sx={{
                                                    flex: 0.5,
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
                                                    flex: 1.8,
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
                                                    flex: 2.2,
                                                    borderRight: "1px solid black",
                                                    justifyContent: "left",
                                                    ...fontsTableHeading,
                                                }}
                                            >
                                                <Typography variant="subtitle2">Responder</Typography>
                                            </StyledCardContent>
                                            <StyledCardContent
                                                sx={{
                                                    flex: 0.4,
                                                    justifyContent: "center",
                                                    ...fontsTableHeading,
                                                }}
                                            >
                                                <Typography variant="subtitle2">Actions</Typography>
                                            </StyledCardContent>
                                        </TableHeadingCard>
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
                                            {
                                                loading ? (
                                                    <TableRow>
                                                        <TableCell colSpan={6} align="center">
                                                            <CircularProgress size={30} sx={{ color: "#5FECC8" }} />
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    paginatedData
                                                        .map((item, index) => (
                                                            <TableDataCardBody
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
                                                                <StyledCardContent
                                                                    sx={{ flex: 0.5, justifyContent: "center" }}
                                                                >
                                                                    <Typography variant="subtitle2" sx={fontsTableBody}>
                                                                        {index + 1}
                                                                    </Typography>
                                                                </StyledCardContent>
                                                                <StyledCardContent
                                                                    sx={{
                                                                        flex: 1.5,
                                                                        justifyContent: "center",
                                                                        alignItems: "center",
                                                                        display: "flex",
                                                                        minWidth: 0,
                                                                    }}
                                                                >
                                                                    <Typography
                                                                        variant="subtitle2"
                                                                        sx={{
                                                                            overflow: "hidden",
                                                                            textOverflow: "ellipsis",
                                                                            whiteSpace: "nowrap",
                                                                        }}
                                                                    >
                                                                        {item.disaster_name}
                                                                    </Typography>
                                                                </StyledCardContent>
                                                                <StyledCardContent
                                                                    sx={{
                                                                        flex: 2.2,
                                                                        justifyContent: "left",
                                                                        ...fontsTableBody,
                                                                    }}
                                                                >
                                                                    <Tooltip
                                                                        title={item.res_id.map((res) => res.responder_name).join(", ")}
                                                                        arrow
                                                                        placement="top"
                                                                    >
                                                                        <Typography
                                                                            variant="subtitle2"
                                                                            sx={{
                                                                                overflow: "hidden",
                                                                                textOverflow: "ellipsis",
                                                                                whiteSpace: "nowrap",
                                                                                maxWidth: 500, // adjust as needed
                                                                                display: "inline-block",
                                                                                verticalAlign: "middle",
                                                                            }}
                                                                        >
                                                                            {(() => {
                                                                                const names = item.res_id.map((res) => res.responder_name);
                                                                                const joined = names.join(", ");
                                                                                // Show as much as fits, then add "..." if truncated
                                                                                if (joined.length > 35) { // adjust 25 as needed for your width
                                                                                    return joined.slice(0, 35) + "...";
                                                                                }
                                                                                return joined;
                                                                            })()}
                                                                        </Typography>
                                                                    </Tooltip>
                                                                </StyledCardContent>
                                                                <StyledCardContent
                                                                    sx={{
                                                                        flex: 0.3,
                                                                        justifyContent: "center",
                                                                        ...fontsTableBody,
                                                                    }}
                                                                >
                                                                    <MoreHorizIcon
                                                                        onClick={(e) => handleClick(e, item)}
                                                                        sx={{
                                                                            color: "rgb(95,200,236)",
                                                                            cursor: "pointer",
                                                                            // fontSize: 35,
                                                                            justifyContent: "center",
                                                                            ...fontsTableBody,
                                                                        }}
                                                                    />
                                                                </StyledCardContent>
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
                                                                    <Button
                                                                        fullWidth
                                                                        variant="outlined"
                                                                        color="warning"
                                                                        startIcon={<EditOutlined />}
                                                                        onClick={() => {
                                                                            handleEdit(selectedItem);
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
                                                                        onClick={() => handleDelete(selectedItem)}
                                                                    >
                                                                        Delete
                                                                    </Button>
                                                                </Popover>
                                                            </TableDataCardBody>
                                                        ))
                                                )}
                                        </TableBody>
                                    </Table>
                                </Box>
                            </Table>

                            <Dialog
                                // open={openDeleteDialog}
                                // onClose={() => setOpenDeleteDialog(false)}
                                maxWidth="xs"
                                fullWidth
                            >
                                <DialogTitle>Confirm Deletion</DialogTitle>
                                <DialogContent>
                                    <Typography>
                                        Are you sure you want to delete this department?
                                    </Typography>
                                </DialogContent>
                                <DialogActions>
                                    <Button
                                    // onClick={() => setOpenDeleteDialog(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleDelete}
                                        color="error"
                                        variant="contained"
                                    >
                                        Delete
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </TableContainer>

                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} px={1}>
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
                                    }}
                                >
                                    &#8249;
                                </Box>
                                <Box>
                                    {page} / {Math.ceil(filteredData.length / rowsPerPage)}
                                </Box>
                                <Box
                                    onClick={() =>
                                        page < Math.ceil(responderTableData.length / rowsPerPage) &&
                                        setPage(page + 1)
                                    }
                                    sx={{
                                        cursor:
                                            page < Math.ceil(responderTableData.length / rowsPerPage)
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

                <Grid item xs={12} md={4.9}>
                    <Paper elevation={3} sx={{ padding: 2, borderRadius: 3, backgroundColor: paper, mb: 5 }}>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
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
                                                    // fontWeight: "bold",
                                                    borderRadius: "12px",
                                                    cursor: "pointer",
                                                    textTransform: "none", // prevent uppercase by default
                                                }}
                                                onClick={() => {
                                                    setSelectedDisaster("");
                                                    setSelectedResponders([]);
                                                    setIsEditMode(false);
                                                    setShowSubmitButton(true);
                                                }}
                                            >
                                                {"+ add responder"
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
                                        sx={{ backgroundColor: tableRow }}
                                        value={selectedDisaster || ""}
                                        onChange={(e) => setSelectedDisaster(e.target.value)}
                                        error={disasterError}
                                        helperText={disasterError ? "Please select a disaster type." : ""}
                                        SelectProps={{
                                            MenuProps: {
                                                PaperProps: {
                                                    style: {
                                                        maxHeight: 250,
                                                        width: '250'
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

                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth error={responderError}>
                                        <Select
                                            multiple
                                            value={selectedResponders}
                                            onChange={handleChange}
                                            displayEmpty
                                            sx={{ backgroundColor: tableRow }}
                                            renderValue={(selected) => {
                                                if (selected.length === 0) {
                                                    return "Select Responder";
                                                }
                                                return responder
                                                    .filter((res) => selected.includes(res.responder_id))
                                                    .map((res) => res.responder_name)
                                                    .join(", ");
                                            }}
                                            size="small"
                                            inputProps={{ "aria-label": "Select Responder" }}
                                            MenuProps={{
                                                PaperProps: {
                                                    style: {
                                                        maxHeight: 250,
                                                        width: 200,
                                                    },
                                                },
                                            }}
                                        >
                                            <MenuItem disabled value="">
                                                <em>Select Responder</em>
                                            </MenuItem>
                                            {responder.map((res) => (
                                                <MenuItem key={res.responder_id} value={res.responder_id}>
                                                    <Checkbox checked={selectedResponders.includes(res.responder_id)} />
                                                    <ListItemText primary={res.responder_name} />
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {responderError && (
                                            <Typography variant="caption" color="error">
                                                Please select at least one responder.
                                            </Typography>
                                        )}
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3, mb: 1 }}>
                            <Button
                                variant="contained"
                                sx={{
                                    mt: 2,
                                    width: "40%",
                                    backgroundColor: "rgb(18,166,95,0.8)",
                                    color: "#fff",
                                    borderRadius: "12px",
                                    "&:hover": {
                                        backgroundColor: bgColor,
                                        color: "white !important",
                                    },
                                    textTransform: "none",
                                }}
                                onClick={isEditMode ? handleUpdate : handleSubmit}
                            >
                                {(() => {
                                    const label = showSubmitButton ? "submit" : isEditMode ? "update" : "submit";
                                    return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
                                })()}
                            </Button>
                        </Box>

                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default RegisterResponder;
