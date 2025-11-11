import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import "./Layout.css";

export default function Layout({ children }) {
  const location = useLocation();
  const hideHeaderFooter = location.pathname === "/login";

  return (
    <div className="app-layout">
      {!hideHeaderFooter && <Header />}

      <main className={hideHeaderFooter ? "login-main" : "main-content"}>
        <Outlet />
      </main>

      {!hideHeaderFooter && <Footer />}
    </div>
  );
}