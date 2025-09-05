// src/App.js
import { useState, useMemo, useEffect } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { useLocation } from "react-router-dom";
import Navbar from "./Componenets/Navbar/Navbar";
import Footer from "./Componenets/Footer/Footer";
import Sidebar from "./Componenets/DispatchModule/Sidebar/Sidebar";
import AppRoutes from "./routes/AppRoutes";
import Departmentsidebar from "./Componenets/SuperAdmin/Sidebar/DepartmentSidebar";

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [userGroup, setUserGroup] = useState("");
  const location = useLocation();

  useEffect(() => {
    const storedGroup = localStorage.getItem("user_group");
    setUserGroup(storedGroup);
  }, [location]);

  const isAuthRoute = location.pathname === "/login";

  useEffect(() => {
    const savedMode = localStorage.getItem("dark_mode");
    const storedGroup = localStorage.getItem("user_group");
    if (savedMode) setDarkMode(savedMode === "true");
    if (storedGroup) setUserGroup(storedGroup);
  }, []);

  useEffect(() => {
    localStorage.setItem("dark_mode", darkMode);
  }, [darkMode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
        },
      }),
    [darkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          backgroundColor: darkMode ? "black" : "#f5f5f5",
          transition: "background-color 0.5s ease-in-out",
        }}
      >
        {/* Navbar (fixed at top) */}
        {!isAuthRoute && userGroup !== null && (
          <div style={{ position: "sticky", top: 0, zIndex: 1100 }}>
            <Navbar
              darkMode={darkMode}
              toggleDarkMode={() => setDarkMode((prev) => !prev)}
            />
          </div>
        )}

        {/* Sidebar (only for group 1) */}
        {(userGroup === "1") && <Departmentsidebar darkMode={darkMode} />}

        {/* Main scrollable content */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <AppRoutes darkMode={darkMode} />
        </div>

        {/* Footer (fixed at bottom) */}
        {!isAuthRoute && userGroup !== null && (
          <div style={{ position: "sticky", bottom: 0, zIndex: 1100 }}>
            <Footer darkMode={darkMode} />
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
