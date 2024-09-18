import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css"; // Import your global CSS file if you have one
import App from "./App"; // Import the root App component
import { BrowserRouter as Router } from "react-router-dom"; // For routing

// Create the root element for React 18
const root = ReactDOM.createRoot(document.getElementById("root"));

// Render the App component wrapped in Router
root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
