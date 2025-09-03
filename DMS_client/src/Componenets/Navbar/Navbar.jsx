import React, { useState, useEffect} from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import CallIcon from "@mui/icons-material/Call";
import { TextField, Grid } from '@mui/material';
import EmailIcon from "@mui/icons-material/Email";
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import EditIcon from "@mui/icons-material/Edit";
import { styled, Switch } from "@mui/material";
import { useAuth } from "./../../Context/ContextAPI";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DialogContentText from '@mui/material/DialogContentText';
import { Snackbar, Alert } from "@mui/material";

// import DialogActions from '@mui/material/DialogActions';
// import DialogContent from '@mui/material/DialogContent';
// import DialogTitle from '@mui/material/DialogTitle';

const pages = [];
const settings = ["Profile", "Logout"];
const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  "& .MuiSwitch-switchBase": {
    margin: 1,
    padding: 0,
    transform: "translateX(6px)",
    "&.Mui-checked": {
      color: "#fff",
      transform: "translateX(22px)",
      "& .MuiSwitch-thumb": {
        backgroundColor: "#0f2027", // Sun - Yellow
        "&:before": {
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' height='20' width='20' viewBox='0 0 20 20'><path fill='${encodeURIComponent(
            "#fff"
          )}' d='M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z'/></svg>")`,
        },
      },
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: theme.palette.mode === "dark" ? "#8796A5" : "#fdd835",
      },
    },
  },
  "& .MuiSwitch-thumb": {
    backgroundColor: theme.palette.mode === "dark" ? "#003892" : "#fdd835",
    width: 32,
    height: 30,
    "&:before": {
      content: "''",
      position: "absolute",
      width: "100%",
      height: "100%",
      left: 0,
      top: 0,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' height='20' width='20' viewBox='0 0 20 20'><path fill='${encodeURIComponent(
        "#fff"
      )}' d='M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z'/></svg>")`,
    },
  },
  "& .MuiSwitch-track": {
    opacity: 1,
    backgroundColor: theme.palette.mode === "dark" ? "#8796A5" : "#aab4be",
    borderRadius: 20 / 2,
  },
}));

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const port = import.meta.env.VITE_APP_API_KEY;
  const { newToken } = useAuth();
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const navigate = useNavigate();
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState("");



  // Determine effective token (context token takes priority)
  const effectiveToken = newToken || localStorage.getItem("access_token");

  const empName = user?.emp_name || "";
  const nameParts = empName.trim().split(" ");
  const initials =
    nameParts.length >= 2
      ? nameParts[0][0].toUpperCase() +
      nameParts[nameParts.length - 1][0].toUpperCase()
      : empName[0]?.toUpperCase() || "";

  const email = user?.email || "";
  const phoneNo = user?.phone_no || "";
  // console.log("User from localStorage:", user);

  const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseMenu = () => {
    setAnchorElNav(null);
    setAnchorElUser(null);
  };

  const logout = async () => {
    const effectiveToken = newToken || localStorage.getItem("access_token");
    console.log(localStorage.getItem("access_token"), "hii");

    console.log(effectiveToken, "effectiveTokeneffectiveToken");

    if (!effectiveToken) {
      console.error("No access token found");
      // window.location.href = '/login';
      navigate("/login");
      return;
    }

    const refreshToken = localStorage.getItem("refresh_token");
    console.log(refreshToken, "refresh token i got");

    try {
      const response = await fetch(`${port}/admin_web/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${effectiveToken}`,
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });
      localStorage.setItem("logout", Date.now());

      // Clear tokens regardless of logout success or failure
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      localStorage.removeItem("user_group");
      localStorage.removeItem("user_id");
      localStorage.removeItem("permissions");

      if (response.ok) {
        console.log("Logged out successfully");
      } else {
        console.warn("Logout request failed:", await response.text());
      }

      // window.location.href = '/login';
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("token");
      // window.location.href = '/login';
      // navigate("/login");
    }
  };

  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    }, 1000);

    return () => clearInterval(interval); // cleanup on unmount
  }, []);
  // const formattedTime = now.toLocaleTimeString('en-IN', {
  //   hour: '2-digit',
  //   minute: '2-digit',
  //   second: '2-digit',
  // });

  //auto logout for browser and tab close

  // useEffect(() => {
  //   // 1. Flag if it's a refresh
  //   let wasInteracted = false;
  //   let unloadTime = Date.now();

  //   const markInteraction = () => {
  //     wasInteracted = true;
  //   };

  //   const handleBeforeUnload = () => {
  //     unloadTime = Date.now();
  //     sessionStorage.setItem('lastUnloadTime', unloadTime.toString());
  //   };

  //   const handleVisibilityChange = () => {
  //     if (document.visibilityState === 'hidden') {
  //       const now = Date.now();
  //       const diff = now - unloadTime;

  //       // If no interaction recently, treat it as a close (not refresh)
  //       if (!wasInteracted && diff < 500) {
  //         localStorage.setItem('logout', Date.now().toString());
  //       }
  //     }
  //   };

  //   // 2. Cross-tab logout listener
  //   const handleStorage = (e) => {
  //     if (e.key === 'logout') {
  //       // Cleanup and redirect to login
  //       Cookies.remove('token');
  //       localStorage.removeItem('userData');
  //       sessionStorage.clear();

  //       if ('caches' in window) {
  //         caches.keys().then(cacheNames =>
  //           cacheNames.forEach(name => caches.delete(name))
  //         );
  //       }

  //       // Avoid flickering during fast reloads
  //       setTimeout(() => {
  //         if (!window.location.pathname.includes('/login')) {
  //           window.location.href = '/login';
  //         }
  //       }, 100);
  //     }

  //     if (e.key === 'login') {
  //       // Auto-navigate to main page if someone logs in
  //       if (window.location.pathname === '/login') {
  //         window.location.href = '/alert'; // your main page
  //       }
  //     }
  //   };

  //   // 3. Bind all handlers
  //   document.addEventListener('mousedown', markInteraction);
  //   document.addEventListener('keydown', markInteraction);
  //   window.addEventListener('beforeunload', handleBeforeUnload);
  //   document.addEventListener('visibilitychange', handleVisibilityChange);
  //   window.addEventListener('storage', handleStorage);

  //   return () => {
  //     document.removeEventListener('mousedown', markInteraction);
  //     document.removeEventListener('keydown', markInteraction);
  //     window.removeEventListener('beforeunload', handleBeforeUnload);
  //     document.removeEventListener('visibilitychange', handleVisibilityChange);
  //     window.removeEventListener('storage', handleStorage);
  //   };
  // }, []);

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    return regex.test(password);
  };


  const handleChangePassword = async () => {
    if (!validatePassword(newPassword)) {
      setSnackbar({
        open: true,
        message: "Password must be at least 8 characters, include 1 uppercase, 1 lowercase, 1 number, and 1 special character.",
        severity: "error",
      });
      return;
    }


    try {
      const response = await fetch(`${port}/admin_web/emp_changepassword/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${effectiveToken}`,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSnackbar({
          open: true,
          message: data.message || "Failed to change password.",
          severity: "error",
        });
        return;
      }

      setSnackbar({
        open: true,
        message: "Password changed successfully!",
        severity: "success",
      });

      handleClose();
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Redirect to login after 1 second
setTimeout(() => {
  localStorage.removeItem("access_token"); // optional: logout
  navigate('/login');
}, 500);

    } catch (error) {
      setSnackbar({
        open: true,
        message: "An error occurred. Please try again.",
        severity: "error",
      });
      console.error("Change password error:", error);
    }
  }

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // "success" | "error"
  });



  return (

    <AppBar
      position="static"
      sx={{
        background: darkMode
          ? "#202328"
          : "linear-gradient(90deg, #ffffff, #f0f0f0)",
        // background: darkMode
        //   ? "linear-gradient(90deg, #0f2027, #203a43, #2c5364)"
        //   : "linear-gradient(90deg, #ffffff, #f0f0f0)",
        color: darkMode ? "#E5F3F5" : "#000",
        boxShadow: "none",
        transition: "all 0.5s ease-in-out",
        height: "60px",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            px: 2,
            py: 0.5,
            borderRadius: "40px",
            background: darkMode
              ? "linear-gradient(to bottom, #53bce1, rgb(19, 26, 28))"
              : "linear-gradient(to bottom, #53bce1, rgb(228, 236, 238))",
            border: "2px solid grey",
            borderColor: darkMode ? "#5BB9B4" : "#1C3B52",
            gap: 1,
            cursor: "pointer",
          }}
        >
          <Typography
            sx={{
              color: darkMode ? "white" : "#fff",
              fontSize: "15px",
              fontWeight: 400,
              fontFamily: "Roboto, sans-serif",
            }}
          >
            Spero
          </Typography>
          <Typography
            sx={{
              color: darkMode ? "white" : "#fff",
              fontSize: "18px",
              fontWeight: 400,
              fontFamily: "Roboto, sans-serif",
            }}
          >
            DMS
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            px: 2,
            py: 0.5,
          }}
        >
          <Typography
            sx={{
              color: darkMode ? "white" : "#fff",
              fontSize: "28px",
              textAlign: "center",
              fontWeight: 500,
              fontFamily: "Poppins",
            }}
          >
            TSCL EMERGENCY OPERATIONS CENTER
          </Typography>
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            display: { xs: "none", md: "flex" },
            justifyContent: "center",
            gap: 2,
          }}
        >
          {pages.map((page) => (
            <Button key={page} sx={{ color: darkMode ? "white" : "black" }}>
              {page}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              borderRadius: "12px",
              fontSize: "13px",
              width: "130px",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              cursor: "pointer",
            }}
          >
            {/* Date */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <CalendarTodayIcon style={{ fontSize: "16px", color: "orange" }} />
              <span style={{ color: "orange" }}>{formattedDate}</span>
            </div>

            {/* Time */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <AccessTimeIcon style={{ fontSize: "16px", color: "#87CEEB" }} />
              <span style={{ color: "#87CEEB" }}>{currentTime}</span>
            </div>
          </div>

          {/* <Tooltip
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            arrow
          >
            <MaterialUISwitch
              checked={darkMode}
              onChange={toggleDarkMode}
              sx={{
                transition: "transform 0.3s ease, color 0.3s ease",
                "&:hover": { transform: "scale(1.2)" },
                color: darkMode ? "#FFD700" : "#333",
              }}
            />
          </Tooltip> */}

          {/* Mobile Menu */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton onClick={handleOpenNavMenu}>
              <MenuIcon sx={{ color: darkMode ? "#fff" : "#000" }} />
            </IconButton>
            <Menu
              anchorEl={anchorElNav}
              open={Boolean(anchorElNav)}
              onClose={handleCloseMenu}
            >
              {settings.map((setting) => (
                <MenuItem
                  key={setting}
                  onClick={() => {
                    handleCloseMenu();
                    if (setting === "Logout") {
                      setLogoutConfirmOpen(true);
                    } else if (setting === "Profile") {
                      setOpenProfileDialog(true);
                    }
                  }}
                >
                  <Typography>{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* User Menu */}
          <Tooltip title="Open settings">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar
                alt="User Avatar"
                // src="/static/images/avatar/1.jpg"
                sx={{
                  // bgcolor: '#5FECC8',
                  color: "white",
                  background: darkMode
                    ? "linear-gradient(to bottom, #53bce1, rgb(19, 26, 28))"
                    : "linear-gradient(90deg, #1C3B52 0%, #2EB9A3 100%)",
                }}
              >
                {initials}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorElUser}
            open={Boolean(anchorElUser)}
            onClose={handleCloseMenu}
          >
            {settings.map((setting) => (
              <MenuItem
                key={setting}
                onClick={() => {
                  handleCloseMenu();
                  if (setting === "Logout") {
                    setLogoutConfirmOpen(true);
                  } else if (setting === "Profile") {
                    setOpenProfileDialog(true);
                  }
                }}
              >
                <Typography>{setting}</Typography>
              </MenuItem>
            ))}
          </Menu>
          <Dialog
            open={openProfileDialog}
            onClose={() => setOpenProfileDialog(false)}
            PaperProps={{
              sx: {
                position: "absolute",
                top: 60,
                right: 20,
                width: 300,
                borderRadius: 2,
              },
            }}
          >
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar
                  sx={{
                    background: darkMode
                      ? "linear-gradient(to bottom, #53bce1, rgb(19, 26, 28))"
                      : "linear-gradient(90deg, #1C3B52 0%, #2EB9A3 100%)",
                    width: 50,
                    height: 50,
                  }}
                >
                  {initials}
                </Avatar>

                <Box>
                  <Typography variant="h6" display="inline" sx={{ color: 'white' }}>
                    {empName}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ px: 3, py: 2 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Box
                  sx={{
                    backgroundColor: "#FDECEA",
                    borderRadius: "50%",
                    padding: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CallIcon sx={{ color: "rgb(223, 76, 76)", fontSize: 20 }} />
                </Box>
                <Typography
                  sx={{
                    color: "rgb(255, 150, 150)",
                    fontSize: "14px",
                    cursor: "pointer",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {phoneNo}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1.5}>
                <Box
                  sx={{
                    backgroundColor: "#E3F2FD",
                    borderRadius: "50%",
                    padding: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <EmailIcon sx={{ color: "#1E88E5", fontSize: 20 }} />
                </Box>
                <Typography
                  sx={{
                    color: "#90CAF9",
                    fontSize: "14px",
                    cursor: "pointer",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {email}
                </Typography>
              </Box>

              <React.Fragment>
                <Box display="flex" alignItems="center" gap={1.5} sx={{ mt: 2 }}>
                  <Box
                    sx={{
                      backgroundColor: "#FFFFED",
                      borderRadius: "50%",
                      padding: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <VpnKeyIcon sx={{ color: "#EDED00", fontSize: 20, rotate: "20deg" }} />
                  </Box>
                  <Typography
                    sx={{
                      color: "#FFFFAD",
                      fontSize: "14px",
                      cursor: "pointer",
                      "&:hover": { textDecoration: "underline" },

                    }}
                    onClick={handleClickOpen}
                  >
                    Change Password
                  </Typography>
                </Box>
                <Dialog
                  open={open}
                  onClose={handleClose}
                  maxWidth="xs" // sets a smaller default width
                  PaperProps={{
                    sx: {
                      background: 'linear-gradient(to bottom,rgb(57, 114, 135), rgb(19, 26, 28))',
                      color: 'white',// optional: make text readable on dark bg
                      width: "25%",
                    }
                  }}
                >
                  <DialogTitle id="alert-dialog-title">
                    {"Change Password"}
                  </DialogTitle>
                  <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                      Please enter your current password and choose a new one.
                    </DialogContentText>
                    <Grid container direction="column" spacing={2} sx={{ mt: 1 }}>
                      <Grid item sx={{ width: '100%' }}>
                        <TextField
                          label="Old Password"
                          type="password"
                          fullWidth
                          size="small"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          InputLabelProps={{
                            sx: { fontSize: '13px' } // set your desired size
                          }}
                        />
                      </Grid>

                      <Grid item sx={{ width: '100%' }}>
                        <TextField
                          label="New Password"
                          type="password"
                          fullWidth
                          size="small"
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            if (!validatePassword(e.target.value)) {
                              setNewPasswordError("Weak password. Use 8+ chars, A-Z, 0-9, and symbol.");
                            } else {
                              setNewPasswordError("");
                            }
                          }}

                          InputLabelProps={{
                            sx: { fontSize: '13px' } // set your desired size
                          }}
                        />
                      </Grid>

                      <Grid item sx={{ width: '100%' }}>
                        <TextField
                          label="Confirm Password"
                          type="password"
                          fullWidth
                          size="small"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          InputLabelProps={{
                            sx: { fontSize: '13px' } // set your desired size
                          }}
                        />
                      </Grid>

                    </Grid>
                  </DialogContent>
                  <DialogActions sx={{ justifyContent: "center", }}>
                    <Button
                      onClick={handleChangePassword}
                      sx={{
                        backgroundColor: "rgb(18,166,95,0.8)",
                        color: "white",
                        textTransform: 'none',
                        px: 4,
                        "&:hover": {
                          backgroundColor: "rgb(18,166,95,0.8)"
                        }
                      }}
                    >
                      Change
                    </Button>
                  </DialogActions>
                </Dialog>
              </React.Fragment>



            </DialogContent>

            <DialogActions>
              <Button
                onClick={() => setOpenProfileDialog(false)}
                variant="outlined"
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={logoutConfirmOpen}
            onClose={() => setLogoutConfirmOpen(false)}
          >
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogContent>
              <Typography>Are you sure you want to logout?</Typography>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setLogoutConfirmOpen(false)}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button onClick={logout} color="error" variant="contained">
                Logout
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Toolbar>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

    </AppBar>
  );
};

export default Navbar;
