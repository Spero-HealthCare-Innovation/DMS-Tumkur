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
  colors,
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
  const [baseLocationList, setBaseLocationList] = useState([]);
  const [selectedBaseLocation, setSelectedBaseLocation] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [vehicleOptions, setVehicleOptions] = useState([]);
  const [allData, setAllData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);

  
  const [assignedVehicles, setAssignedVehicles] = useState({});
  // { veh_id: true/false }

  const fetchBaseLocations = async () => {
    try {
      const res = await axios.get(`${port}/DMS_mdt/vehical_base_loc/`);
      setBaseLocationList(res.data || []);
    } catch (e) {
      console.error("Base locations API error:", e);
      setBaseLocationList([]);
    }
  };

  const fetchVehicles = async (
    baseId = "",
    responderId = "",
    vehicleNo = ""
  ) => {
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

      // Vehicle dropdown fill
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
    if (open && selectedResponders.length > 0) {
      setSelectedResponder(selectedResponders[0]);
    }
  }, [open, selectedResponders]);

  useEffect(() => {
    if (open && assignedMap) {
      setAssignedVehicles(assignedMap);
    }
  }, [open, assignedMap]);

  useEffect(() => {
    if (open) {
      fetchBaseLocations();
      setSelectedResponder("all");
      fetchVehicles("", "");
    }
  }, [open]);

  useEffect(() => {
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
            <CloseIcon sx={{ color: "black" }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Tabs for responders */}
      <Tabs
        value={selectedResponder}
        onChange={(e, val) => setSelectedResponder(val)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Tab key="all" label="All Vehicles" value="all" />
        {responderList.map((resp) => (
          <Tab
            key={resp.res_id}
            label={resp.responder_name}
            value={resp.res_id}
          />
        ))}
      </Tabs>

      <DialogContent sx={{ padding: 2 }}>
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
                    ))}
                  </Select>
                </FormControl>

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
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Sr. No</TableCell>
                  <TableCell>Vehicle No</TableCell>
                  <TableCell>Base Location</TableCell>
                  <TableCell>ETA</TableCell>
                  <TableCell>Distance</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
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
                        onChange={(e) =>
                          handleAssignChange(idx, e.target.checked)
                        }
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
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
