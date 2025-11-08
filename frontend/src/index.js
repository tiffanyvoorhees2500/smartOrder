import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LoginForm, RegisterForm } from "./components/form/Form";
import Layout from "./components/layout/Layout";
import { LoginForm, RegisterForm } from "./components/Form/Form";

// Check if a user is logged in 
const isLoggedIn = !!localStorage.getItem("token");

// ProtectedRoute only renders children if user is logged in
function ProtectedRoute({ children }) {
  return isLoggedIn ? children : window.location.href = "/login";
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes element={<Layout />}>
        <Route path="/" Component={App} />
        <Route path="/login" Component={LoginForm} />
        <Route path="/register" Component={RegisterForm} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
