import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../header/Header";
import Footer from "../footer/Footer";

export default function Layout({ children }) {
  const location = useLocation();
  const hideHeaderFooter = location.pathname === "/login";

  return (
    <div className="app-layout">
      {!hideHeaderFooter && <Header />}

      <main>
        <Outlet />
      </main>

      {!hideHeaderFooter && <Footer />}
    </div>
  );
}