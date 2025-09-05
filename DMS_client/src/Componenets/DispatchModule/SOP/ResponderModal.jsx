// ResponderModal.jsx
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  IconButton,
  AppBar,
  Toolbar,
  Card,
  CardContent,
  Tabs,
  Tab,
  Checkbox,
<<<<<<< HEAD
  colors,
=======
>>>>>>> Development
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";

export default function ResponderModal({
  open,
  responderList = [],
  selectedResponders = [],
  responder,
  onClose,
  onSave,
  lattitude,
  longitude,
  assignedMap = {},
<<<<<<< HEAD
}) {
  const statusMap = {
    1: "Free",
    2: "Busy",
    3: "Maintenance",
  };

  const port = import.meta.env.VITE_APP_API_KEY;

  const [selectedResponder, setSelectedResponder] = useState(
    responder?.res_id || ""
  );
=======
  wardOfficer = [],
  selectedWardOfficer = [],
  setSelectedWardOfficer = () => { }
}) {
  const statusMap = { 1: "Free", 2: "Busy", 3: "Maintenance" };
  const port = import.meta.env.VITE_APP_API_KEY;

  // const [selectedResponder, setSelectedResponder] = useState(responder?.res_id || "");
  const [selectedResponder, setSelectedResponder] = useState(responder?.res_id);

  useEffect(() => {
    if (open) {
      setSelectedResponder("all");

      fetchBaseLocations();
      fetchVehicles("", "");
    }
  }, [open]);

>>>>>>> Development
  const [baseLocationList, setBaseLocationList] = useState([]);
  const [selectedBaseLocation, setSelectedBaseLocation] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [vehicleOptions, setVehicleOptions] = useState([]);
  const [allData, setAllData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD

  
  const [assignedVehicles, setAssignedVehicles] = useState({});
  // { veh_id: true/false }

=======
  const [assignedVehicles, setAssignedVehicles] = useState(assignedMap || {});

  // Fetch base locations
>>>>>>> Development
  const fetchBaseLocations = async () => {
    try {
      const res = await axios.get(`${port}/DMS_mdt/vehical_base_loc/`);
      setBaseLocationList(res.data || []);
    } catch (e) {
      console.error("Base locations API error:", e);
      setBaseLocationList([]);
    }
  };

<<<<<<< HEAD
  const fetchVehicles = async (
    baseId = "",
    responderId = "",
    vehicleNo = ""
  ) => {
=======
  // Fetch vehicles
  const fetchVehicles = async (baseId = "", responderId = "", vehicleNo = "") => {
>>>>>>> Development
    setLoading(true);
    try {
      const res = await axios.get(`${port}/DMS_mdt/vehical/`, {
        params: {
          veh_base_loc: baseId || undefined,
          responder: responderId || undefined,
          veh_num: vehicleNo || undefined,
          lat: lattitude,
          long: longitude,
        },
      });
<<<<<<< HEAD

      const vehicles = res.data || [];

=======
      const vehicles = res.data || [];
>>>>>>> Development
      const mapped = vehicles.map((v, idx) => ({
        srNo: idx + 1,
        veh_id: v.veh_id,
        veh_number: v.veh_number || "-",
        veh_base_location: v.veh_base_location ?? "-",
        status: statusMap[v.vehical_status] || "Unknown",
        eta: v.eta_minutes != null ? `${v.eta_minutes} min` : "-",
        distance: v.distance_km != null ? `${v.distance_km} km` : "-",
        assigned: assignedVehicles[v.veh_id] || false,
      }));
<<<<<<< HEAD

      setAllData(mapped);
      setTableData(mapped);

      // Vehicle dropdown fill
=======
      setAllData(mapped);
      setTableData(mapped);

>>>>>>> Development
      const vehicleOpts = vehicles.map((v) => ({
        veh_id: v.veh_id,
        veh_number: v.veh_number,
        status: statusMap[v.vehical_status] || "Unknown",
      }));
      setVehicleOptions(vehicleOpts);
    } catch (err) {
      console.error("Vehicle API error:", err);
      setAllData([]);
      setTableData([]);
      setVehicleOptions([]);
    } finally {
      setLoading(false);
    }
  };
<<<<<<< HEAD
  useEffect(() => {
    if (open && selectedResponders.length > 0) {
      setSelectedResponder(selectedResponders[0]);
    }
  }, [open, selectedResponders]);

  useEffect(() => {
    if (open && assignedMap) {
      setAssignedVehicles(assignedMap);
    }
  }, [open, assignedMap]);
=======
>>>>>>> Development

  useEffect(() => {
    if (open) {
      fetchBaseLocations();
<<<<<<< HEAD
      setSelectedResponder("all");
=======
>>>>>>> Development
      fetchVehicles("", "");
    }
  }, [open]);

  useEffect(() => {
<<<<<<< HEAD
    if (selectedResponder === "all") {
      fetchVehicles(selectedBaseLocation, "");
    } else if (selectedResponder) {
      fetchVehicles(selectedBaseLocation, selectedResponder);
    }
  }, [selectedResponder, selectedBaseLocation, lattitude, longitude]);

  useEffect(() => {
    if (responderList.length > 0 && !selectedResponder) {
      setSelectedResponder(responderList[0].res_id);
    }
  }, [responderList, selectedResponder]);

  useEffect(() => {
    if (selectedResponder === "all") {
      fetchVehicles(selectedBaseLocation, "", vehicleNo);
    } else if (selectedResponder) {
      fetchVehicles(selectedBaseLocation, selectedResponder, vehicleNo);
    }
  }, [
    selectedResponder,
    selectedBaseLocation,
    vehicleNo,
    lattitude,
    longitude,
  ]);
=======
    if (selectedResponder === "all") fetchVehicles(selectedBaseLocation, "");
    else if (selectedResponder) fetchVehicles(selectedBaseLocation, selectedResponder);
  }, [selectedResponder, selectedBaseLocation, lattitude, longitude]);

  const handleAssignChange = (index, checked) => {
    const updated = [...tableData];
    updated[index].assigned = checked;
    setTableData(updated);
    setAssignedVehicles((prev) => ({
      ...prev,
      [updated[index].veh_id]: checked,
    }));
  };
>>>>>>> Development

  const resetFilters = () => {
    setSelectedBaseLocation("");
    setVehicleNo("");
    setSelectedResponder("all");
    fetchVehicles("", "", "");
  };
<<<<<<< HEAD
const handleSave = () => {
  const selectedVehicleIds = Object.keys(assignedVehicles)
    .filter((vehId) => assignedVehicles[vehId])
    .map(Number);

  onSave({
    selectedResponders,
    res_id: selectedResponder,
    baseLocation: selectedBaseLocation,
    vehicleNo,
    vehicleIds: selectedVehicleIds,  
    assignedVehicles,                 
  });
};


  const handleAssignChange = (index, checked) => {
    const updated = [...tableData];
    updated[index].assigned = checked;
    setTableData(updated);

    setAssignedVehicles((prev) => ({
      ...prev,
      [updated[index].veh_id]: checked,
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <AppBar
        position="static"
        sx={{
          position: "relative",
          background: "linear-gradient(to right, #53bce1, #add0d8)",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
        }}
      >
        <Toolbar
          sx={{ display: "flex", justifyContent: "space-between", px: 3 }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 500,
              letterSpacing: 0.5,
              fontSize: { xs: "1rem", sm: "1.25rem" },
              color: "#000000ff",
              // textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            Responder Details
          </Typography>
          <IconButton
            edge="end"
            onClick={onClose}
            sx={{
              backgroundColor: "rgba(255,255,255,0.1)",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
            }}
          >
=======

  const handleSave = () => {
    const selectedVehicleIds = Object.keys(assignedVehicles)
      .filter((vehId) => assignedVehicles[vehId])
      .map(Number);

    onSave({
      selectedResponders,
      res_id: selectedResponder,
      baseLocation: selectedBaseLocation,
      vehicleNo,
      vehicleIds: selectedVehicleIds,
      assignedVehicles,
      selectedWardOfficer: localSelectedWardOfficer,
    });
  };

  const [localSelectedWardOfficer, setLocalSelectedWardOfficer] = useState([]);

  useEffect(() => {
    if (selectedResponder === 4 && wardOfficer.length > 0) {
      setLocalSelectedWardOfficer(selectedWardOfficer || []);
    } else {
      setLocalSelectedWardOfficer([]);
    }
  }, [selectedResponder, wardOfficer, selectedWardOfficer]);

  useEffect(() => {
    if (selectedResponder === 4 && wardOfficer.length > 0) {
      const preSelected = selectedWardOfficer || [];
      setLocalSelectedWardOfficer(preSelected);

      // 🔹 Sync vehicles of pre-selected officers
      let updatedAssigned = { ...assignedVehicles };
      wardOfficer.forEach((officer) => {
        if (preSelected.includes(officer.officer_id)) {
          officer.veh_data.forEach((v) => {
            updatedAssigned[v.veh_id] = true;
          });
        }
      });
      setAssignedVehicles(updatedAssigned);

      // 🔹 Also update tableData so vehicle checkboxes reflect the same
      setTableData((prev) =>
        prev.map((row) => ({
          ...row,
          assigned: updatedAssigned[row.veh_id] || row.assigned,
        }))
      );
    } else {
      setLocalSelectedWardOfficer([]);
    }
  }, [selectedResponder, wardOfficer, selectedWardOfficer]);


  // Checkbox change handler for ward officers
  const handleWardOfficerCheckbox = (officer) => (e) => {
    const checked = e.target.checked;

    const newSelectedWard = checked
      ? [...localSelectedWardOfficer, officer.officer_id]
      : localSelectedWardOfficer.filter((id) => id !== officer.officer_id);

    setLocalSelectedWardOfficer(newSelectedWard);
    setSelectedWardOfficer(newSelectedWard);

    setAssignedVehicles((prev) => {
      const updated = { ...prev };
      officer.veh_data.forEach((v) => {
        updated[v.veh_id] = checked;
      });
      return updated;
    });

    setTableData((prev) =>
      prev.map((row) => ({
        ...row,
        assigned: officer.veh_data.some((v) => v.veh_id === row.veh_id) ? checked : row.assigned,
      }))
    );
  };


  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <AppBar position="static" sx={{ position: "relative", background: "linear-gradient(to right, #53bce1, #add0d8)" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", px: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 500, letterSpacing: 0.5, fontSize: { xs: "1rem", sm: "1.25rem" }, color: "#000" }}>
            Responder Details
          </Typography>
          <IconButton edge="end" onClick={onClose}>
>>>>>>> Development
            <CloseIcon sx={{ color: "black" }} />
          </IconButton>
        </Toolbar>
      </AppBar>

<<<<<<< HEAD
      {/* Tabs for responders */}
=======
>>>>>>> Development
      <Tabs
        value={selectedResponder}
        onChange={(e, val) => setSelectedResponder(val)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Tab key="all" label="All Vehicles" value="all" />
        {responderList.map((resp) => (
<<<<<<< HEAD
          <Tab
            key={resp.res_id}
            label={resp.responder_name}
            value={resp.res_id}
          />
=======
          <Tab key={resp.res_id} label={resp.responder_name} value={resp.res_id} />
>>>>>>> Development
        ))}
      </Tabs>

      <DialogContent sx={{ padding: 2 }}>
<<<<<<< HEAD
        {/* Filters */}
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
              <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
                {/* Base Location */}
                <FormControl
                  sx={{ minWidth: 220, flexGrow: 1 }}
                  variant="standard"
                >
                  <InputLabel sx={{ color: "#555" }}>Base Location</InputLabel>
                  <Select
                    value={selectedBaseLocation}
                    onChange={(e) => setSelectedBaseLocation(e.target.value)}
                    sx={{
                      "&:before": { borderBottom: "1px solid #888" },
                      "&:hover:not(.Mui-disabled):before": {
                        borderBottom: "1px solid #1976d2",
                      },
                      "& .MuiSelect-select": {
                        padding: "8px 12px",
                        color: selectedBaseLocation ? "#fff" : "#000", // ✅ white when selected
                      },
                    }}
                  >
                    <MenuItem value="">All</MenuItem>
                    {baseLocationList.map((b) => (
                      <MenuItem key={b.bs_id} value={b.bs_id}>
                        {b.bs_name}
                      </MenuItem>
=======
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            {selectedResponder === 4 && wardOfficer.length > 0 ? (
              <TableContainer component={Paper} sx={{ maxHeight: 300, overflow: "auto" }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Sr. No</TableCell>
                      <TableCell>Vehicle ID</TableCell>
                      <TableCell>Vehicle No</TableCell>
                      <TableCell>Officer Name</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Designation</TableCell>
                      <TableCell>Assign</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {wardOfficer.map((officer, idx) => (
                      <TableRow key={officer.officer_id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{officer.veh_data.map((v) => v.veh_id).join(", ")}</TableCell>
                        <TableCell>{officer.veh_data.map((v) => v.veh_number).join(", ")}</TableCell>
                        <TableCell>{officer.officer_name}</TableCell>
                        <TableCell>{officer.officer_contact}</TableCell>
                        <TableCell>{officer.officer_dept}</TableCell>
                        <TableCell>{officer.officer_designation}</TableCell>
                        <TableCell>
                          <Checkbox
                            checked={localSelectedWardOfficer.includes(officer.officer_id)}
                            onChange={(e) => {
                              const checked = e.target.checked;

                              const newSelectedWard = checked
                                ? [...localSelectedWardOfficer, officer.officer_id]
                                : localSelectedWardOfficer.filter((id) => id !== officer.officer_id);
                              setLocalSelectedWardOfficer(newSelectedWard);

                              setSelectedWardOfficer(newSelectedWard);

                              setAssignedVehicles((prev) => {
                                const updated = { ...prev };
                                officer.veh_data.forEach((v) => {
                                  updated[v.veh_id] = checked;
                                });
                                return updated;
                              });
                            }}
                          />
                          Assign
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
                <FormControl sx={{ minWidth: 220 }} variant="standard">
                  <InputLabel>Base Location</InputLabel>
                  <Select
                    value={selectedBaseLocation}
                    onChange={(e) => setSelectedBaseLocation(e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    {baseLocationList.map((b) => (
                      <MenuItem key={b.bs_id} value={b.bs_id}>{b.bs_name}</MenuItem>
>>>>>>> Development
                    ))}
                  </Select>
                </FormControl>

<<<<<<< HEAD
                {/* Vehicle No */}
                <FormControl
                  sx={{
                    minWidth: 220,
                    flexGrow: 1,
                  }}
                  variant="standard"
                  disabled={!selectedBaseLocation}
                >
                  <InputLabel sx={{ color: "#555" }}>Vehicle No.</InputLabel>
                  <Select
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value)}
                    sx={{
                      "&:before": { borderBottom: "1px solid #888" },
                      "&:hover:not(.Mui-disabled):before": {
                        borderBottom: "1px solid #1976d2",
                      },
                      "& .MuiSelect-select": {
                        padding: "8px 12px",
                        color: vehicleNo ? "#fff" : "#000", // ✅ selected text white
                      },
                    }}
                    inputProps={{
                      sx: { flexShrink: 1 },
                    }}
                  >
                    <MenuItem value="">All</MenuItem>
                    {vehicleOptions.map((v) => (
                      <MenuItem key={v.veh_number} value={v.veh_number}>
                        {v.veh_number}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Button
                variant="outlined"
                color="secondary"
                onClick={resetFilters}
              >
                Reset
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Loader */}
        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        )}

        {/* Table */}
        {!loading && (
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: 200,
              overflow: "auto",
              "&::-webkit-scrollbar": { width: 8, height: 8 },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#80c2f8ff",
                borderRadius: 4,
              },
              "&::-webkit-scrollbar-thumb:hover": {
                backgroundColor: "#2593ecff",
              },
              "&::-webkit-scrollbar-track": { backgroundColor: "#888" },
            }}
          >
=======
                <FormControl sx={{ minWidth: 220 }} variant="standard" disabled={!selectedBaseLocation}>
                  <InputLabel>Vehicle No.</InputLabel>
                  <Select
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    {vehicleOptions.map((v) => (
                      <MenuItem key={v.veh_number} value={v.veh_number}>{v.veh_number}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button variant="outlined" color="secondary" onClick={resetFilters}>Reset</Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {loading && <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>}

        {!loading && selectedResponder !== 4 && (
          <TableContainer component={Paper} sx={{ maxHeight: 200, overflow: "auto" }}>
>>>>>>> Development
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Sr. No</TableCell>
                  <TableCell>Vehicle No</TableCell>
                  <TableCell>Base Location</TableCell>
                  <TableCell>ETA</TableCell>
                  <TableCell>Distance</TableCell>
                  <TableCell>Status</TableCell>
<<<<<<< HEAD
                  <TableCell>Action</TableCell>
=======
                  <TableCell>Assign</TableCell>
>>>>>>> Development
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData.map((row, idx) => (
                  <TableRow key={row.veh_id}>
                    <TableCell>{row.srNo}</TableCell>
                    <TableCell>{row.veh_number}</TableCell>
                    <TableCell>{row.veh_base_location}</TableCell>
                    <TableCell>{row.eta}</TableCell>
                    <TableCell>{row.distance}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell>
                      <Checkbox
                        size="small"
                        checked={row.assigned}
<<<<<<< HEAD
                        onChange={(e) =>
                          handleAssignChange(idx, e.target.checked)
                        }
=======
                        onChange={(e) => handleAssignChange(idx, e.target.checked)}
>>>>>>> Development
                      />
                      Assign
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
<<<<<<< HEAD
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
=======
        <Button variant="contained" onClick={handleSave}>Save</Button>
>>>>>>> Development
      </DialogActions>
    </Dialog>
  );
}
