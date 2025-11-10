import "./ProfileButton.css";
import { getUserFromToken, removeToken } from "../../utils/auth";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ProfileButton() {
  const navigate = useNavigate();
  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  const user = getUserFromToken();
  const isAdmin = user?.isAdmin;
  const initials = user?.name.slice(0, 2).toUpperCase();
  const [open, setOpen] = useState(false);

  return (
    <div className="profileButton" onClick={() => setOpen(!open)}>
      <div className="profileIcon">{initials}</div>
      <div
        className={"profileMenu " + (open ? "active" : "")}
        onMouseLeave={() => setOpen(false)}
      >
        <Link to="/current-order">Current Order</Link>
        <Link to="/past-orders">Past Orders</Link>

        {/* Only show for Admin */}
        {isAdmin && (
          <>
            <div className="divider"></div>
            <Link to="/admin-order">Admin Order</Link>
            <Link to="/admin-past-orders">Admin Past Orders</Link>
          </>
        )}

        {/* Divider and Logout button */}
        <div className="divider"></div>
        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
