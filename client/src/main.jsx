import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AppContext, AppProvider } from "./context/AppContext.jsx";
import { initErrorFilter } from "./utils/errorFilter.js";

// Initialize error filtering early to catch all errors
initErrorFilter();

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AppProvider>
      <App />
    </AppProvider>
  </BrowserRouter>
);
