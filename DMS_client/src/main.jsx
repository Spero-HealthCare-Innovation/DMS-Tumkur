// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import 'aos/dist/aos.css';
import 'hover.css/css/hover.css';
import { AuthProvider } from "./Context/ContextAPI";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter> {/* ✅ Router should only be here */}
    <AuthProvider>
       <App />
    </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
