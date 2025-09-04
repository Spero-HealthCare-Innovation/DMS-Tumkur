// src/routes/PrivateRoute.js
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("access_token"); // or use context/state
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
