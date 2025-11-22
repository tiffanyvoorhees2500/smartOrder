import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "./PriceSheetPage.css";
import Item from "./components/item/Item";
import DiscountSelector from "./components/discountSelector/DiscountSelector";
import { HeaderContext } from "./components/header/HeaderContext";
import { states } from "./components/form/states";
import Ping from "./components/misc/Ping";
import { FaArrowLeft } from "react-icons/fa";

export default function PriceSheetPage() {
  const {
    items,
    discountOptions,
    originalDiscount,
    pendingDiscount,
    setOriginalDiscount,
    setPendingDiscount,
    originalBulkBottles,
    pendingBulkBottles,
    user,
    loadingUser,
    showCart,
    setShowCart,
    updateUserShipToState,
    loadPricing,
    hasPendingChanges,
    saveAll,
  } = useContext(HeaderContext);

  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();

  useEffect(() => {
    loadPricing();
  }, [location.pathname, loadPricing]);

  const filteredItems = items.filter((item) => {
    const term = searchTerm.trim().toLowerCase();

    // Get product quantities
    const original = item.originalQuantity ?? 0;
    const pending = item.dbPendingQuantity ?? 0

    // If cart view is active, filter by rules
    if (showCart) {
      const shouldShow = 
        original !== pending ||
        original > 0 ||
        pending > 0;
      
      if (!shouldShow) return false;
    }

    // Search filtering
    // if (item.dbPendingQuantity === 0 && showCart) return false;
    return (
      item.name.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term)
    );
  });

  const handleSaveAll = async () => {
    if (!hasPendingChanges) {
      toast.info("No changes to save.");
      return;
    }

    try {
      await saveAll();
      toast.success("All changes saved!");
    } catch (err) {
      console.error("handleSaveAll error:", err);
      toast.error("Error saving changes.");
    }
  };

  if (loadingUser) return <div>Loading user info...</div>;

  return (
    <div className="priceSheetPage">
      {showCart && (
        <button
          type="button"
          className="backButton"
          onClick={() => setShowCart(false)}
        >
          <FaArrowLeft />
          Back to Home
        </button>
      )}
      {showCart && <h2>Current Order for {user.name}</h2>}

      <div className="optionsDiv">
        <label>
          Search Products
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or ingredients..."
          />
        </label>

        <label>
          State
          <select
            name="defaultShipToState"
            value={user?.defaultShipToState || ""}
            onChange={(e) => updateUserShipToState(e.target.value)}
            required
          >
            <option value="">Select a state</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="discountSelectorsDiv">
        <label>
          Bottles in Bulk Order: {originalBulkBottles}
          <DiscountSelector
            value={originalDiscount}
            onChange={setOriginalDiscount}
            options={discountOptions}
          />
        </label>

        <label>
          Including Your Pending: {pendingBulkBottles}
          <DiscountSelector
            value={pendingDiscount}
            onChange={setPendingDiscount}
            options={discountOptions}
          />
        </label>
      </div>

      <div className="items">
        {filteredItems.map((item) => (
          <Item key={item.id} item={item} searchTerm={searchTerm} />
        ))}
      </div>

      {hasPendingChanges && (
        <button
          type="button"
          className="floatingSubmit highlightButton"
          onClick={handleSaveAll}
        >
          <Ping />
          Save All Changes
        </button>
      )}
    </div>
  );
}
