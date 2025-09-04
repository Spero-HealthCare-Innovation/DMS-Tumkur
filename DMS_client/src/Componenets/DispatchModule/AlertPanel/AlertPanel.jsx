import { useEffect, useRef, useState } from 'react';
import {
    Box, CardContent, Typography, Table, TableBody, TableContainer,
    TableHead, TableRow, Grid, Button, Select, MenuItem, InputAdornment, TextField,
    TableCell
} from '@mui/material';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import MapView from './Map';
import { useAuth } from './../../../Context/ContextAPI';
import Sidebar from '../Sidebar/Sidebar';
import { Search } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { Tooltip } from '@mui/material';
import { red } from '@mui/material/colors';

const EnquiryCard = styled('div')({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: "linear-gradient(to bottom, #53bce1, rgb(173, 207, 216))",
    // background: "rgb(95, 200, 236)",
    color: 'black',
    borderRadius: '8px 10px 0 0',
    fontWeight: '600',
    height: '35px',
    cursor: "pointer",
});

const EnquiryCardBody = styled('div')({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '0.5em',
    borderRadius: '8px',
    position: 'relative',
    height: '40px',
    cursor: 'pointer',
});

const StyledCardContent = styled(CardContent)({
    padding: '8px 12px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    height: '100%',
});

const AlertPanel = ({ darkMode }) => {
    const { newToken, selectedDisasterId, selectedDisasterName } = useAuth();
    console.log(selectedDisasterId, selectedDisasterName, 'mmmmmmm');

    useEffect(() => {
        if (selectedDisasterName) {
            console.log("Clicked disaster type name:", selectedDisasterName);
        }
    }, [selectedDisasterName]);

    const navigate = useNavigate();
    console.log(newToken, 'newToken');

    const port = import.meta.env.VITE_APP_API_KEY;
    const socketUrl = import.meta.env.VITE_SOCKET_API_KEY;
    const group = localStorage.getItem('user_group');
    const token = localStorage.getItem('access_token');
    const userName = localStorage.getItem('userId');
    console.log(userName, 'userName');
    console.log(group, 'groupgroup');

    const textColor = darkMode ? "#ffffff" : "#000000";
    const bgColor = darkMode ? "#0a1929" : "#ffffff";
    const borderColor = darkMode ? "#7F7F7F" : "#ccc";
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [alertData, setAlertData] = useState([]);
    const socketRef = useRef(null);
    const [triggeredData, setTriggeredData] = useState([]);
    console.log(triggeredData, 'triggeredData');

    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    // const startIndex = (page - 1) * rowsPerPage;
    // const endIndex = startIndex + rowsPerPage;
    // const paginatedData = alertData.slice(startIndex, endIndex);
    // const totalPages = Math.ceil(alertData.length / rowsPerPage);

    window.addEventListener('storage', (e) => {
        if (e.key === 'logout') {
            location.href = '/login';
        }
    });

    useEffect(() => {
        document.title = "Dms|alertpanel";
    }, []);

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

    const [initialData, setInitialData] = useState([]);
    const [liveData, setLiveData] = useState([]);
    const [lastTriggeredId, setLastTriggeredId] = useState(null);

    // useEffect(() => {
    //     fetch(`${socketUrl}/api/weather_alerts`)
    //         .then(res => res.json())
    //         .then(data => setInitialData(data.slice(0, 10)))
    //         .catch(err => console.error("Initial fetch failed:", err));
    // }, []);

    useEffect(() => {
        fetch(`${socketUrl}/api/weather_alerts`)
            .then(res => res.json())
            .then(data => {
                const sorted = data
                    .sort((a, b) => b.pk_id - a.pk_id)
                    .slice(0, 10);
                setInitialData(sorted);
                console.log(sorted, 'sorted Data in descending order');

            })
            .catch(err => console.error("Initial fetch failed:", err));
    }, []);


    useEffect(() => {
        if (!selectedDisasterId) return;

        const socket = new WebSocket(`ws://192.168.1.116:7777/ws/disaster_alerts?disaster_id=${selectedDisasterId}`);

        socket.onopen = () => {
            console.log('Disaster WebSocket connected');
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('Disaster alert data:', data);
            } catch (error) {
                console.error('Invalid JSON from disaster WebSocket:', event.data);
            }
        };

        socket.onerror = (error) => {
            console.error('Disaster WebSocket error:', error);
        };

        socket.onclose = () => {
            console.log('Disaster WebSocket closed');
        };

        // Cleanup on unmount or disasterId change
        return () => {
            socket.close();
        };
    }, [selectedDisasterId]);



    useEffect(() => {
        // const socket = new WebSocket(`ws://192.168.1.116:7777/ws/weather_alerts`);
        const socket = new WebSocket(`${socketUrl}/ws/weather_alerts`);

        socket.onmessage = (event) => {
            try {
                const newData = JSON.parse(event.data);
                const incoming = Array.isArray(newData) ? newData[0] : newData;

                setLiveData(prev => {
                    const isDuplicate = prev.some(item => item.pk_id === incoming.pk_id) ||
                        initialData.some(item => item.pk_id === incoming.pk_id);
                    if (isDuplicate) return prev;

                    return [...prev, incoming];
                });
            } catch (error) {
                console.error('Invalid JSON:', event.data);
            }
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        socket.onclose = () => {
            console.log('WebSocket closed');
        };
    }, [initialData]);

    const handleTriggerClick = async (id, triggerStatus) => {
        try {
            const response = await fetch(`${port}/admin_web/alert/?id=${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token || newToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const updatedItem = await response.json();

            // Update initialData: remove old item and insert updated one at the top
            setInitialData(prev => {
                const filtered = prev.filter(item => item.pk_id !== updatedItem.pk_id);
                return [updatedItem, ...filtered];
            });
            setTriggeredData(updatedItem);
            setLastTriggeredId(updatedItem.pk_id); // 🔹 Set the triggered alert's ID

        } catch (error) {
            console.error('Error fetching alert details:', error);
        }
    };

    const handleTriggeredData = async (id, triggerStatus) => {
        try {
            const response = await fetch(`${port}/admin_web/alert/?id=${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token || newToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setTriggeredData(data);
        } catch (error) {
            console.error('Error fetching alert details:', error);
        }
    };

    // brouser and tab close autologout functionality

    //     let isPageReloaded = false;

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

    const [searchText, setSearchText] = useState("");

    const combinedRaw = [...initialData, ...liveData];

    const uniqueCombined = combinedRaw.filter(
        (item, index, self) =>
            index === self.findIndex(i => i.pk_id === item.pk_id)
    );

    const sortedCombined = uniqueCombined.sort((a, b) => b.pk_id - a.pk_id);

    // 🔹 Place the last triggered alert at the top
    const combinedData = lastTriggeredId
        ? [
            ...uniqueCombined.filter(i => i.pk_id === lastTriggeredId),
            ...sortedCombined.filter(i => i.pk_id !== lastTriggeredId)
        ]
        : sortedCombined;

    const statusFilteredData = combinedData.filter(item => item.triger_status !== 3);

    const filteredData = statusFilteredData.filter(item =>
        item.pk_id.toString().toLowerCase().includes(searchText.toLowerCase())
    );
    // const filteredData = combinedData.filter(item =>
    //     item.pk_id.toString().toLowerCase().includes(searchText.toLowerCase())
    // );

    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    useEffect(() => {
        setPage(1);
    }, [searchText])

    const [alertPanel, setAlertPanel] = useState(false);

    useEffect(() => {
        const storedPermissions = JSON.parse(localStorage.getItem("permissions"));

        if (storedPermissions && storedPermissions.length > 0) {
            const modules = storedPermissions[0].modules_submodule;

            const sopModule = modules.find((mod) => mod.moduleName === "Alert-Panel");

            if (sopModule) {
                console.log("SOP Module:", sopModule);

                sopModule.selectedSubmodules?.forEach((sub) => {
                    console.log("Submodule:", sub.submoduleName);

                    sub.selectedActions?.forEach((act) => {
                        console.log("Action:", act.actionName);

                        if (act.actionName === "Trigged") {
                            setAlertPanel(true);
                        }
                    });
                });
            } else {
                console.warn("SOP module not found in permissions");
            }
        }
    }, []);


    return (
        <Box sx={{ flexGrow: 1, mt: 1, ml: '5em', mr: 1, mb: 2 }}>
            {
                localStorage.getItem("user_group") !== "1" && <Sidebar darkMode={darkMode} />
            }
            <Grid container spacing={2}>
                <Grid item xs={12} md={7}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={12} display="flex" alignItems="center">
                            <TextField
                                variant="outlined"
                                size="small"
                                placeholder="Search by Alert ID"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
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
                                        color: darkMode ? "white" : "#000",
                                        padding: "6px 8px",
                                        fontSize: "13px",
                                    },
                                }}
                            />
                        </Grid>
                    </Grid>

                    <TableContainer style={{ marginTop: '1em' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <EnquiryCard>
                                        <StyledCardContent style={{ flex: 0.3, borderRight: "1px solid black" }}>
                                            <Typography variant="subtitle2">Sr No</Typography>
                                        </StyledCardContent>
                                        <StyledCardContent style={{ flex: 0.5, borderRight: "1px solid black" }}>
                                            <Typography variant="subtitle2">Alert Id</Typography>
                                        </StyledCardContent>
                                        <StyledCardContent style={{ flex: 1.5, borderRight: "1px solid black" }}>
                                            <Typography variant="subtitle2">Date & Time</Typography>
                                        </StyledCardContent>
                                        <StyledCardContent style={{ flex: 1, borderRight: "1px solid black" }}>
                                            <Typography variant="subtitle2">Disaster Name</Typography>
                                        </StyledCardContent>
                                        <StyledCardContent style={{ flex: 0.5, borderRight: "1px solid black" }}>
                                            <Typography variant="subtitle2">Severity</Typography>
                                        </StyledCardContent>
                                        <StyledCardContent style={{ flex: 1, marginTop: '15px' }}>
                                            <Typography variant="subtitle2">Status</Typography>
                                        </StyledCardContent>
                                    </EnquiryCard>
                                </TableRow>
                            </TableHead>
                        </Table>

                        <Box sx={{
                            maxHeight: 500,
                            overflowY: 'auto',
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
                        }}>
                            <Table>
                                <TableBody>
                                    {paginatedData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                <Typography variant="subtitle2" sx={{ color: textColor }}>
                                                    No alerts available.
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedData.map((item, index) => (
                                            <EnquiryCardBody
                                                key={startIndex + index}
                                                sx={{
                                                    backgroundColor: darkMode ? "rgb(53 53 53)" : "#FFFFFF",
                                                    // backgroundColor: darkMode ? "rgb(88,92,99)" : "#FFFFFF",
                                                    color: "white",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                <StyledCardContent style={{ flex: 0.3 }}>
                                                    <Typography variant="subtitle2">{index + 1}</Typography>
                                                </StyledCardContent>
                                                <StyledCardContent style={{ flex: 0.5 }}>
                                                    <Typography variant="subtitle2">{item.pk_id}</Typography>
                                                </StyledCardContent>
                                                <StyledCardContent style={{ flex: 1.5 }}>
                                                    <Typography variant="subtitle2">
                                                        {new Date(item.alert_datetime).toLocaleString('en-GB', {
                                                            hour12: false,
                                                            year: 'numeric',
                                                            month: '2-digit',
                                                            day: '2-digit',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            second: '2-digit'
                                                        })}
                                                    </Typography>
                                                </StyledCardContent>
                                                <StyledCardContent style={{ flex: 1 }}>
                                                    <Typography variant="subtitle2">
                                                        {item.disaster_name || 'N/A'}
                                                    </Typography>
                                                </StyledCardContent>
                                                <StyledCardContent style={{ flex: 0.5 }}>
                                                    <Typography variant="subtitle2">
                                                        {(() => {
                                                            const config = {
                                                                1: { color: '#FF3B30', label: 'High' },
                                                                2: { color: '#FF9500', label: 'Medium' },
                                                                3: { color: '#FFD60A', label: 'Low' },
                                                                4: { color: 'green', label: 'Very Low' },
                                                            };
                                                            const severity = config[item.alert_type];
                                                            return severity ? (
                                                                <Tooltip
                                                                    title={severity.label}
                                                                    arrow
                                                                    componentsProps={{
                                                                        tooltip: {
                                                                            sx: {
                                                                                backgroundColor: 'black',
                                                                                color: 'white',
                                                                                fontSize: '12px',
                                                                            },
                                                                            arrow: {
                                                                                color: 'black',
                                                                            },
                                                                        },
                                                                    }}
                                                                >
                                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                        <span style={{
                                                                            width: 15,
                                                                            height: 15,
                                                                            borderRadius: '50%',
                                                                            backgroundColor: severity.color,
                                                                        }} />
                                                                    </span>
                                                                </Tooltip>
                                                            ) : 'N/A';
                                                        })()}
                                                    </Typography>
                                                </StyledCardContent>
                                                <StyledCardContent style={{ flex: 1 }}>
                                                    {/* {alertPanel ?
                                                        ( */}
                                                            <Button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleTriggerClick(item.pk_id, item.triger_status);
                                                                }}
                                                                style={{
                                                                    width: '70%',
                                                                    backgroundColor: item.triger_status === 1 ? 'rgb(223,76,76)' : "rgb(18,166,95)",
                                                                    color: 'white',
                                                                    borderRadius: '10px',
                                                                    height: '30px',
                                                                    marginTop: '15px',
                                                                    fontSize: '13px',
                                                                    textTransform: 'none'
                                                                }}
                                                            >
                                                                {(() => {
                                                                    const label = item.triger_status === 1 ? "trigger" : "triggered";
                                                                    return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
                                                                })()}
                                                            </Button>
                                                        {/* )
                                                        :
                                                        (
                                                            <>-</>
                                                        )
                                                    } */}
                                                </StyledCardContent>
                                            </EnquiryCardBody>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </Box>
                    </TableContainer>

                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mt={2}
                        mb={4}
                        px={1}
                    >
                        <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" sx={{ color: textColor }}>
                                Records Per Page:
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
                                    // backgroundColor: bgColor,
                                    backgroundColor: darkMode ? "#202328" : "#fff",
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor: borderColor,
                                    },
                                    "& .MuiSvgIcon-root": { color: textColor },
                                }}
                            >
                                {[10, 25, 50, 100].map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Box>

                        <Box
                            sx={{
                                border: "1px solid #ffffff",
                                backgroundColor: darkMode ? "#202328" : "#fff",
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
                            <Box>{page} / {totalPages || 1}</Box>
                            <Box
                                onClick={() =>
                                    page < totalPages &&
                                    setPage(page + 1)
                                }
                                sx={{
                                    cursor:
                                        page < totalPages
                                            ? "pointer"
                                            : "not-allowed",
                                    userSelect: "none",
                                }}
                            >
                                &#8250;
                            </Box>
                        </Box>
                    </Box>
                </Grid>

                <Grid item xs={12} md={5}>
                    <MapView data={triggeredData} />
                </Grid>
            </Grid>
        </Box>
    );
};

export default AlertPanel;
