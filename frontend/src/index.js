import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginForm, RegisterForm } from "./components/form/Form";
import Layout from "./components/layout/Layout";

// Check if a user is logged in
const isLoggedIn = !!localStorage.getItem("token");

// ProtectedRoute only renders children if user is logged in
function ProtectedRoute({ children }) {
  return isLoggedIn ? children : (window.location.href = "/login");
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Layout wraps everything so header/footer always show */}
        <Route path="/" element={<Layout />}>
          {/* Protected route for main app */}
          <Route
            index
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            }
          />
          {/* Public routes */}
          <Route path="login" element={<LoginForm />} />
          <Route path="register" element={<RegisterForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
