import { useContext } from "react";
import { useLocation } from "react-router-dom"; 
import "./Header.css";
import ProfileButton from "./ProfileButton";
import { FaArrowRight, FaShoppingCart } from "react-icons/fa";
import { HeaderContext } from "./HeaderContext";
import Ping from "../misc/Ping";

export default function Header() {
  const { originalTotal, pendingTotal, showCart, setShowCart } =
    useContext(HeaderContext);
  const location = useLocation();

  const isCurrentOrderPage = location.pathname === "/current-order";
  return (
    <header className="app-header">
      <div className="header-left">
        <img src="/logo-horizontal.png" alt="Logo" className="header-logo" />
        <span className="header-title">OHS with Rowley's</span>
      </div>
      <nav className="header-nav">
        {isCurrentOrderPage && (
          <button
            className={"shoppingCart" + (showCart ? " active" : "")}
            type="button"
            onClick={() => setShowCart((cart) => !cart)}
          >
            {originalTotal !== pendingTotal && <Ping />}
            <FaShoppingCart />
            <span className="cart-total">${originalTotal.toFixed(2)}</span>
            {pendingTotal !== null && pendingTotal !== originalTotal && (
              <>
                <FaArrowRight />
                <span className="cart-total-pending">
                  ${pendingTotal.toFixed(2)}
                </span>
              </>
            )}
          </button>
        )}
        <ProfileButton />
      </nav>
    </header>
  );
}
