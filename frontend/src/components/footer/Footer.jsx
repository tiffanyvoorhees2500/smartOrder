import React from "react";
import "./Footer.css";
import { FaShoppingCart } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="app-footer">
      <p className="footer-left">© 2025 Smart Order. All rights reserved.</p>
      <div className="footer-right">
        <FaShoppingCart className="cart-icon" />
        <span className="cart-total">$0.00</span>
      </div>
    </footer>
  );
}