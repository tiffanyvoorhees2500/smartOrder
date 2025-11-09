import React from "react";
import "./Header.css";
import { removeToken, getUserFromToken } from "../../utils/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const user = getUserFromToken();
  const isAdmin = user?.isAdmin;

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

    return (
    <header className="app-header">
      <div className="header-left">
        <img src="/logo-horizontal.png" alt="Logo" className="header-logo" />
        <span className="header-title">OHS with Rowley's</span>
      </div>

      <nav className="header-nav">
        <Link to="/current-order">Current Order</Link>
        <Link to="/past-orders">Past Orders</Link>

        {/* Only show for Admin */}
        {isAdmin && (
          <>
            <Link to="/admin-order">Admin Order</Link>
            <Link to="/admin-past-orders">Admin Past Orders</Link>
          </>
        )}

        <button onClick={handleLogout} className="logout-link">Logout</button>
      </nav>
    </header>
  );
}
