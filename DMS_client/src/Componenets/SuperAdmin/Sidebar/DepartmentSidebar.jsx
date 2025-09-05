import { useState, useMemo, useEffect } from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Tooltip,
  Typography,
  Collapse,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import LockIcon from "@mui/icons-material/Lock";
import AddBoxIcon from "@mui/icons-material/AddBox";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { useNavigate, useLocation } from "react-router-dom";

// Icon mapping
const iconMap = {
  "System User": <AccountCircleIcon />,
  "Register Sop": <AddBoxIcon />,
  Responder: <AddCircleOutlineOutlinedIcon />,
  Reports: <TextSnippetOutlinedIcon />,
  Permission: <LockIcon />,
  Dashboard: <DashboardIcon />,
};

const buildScreenConfig = (permissions) => {
  const config = {};
  permissions?.forEach((dept) => {
    dept.modules_submodule.forEach((mod) => {
      config[mod.moduleName] = {
        icon: iconMap[mod.moduleName] || null,
        screens:
          mod.selectedSubmodules?.map((sub) => ({
            id: sub.submoduleId,
            text: sub.submoduleName,
            path: `/${sub.submoduleName.replace(/\s+/g, "-")}`,
          })) || [],
      };
    });
  });
  return config;
};

const Departmentsidebar = ({ darkMode }) => {
  const [open, setOpen] = useState(false);
  const [dropdowns, setDropdowns] = useState({});
  const [drawerWidth, setDrawerWidth] = useState(200); // Dynamic width state
  const navigate = useNavigate();
  const location = useLocation();

  const permissions = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("permissions")) || [];
    } catch {
      return [];
    }
  }, []);

  const screenConfig = useMemo(() => buildScreenConfig(permissions), [permissions]);

  // Calculate dynamic width based on the longest menu text
  useEffect(() => {
    let longestText = 0;
    Object.entries(screenConfig).forEach(([sectionName, { screens }]) => {
      longestText = Math.max(longestText, sectionName.length);
      screens.forEach((s) => {
        longestText = Math.max(longestText, s.text.length);
      });
    });
    // 8px per char + padding
    setDrawerWidth(Math.max(60, Math.min(300, longestText * 8 + 40)));
  }, [screenConfig]);

  const toggleDropdown = (key) => {
    setDropdowns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <Drawer
      variant="permanent"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        setOpen(false);
        setDropdowns({});
      }}
       sx={{
    transition: "width 0.3s ease",
    width: open ? drawerWidth : 60,
    "& .MuiDrawer-paper": {
      transition: "width 0.3s ease, background 0.3s ease",
      width: open ? drawerWidth : 50,
      height: "65%",
      position: "fixed",
      top: "50%",
      transform: "translateY(-50%)",
      background: darkMode
        ? "linear-gradient(to bottom, #5FC8EC, rgb(19, 26, 28))"
        : "linear-gradient(to bottom, #5FC8EC, rgb(18, 24, 26))",
      borderRadius: "30px",
      pt: 2,
      pb: 2,
      marginLeft: "0.5em",
      color: "white",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      overflow: "hidden", // Drawer ke andar overflow hide
    },
  }}
>
     <Box
    sx={{
      width: "100%",
      flexGrow: 1,
      overflowY: "auto",
      overflowX: "hidden",
      px: 0.5,

      // Scrollbar hide styles
      "&::-webkit-scrollbar": {
        display: "none",
      },
      "-ms-overflow-style": "none", // IE & Edge
      "scrollbar-width": "none", // Firefox
    }}
  >
        <List>
          {Object.entries(screenConfig).map(([sectionName, { icon, screens }]) => {
            const hasSubmenus = screens.length > 0;
            const isActiveSection =
              location.pathname === `/${sectionName.replace(/\s+/g, "-")}` ||
              screens.some((s) => s.path === location.pathname);

            const listItem = (
              <ListItemButton
                onClick={() =>
                  hasSubmenus
                    ? toggleDropdown(sectionName)
                    : navigate(`/${sectionName.replace(/\s+/g, "-")}`)
                }
                sx={{
                  flexDirection: open ? "row" : "column",
                  justifyContent: open ? "flex-start" : "center",
                  alignItems: "center",
                  py: 1,
                  gap: open ? 1 : 0.5,
                  color: "white",
                  borderRadius: "12px",
                  mx: 1,
                  background: isActiveSection ? "rgba(255,255,255,0.25)" : "transparent",
                  transform: isActiveSection ? "scale(1.05)" : "none",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    background: "rgba(255, 255, 255, 0.15)",
                    transform: "scale(1.05)",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, color: "white" }}>{icon}</ListItemIcon>
                {open && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography variant="body2">{sectionName}</Typography>
                    {hasSubmenus &&
                      (dropdowns[sectionName] ? (
                        <ArrowDropUpIcon fontSize="small" />
                      ) : (
                        <ArrowDropDownIcon fontSize="small" />
                      ))}
                  </Box>
                )}
              </ListItemButton>
            );

            return (
              <Box key={sectionName} sx={{ width: "100%" }}>
                {open ? listItem : <Tooltip title={sectionName} placement="right">{listItem}</Tooltip>}

                <Collapse in={open && dropdowns[sectionName]} timeout={300} unmountOnExit>
                  <Box sx={{ pl: 4 }}>
                    {screens.map((screen) => {
                      const isActiveScreen = location.pathname === screen.path;
                      return (
                        <ListItemButton
                          key={screen.id}
                          onClick={() => navigate(screen.path)}
                          sx={{
                            py: 0.5,
                            background: isActiveScreen ? "rgba(255,255,255,0.25)" : "transparent",
                            borderRadius: "8px",
                            transition: "all 0.2s ease",
                            "&:hover": { background: "rgba(255, 255, 255, 0.1)", pl: 5 },
                          }}
                        >
                          <ListItemText
                            primary={screen.text}
                            primaryTypographyProps={{ fontSize: 13 }}
                          />
                        </ListItemButton>
                      );
                    })}
                  </Box>
                </Collapse>
              </Box>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
};

export default Departmentsidebar;
