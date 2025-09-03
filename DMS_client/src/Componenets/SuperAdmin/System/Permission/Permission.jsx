import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  FormControlLabel,
  Button,
  Snackbar,
  Alert,
  Typography,
  Paper,
  Chip,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useAuth } from "../../../../Context/ContextAPI";
import customScrollStyle from "../../../../common/Customscroller";

const Permission = () => {
  const permission = localStorage.getItem("permissions");
  const usergrp = localStorage.getItem("usergrp");
  const Port = import.meta.env.VITE_APP_API_KEY;
  const { newToken } = useAuth();
  const token = localStorage.getItem("access_token");
  const accessToken = localStorage.getItem("access_token");

  const [source, setSource] = useState([]);
  const [role, setRole] = useState([]);
  const [moduleSubmodule, setModuleSubmodule] = useState([]);
  const [moduleCheckboxes, setModuleCheckboxes] = useState({});
  const [submoduleCheckboxes, setSubmoduleCheckboxes] = useState({});
  const [sourceid, setSourceid] = useState("");
  const [roleid, setRoleid] = useState("");
  const [permission_list, setPermission_list] = useState([]);
  const [perId, setPerId] = useState("");
  const [allPermissionChecked, setAllPermissionChecked] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [groupId, setGroupId] = useState("");
  console.log("UserGroupID:", groupId);

  const [group, setGroups] = useState([]);
  const [loadingGroup, setLoadingGroup] = useState(false);

  const [actionsData, setActionsData] = useState([]); // store all actions
  const [actionCheckboxes, setActionCheckboxes] = useState({});

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const handleActionChange = (actionId, checked) => {
    setActionCheckboxes((prev) => ({
      ...prev,
      [actionId]: checked,
    }));
  };

  useEffect(() => {
    const fetchUserSourceDropdown = async () => {
      try {
        const response = await axios.get(`${Port}/admin_web/source_GET/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setSource(response.data);
      } catch (error) {
        console.log("Error while fetching source", error);
      }
    };
    fetchModuleSubmodule();
    fetchUserSourceDropdown();
  }, []);

  const fetchRole = async (id) => {
    try {
      const response = await axios.get(
        `${Port}/admin_web/agg_role_info_get/${id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const roles =
        usergrp === "UG-ADMIN"
          ? response.data.filter(
            (role) =>
              role.grp_name !== "UG-ADMIN" &&
              role.grp_name !== "UG-SUPERADMIN"
          )
          : response.data;
      setRole(roles);
    } catch (error) {
      console.log("Error while fetching roles", error);
    }
  };

  const fetchModuleSubmodule = async (id) => {
    setSourceid(id);
    try {
      const response = await axios.get(`${Port}/admin_web/combined/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setModuleSubmodule(response.data);
    } catch (error) {
      console.log("Error while fetching modules/submodules", error);
    }
  };

  const fetchRoleid = async (id) => {
    setRoleid(id);
    try {
      const response = await axios.get(
        `${Port}/admin_web/permissions/${sourceid}/${id}/`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const data = response.data;
      if (data.length === 0) {
        setPermission_list([]);
        setModuleCheckboxes({});
        setSubmoduleCheckboxes({});
        setActionCheckboxes({});
        return;
      }

      setPermission_list(data);
      setPerId(data[0].id);

      const moduleCheck = {};
      const submoduleCheck = {};
      const actionCheck = {};

      // Merge actions into moduleSubmodule
      const updatedModuleSubmodule = moduleSubmodule.map((mod) => {
        const matchingPermission = data[0].modules_submodule.find(
          (pm) => pm.moduleId === mod.module_id
        );
        if (matchingPermission) {
          moduleCheck[mod.module_id] = true;

          mod.submodules = mod.submodules.map((sub) => {
            const matchingSub = matchingPermission.selectedSubmodules.find(
              (ps) => ps.submoduleId === sub.Permission_id
            );
            if (matchingSub) {
              submoduleCheck[sub.Permission_id] = true;

              // Store actions
              sub.actions = matchingSub.selectedActions || [];
              matchingSub.selectedActions.forEach((a) => {
                actionCheck[a.actionId] = true;
              });
            }
            return sub;
          });
        }
        return mod;
      });

      setModuleSubmodule(updatedModuleSubmodule);
      setModuleCheckboxes(moduleCheck);
      setSubmoduleCheckboxes(submoduleCheck);
      setActionCheckboxes(actionCheck);
    } catch (error) {
      console.log("Error while fetching role permissions", error);
    }
  };

  const handleAllPermissionChange = (event) => {
    const checked = event.target.checked;
    setAllPermissionChecked(checked);

    const updatedModules = {};
    const updatedSubmodules = {};
    const updatedActions = {};

    moduleSubmodule.forEach((module) => {
      updatedModules[module.module_id] = checked;

      module.submodules.forEach((sub) => {
        updatedSubmodules[sub.Permission_id] = checked;
      });

      module.actions.forEach((action) => {
        updatedActions[action.action_id] = checked;
      });
    });

    setModuleCheckboxes(updatedModules);
    setSubmoduleCheckboxes(updatedSubmodules);
    setActionCheckboxes(updatedActions); // ✅ add this
  };


  const handleModuleChange = (moduleId, checked) => {
    //  Update module checkbox
    setModuleCheckboxes((prev) => ({ ...prev, [moduleId]: checked }));

    const module = moduleSubmodule.find((mod) => mod.module_id === moduleId);

    if (module) {
      //  Update submodules
      const updatedSub = { ...submoduleCheckboxes };
      module.submodules.forEach((sub) => {
        updatedSub[sub.Permission_id] = checked;
      });
      setSubmoduleCheckboxes(updatedSub);

      //  Update actions
      const updatedActions = { ...actionCheckboxes };
      module.actions.forEach((action) => {
        updatedActions[action.action_id] = checked;
      });
      setActionCheckboxes(updatedActions);
    }
  };


  const handleSubmoduleChange = (subId, checked) => {
    // Submodule update
    const updatedSubs = { ...submoduleCheckboxes, [subId]: checked };

    const updatedActions = { ...actionCheckboxes };
    moduleSubmodule.forEach((module) => {
      module.submodules.forEach((sub) => {
        if (sub.Permission_id === subId) {
          module.actions.forEach((action) => {
            if (action.sub_module === subId) {
              updatedActions[action.action_id] = checked;
            }
          });
        }
      });
    });

    setSubmoduleCheckboxes(updatedSubs);
    setActionCheckboxes(updatedActions);


    moduleSubmodule.forEach((module) => {
      const subIds = module.submodules.map((sub) => sub.Permission_id);
      const allChecked = subIds.every((id) => updatedSubs[id]);
      const anyChecked = subIds.some((id) => updatedSubs[id]);

      setModuleCheckboxes((prev) => ({
        ...prev,
        [module.module_id]: allChecked ? true : anyChecked ? true : false,
      }));
    });
  };


  const handleSubmit = () => {
    const selectedData = {
      source: sourceid,
      role: groupId,
      modules_submodule: [],
    };

    moduleSubmodule.forEach((module) => {
      if (moduleCheckboxes[module.module_id]) {
        let selectedSub = [];

        // 🔹 First: Add selected submodules + their selected actions
        module.submodules.forEach((sub) => {
          if (submoduleCheckboxes[sub.Permission_id]) {
            const selectedActions = module.actions
              .filter((a) => a.sub_module === sub.Permission_id && actionCheckboxes[a.action_id])
              .map((a) => ({
                actionId: a.action_id,
                actionName: a.name,
              }));

            selectedSub.push({
              submoduleId: sub.Permission_id,
              submoduleName: sub.name,
              selectedActions,
            });
          }
        });

        // 🔹 Second: If there are actions selected for submodules that are NOT checked
        // Still add them under those submodules so no action is lost
        module.submodules.forEach((sub) => {
          const orphanActions = module.actions
            .filter((a) => a.sub_module === sub.Permission_id && actionCheckboxes[a.action_id])
            .map((a) => ({
              actionId: a.action_id,
              actionName: a.name,
            }));

          if (orphanActions.length > 0 && !submoduleCheckboxes[sub.Permission_id]) {
            selectedSub.push({
              submoduleId: sub.Permission_id,
              submoduleName: sub.name,
              selectedActions: orphanActions,
            });
          }
        });

        // 🔹 Push module with ALL submodule+action data
        selectedData.modules_submodule.push({
          moduleId: module.module_id,
          moduleName: module.name,
          selectedSubmodules: selectedSub,
        });
      }
    });

    if (selectedData.modules_submodule.length === 0) {
      console.error("Select at least one module.");
      return;
    }

    const apiCall =
      permission_list.length === 0
        ? axios.post(`${Port}/admin_web/permissions/`, selectedData, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        : axios.put(`${Port}/admin_web/permissions/${perId}/`, selectedData, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

    apiCall
      .then(() => setSnackbarOpen(true))
      .catch((err) => console.error("Error while saving permissions", err));
  };


  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${Port}/admin_web/Department_get/`, {
        headers: {
          Authorization: `Bearer ${token || newToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
        console.log("✅ Departments fetched:", data);
      } else {
        const errorText = await response.text();
        console.error(
          "❌ Failed to fetch departments:",
          response.status,
          errorText
        );
      }
    } catch (error) {
      console.error("❌ Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch User Groups
  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${Port}/admin_web/Group_get/`, {
        headers: {
          Authorization: `Bearer ${token || newToken}`,
        },
      });

      console.log("Groups fetched:", response.data);

      const formattedGroups = response.data.map((group) => ({
        id: group.grp_id,
        departmentID: group.dep_name, // Display  name
        departmentIdValue: group.dep_id, // Edit  ID
        groupName: group.grp_name,
        fullData: group,
      }));

      console.log("Formatted groups:", formattedGroups);
      setGroups(formattedGroups);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    }
  };

  const handleGroupChange = (e) => {
    setGroupId(e.target.value);
    fetchRoleid(e.target.value); // callback to parent
  };

  // Fetch on component mount
  useEffect(() => {
    fetchDepartments();
    fetchGroups();
  }, []);

  return (
    <Box p={3} sx={{ ml: { xs: 0, md: "70px" } }}>
      {/* ✅ Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={handleSnackbarClose}
        >
          Data saved successfully!
        </Alert>
      </Snackbar>

      {/* 🔍 Filters */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: 3,
          backgroundColor: "#1e1e1e",
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h6"
          color="#fff"
          mb={3}
          fontWeight={600}
          letterSpacing={1}
        >
          Permissions & Modules
        </Typography>

        <Grid container spacing={2}>
          {/* Department Dropdown */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="filled">
              <InputLabel shrink sx={{ color: "#fff" }}>
                Department
              </InputLabel>
              <Select
                value={sourceid}
                displayEmpty
                onChange={(e) => {
                  const depId = e.target.value;
                  setSourceid(depId);
                  setRoleid(""); // Reset role
                  setPermission_list([]);
                  setModuleCheckboxes({});
                  setSubmoduleCheckboxes({});
                  fetchRole(depId);
                  fetchModuleSubmodule(depId);
                }}
                renderValue={(selected) => {
                  if (!selected)
                    return <em style={{ color: "#aaa" }}>Select Department</em>;
                  const selectedDept = departments.find(
                    (d) => d.dep_id === selected
                  );
                  return selectedDept?.dep_name || "Unnamed";
                }}
                sx={{
                  color: "#fff",
                  backgroundColor: "#333",
                  ".MuiSelect-icon": { color: "#fff" },
                }}
                MenuProps={{
                  anchorOrigin: { vertical: "bottom", horizontal: "left" },
                  transformOrigin: { vertical: "top", horizontal: "left" },
                  PaperProps: {
                    sx: {
                      mt: 1,
                      backgroundColor: "#222",
                      color: "#fff",
                      maxHeight: 300,
                      "& .MuiMenuItem-root": { px: 2, py: 1.5 },
                      "&::-webkit-scrollbar": { width: "6px" },
                      "&::-webkit-scrollbar-track": { background: "#1a1a1a" },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#00bfff",
                        borderRadius: "4px",
                        "&:hover": { backgroundColor: "#00cfff" },
                      },
                    },
                  },
                }}
              >
                <MenuItem value="" disabled>
                  <em>Select Department</em>
                </MenuItem>
                {departments.map((item) => (
                  <MenuItem key={item.dep_id} value={item.dep_id}>
                    {item.dep_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* User Group Dropdown */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="filled">
              <InputLabel shrink sx={{ color: "#fff" }}>
                User Group
              </InputLabel>
              <Select
                value={groupId}
                onChange={handleGroupChange}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return <em style={{ color: "#aaa" }}>Select Group</em>;
                  }
                  const selectedGroup = group.find(
                    (g) => g.id === selected || g.grp_id === selected
                  );
                  return (
                    selectedGroup?.groupName ||
                    selectedGroup?.grp_name ||
                    "Unnamed"
                  );
                }}
                sx={{
                  color: "#fff",
                  backgroundColor: "#333",
                  ".MuiSelect-icon": { color: "#fff" },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: 300,
                      width: 200,
                      backgroundColor: "#222",
                      color: "#fff",
                      ...customScrollStyle,
                    },
                  },
                }}
              >
                <MenuItem value="" disabled>
                  <em>Select Group</em>
                </MenuItem>
                {group.map((item) => (
                  <MenuItem
                    key={item.id || item.grp_id}
                    value={item.id || item.grp_id}
                  >
                    {item.groupName || item.grp_name || "Unnamed"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* All Permissions Checkbox */}
          <Grid item xs={12} md={4} display="flex" alignItems="center">
            <FormControlLabel
              control={
                <Checkbox
                  checked={allPermissionChecked}
                  onChange={handleAllPermissionChange}
                  sx={{
                    color: "#aaa",
                    "&.Mui-checked": {
                      color: "#fff",
                    },
                  }}
                />
              }
              label={
                <Typography color="white" fontWeight="medium">
                  All Permissions
                </Typography>
              }
            />
          </Grid>
        </Grid>
      </Paper>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 4,
          background: "linear-gradient(135deg,#0f0f10 0%, #151a1f 80%)",
          border: "1px solid #019cda",
        }}
      >
        {/* 🔹 Header row - shown once */}
        <Box
          display="flex"
          flexDirection={{ xs: "column", md: "row" }}
          gap={2}
          mb={2}
          sx={{
            borderBottom: "1px solid #333",
            pb: 1,
          }}
        >
          <Typography
            variant="caption"
            color="#888"
            sx={{
              textTransform: "uppercase",
              letterSpacing: 1,
              minWidth: { md: "220px" },
            }}
          >
            Module
          </Typography>
          <Typography
            variant="caption"
            color="#888"
            sx={{
              textTransform: "uppercase",
              letterSpacing: 1,
              flex: 1,
            }}
          >
            Submodule
          </Typography>
          <Typography
            variant="caption"
            color="#888"
            sx={{
              textTransform: "uppercase",
              letterSpacing: 1,
              flex: 1,
            }}
          >
            Actions
          </Typography>
        </Box>

        {/* 🔹 Data rows */}
        {moduleSubmodule.map((module) => {
          // Module-specific colors
          let specialColors = {
            sop: "#ff9800",
            map: "#4caf50",
            "alert-panel": "#f44336",
          };
          let moduleKey = module.name.toLowerCase().replace(/\s+/g, "-");
          let moduleColor = specialColors[moduleKey] || "#019cda";

          return (
            <Box
              key={module.module_id}
              mb={2}
              display="flex"
              flexDirection={{ xs: "column", md: "row" }}
              gap={1} 
              sx={{ borderBottom: "1px dashed #444", pb: 2 }}
            >
              {/* 1️⃣ Module Column */}
              <Box
                minWidth={{ xs: "100%", md: "220px" }}
                display="flex"
                alignItems="center"
              >
                <Checkbox
                  checked={moduleCheckboxes[module.module_id] || false}
                  onChange={(e) => handleModuleChange(module.module_id, e.target.checked)}
                  sx={{ color: moduleColor, "&.Mui-checked": { color: moduleColor } }}
                />
                <Typography variant="subtitle1" fontWeight={700} color="#e0e0e0" noWrap>
                  {module.name}
                </Typography>
              </Box>

              {/* 2️⃣ Submodule Column */}
              <Box flex={1} display="flex" flexDirection="column" gap={0.5}>
                {module.submodules.map((sub) => {
                  const isSubChecked = submoduleCheckboxes[sub.Permission_id] || false;
                  return (
                    <Chip
                      key={sub.Permission_id}
                      label={sub.name}
                      onClick={() =>
                        handleSubmoduleChange(sub.Permission_id, !isSubChecked)
                      }
                      variant="outlined"
                      size="small"
                      sx={{
                        width: "fit-content",
                        backgroundColor: isSubChecked
                          ? `${moduleColor}20`
                          : "rgba(255,255,255,0.05)",
                        color: isSubChecked ? "#fff" : "#ccc",
                        border: isSubChecked ? `1.5px solid ${moduleColor}` : "none",
                        borderRadius: "8px",
                        px: 1.5,
                        fontSize: "12px",
                      }}
                    />
                  );
                })}
              </Box>

              <Box flex={1} display="flex" flexDirection="column" gap={0.5}> 
                {module.submodules.map((sub) => {
                  const actionsForSub = module.actions.filter(
                    (action) => action.sub_module === sub.Permission_id
                  );

                  return (
                    <Box
                      key={sub.Permission_id}
                      display="flex"
                      flexWrap="wrap"
                      gap={0.5}
                    >
                      {actionsForSub.map((action) => {
                        const isActionChecked = actionCheckboxes[action.action_id] || false;
                        return (
                          <Chip
                            key={action.action_id}
                            label={action.name}
                            onClick={() =>
                              handleActionChange(action.action_id, !isActionChecked)
                            }
                            variant="outlined"
                            size="small"
                            sx={{
                              width: "fit-content",
                              backgroundColor: isActionChecked
                                ? `${moduleColor}20`
                                : "rgba(255,255,255,0.05)",
                              color: isActionChecked ? "#fff" : "#ccc",
                              border: isActionChecked ? `1.5px solid ${moduleColor}` : "none",
                              borderRadius: "8px",
                              px: 1.5,
                              fontSize: "12px",
                              "&:hover": {
                                backgroundColor: isActionChecked
                                  ? `${moduleColor}30`
                                  : "rgba(255,255,255,0.08)",
                                cursor: "pointer",
                              },
                            }}
                          />
                        );
                      })}
                    </Box>
                  );
                })}
              </Box>
            </Box>


          );
        })}


        {/* ✅ Submit Button */}
        <Box textAlign="center">
          <Button
            variant="contained"
            color="primary"
            size="medium"
            disabled={loading}
            onClick={handleSubmit}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "14px",
              background: loading
                ? "#1976d2"
                : "linear-gradient(to right, #00c6ff, #3fb5ecff)",
              color: "#fff",
              boxShadow: "0 3px 10px rgba(0, 114, 255, 0.4)",
              "&:hover": {
                background: "linear-gradient(to right, #00b0e3, #005ec4)",
                boxShadow: "0 5px 14px rgba(0, 114, 255, 0.6)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.3s ease-in-out",
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Submit"}
          </Button>
        </Box>

      </Paper>


    </Box>
  );
};

export default Permission;
