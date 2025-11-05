import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LoginForm, RegisterForm } from "./components/Form/Form";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" Component={App} />
        <Route path="/login" Component={LoginForm} />
        <Route path="/register" Component={RegisterForm} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
