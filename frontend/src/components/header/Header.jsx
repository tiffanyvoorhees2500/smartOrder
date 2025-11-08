import React from "react";
import "./Header.css";

export default function Header() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <img src="/logo-horizontal.png" alt="Logo" className="header-logo" />
        <span className="header-title">
          OHS with Rowley's
        </span>
      </div>

      <nav className="header-nav">
        <a href="/current-order">Current Order</a>
        <a href="/past-orders">Past Orders</a>
        <a href="/admin-order">Admin Order</a>
        <a href="/admin-past-orders">Admin Past Orders</a>
        <button className="logout-link" onClick={handleLogout}>Logout</button>
      </nav>
    </header>
  );
}
