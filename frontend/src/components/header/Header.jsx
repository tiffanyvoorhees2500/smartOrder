import { useContext } from "react";
import "./Header.css";
import ProfileButton from "./ProfileButton";
import { FaArrowRight, FaShoppingCart } from "react-icons/fa";
import { HeaderContext } from "./HeaderContext";

export default function Header() {
  const { originalTotal, pendingTotal } = useContext(HeaderContext);
  // const headerContext = useContext(HeaderContext);
  // const price = headerContext.price || 0;
  // const pendingPrice = headerContext.pendingPrice;

  return (
    <header className="app-header">
      <div className="header-left">
        <img src="/logo-horizontal.png" alt="Logo" className="header-logo" />
        <span className="header-title">OHS with Rowley's</span>
      </div>
      <nav className="header-nav">
        <div className="shoppingCart">
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
        </div>
        <ProfileButton />
      </nav>
    </header>
  );
}
