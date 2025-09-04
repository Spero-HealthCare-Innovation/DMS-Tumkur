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
  wardOfficer = [],
  selectedWardOfficer = [],
  setSelectedWardOfficer = () => { }
}) {
  const statusMap = { 1: "Free", 2: "Busy", 3: "Maintenance" };
  const port = import.meta.env.VITE_APP_API_KEY;

  const [selectedResponder, setSelectedResponder] = useState(responder?.res_id || "");
  const [baseLocationList, setBaseLocationList] = useState([]);
  const [selectedBaseLocation, setSelectedBaseLocation] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [vehicleOptions, setVehicleOptions] = useState([]);
  const [allData, setAllData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignedVehicles, setAssignedVehicles] = useState(assignedMap || {});

  // Fetch base locations
  const fetchBaseLocations = async () => {
    try {
      const res = await axios.get(`${port}/DMS_mdt/vehical_base_loc/`);
      setBaseLocationList(res.data || []);
    } catch (e) {
      console.error("Base locations API error:", e);
      setBaseLocationList([]);
    }
  };

  // Fetch vehicles
  const fetchVehicles = async (baseId = "", responderId = "", vehicleNo = "") => {
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
      const vehicles = res.data || [];
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
      setAllData(mapped);
      setTableData(mapped);

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

  useEffect(() => {
    if (open) {
      fetchBaseLocations();
      fetchVehicles("", "");
    }
  }, [open]);

  useEffect(() => {
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

  const resetFilters = () => {
    setSelectedBaseLocation("");
    setVehicleNo("");
    setSelectedResponder("all");
    fetchVehicles("", "", "");
  };

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
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <AppBar position="static" sx={{ position: "relative", background: "linear-gradient(to right, #53bce1, #add0d8)" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", px: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 500, letterSpacing: 0.5, fontSize: { xs: "1rem", sm: "1.25rem" }, color: "#000" }}>
            Responder Details
          </Typography>
          <IconButton edge="end" onClick={onClose}>
            <CloseIcon sx={{ color: "black" }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Tabs
        value={selectedResponder}
        onChange={(e, val) => setSelectedResponder(val)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Tab key="all" label="All Vehicles" value="all" />
        {responderList.map((resp) => (
          <Tab key={resp.res_id} label={resp.responder_name} value={resp.res_id} />
        ))}
      </Tabs>

      <DialogContent sx={{ padding: 2 }}>
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
                    ))}
                  </Select>
                </FormControl>

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
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Sr. No</TableCell>
                  <TableCell>Vehicle No</TableCell>
                  <TableCell>Base Location</TableCell>
                  <TableCell>ETA</TableCell>
                  <TableCell>Distance</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assign</TableCell>
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
                        onChange={(e) => handleAssignChange(idx, e.target.checked)}
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
        <Button variant="contained" onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
