import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  // NOTE:
  // In React StrictMode (development), components can be mounted twice on purpose
  // to help detect side-effects. If you have API calls inside useEffect on mount,
  // this can look like a "double hit" in local dev.
  // We disable StrictMode in DEV to avoid duplicating non-idempotent POST/INSERT calls.
  (import.meta.env.DEV ? (
    <>
      <ThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </>
  ) : (
    <React.StrictMode>
      <ThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>
  ))
);

