import { useContext, useState } from "react";
import "./Item.css";
import PriceQtyGroup from "./PriceQtyGroup";
import { HeaderContext } from "../header/HeaderContext";
import axios from "axios";

const base_url = process.env.REACT_APP_API_BASE_URL;

/**
 * An item on the price sheet
 * @param {number} id - The id of the item
 * @param {string} name - The name of the item
 * @param {string} description - The description of the item
 * @param {number} price - The price of the item
 * @param {number|null} quantity - The quantity of the item
 *
 * @returns {JSX.Element}
 */
export default function Item({ id, name, description, price, quantity, originalQuantity = null, dbPendingQuantity = null}) {
  
  // State for saved quantity from backend
  const [savedQuantity, setSavedQuantity] = useState(originalQuantity ?? null);

  // State for new/pending quantity shown in dropdown
  const [pendingQuantity, setPendingQuantity] = useState(dbPendingQuantity ?? savedQuantity ?? 0);

  const [saving, setSaving] = useState(false);

  const [pendingCartQuantity, setPendingCartQuantity] = useState(quantity ?? 0);
  const headerContext = useContext(HeaderContext);

  // true when user modifies quantity (quantity can be null)
  const hasChanged = (savedQuantity ?? 0) !== (pendingQuantity ?? 0);

  const saveItem = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${base_url}/user-line-items/save-line-item`, {
        productId: id,
        quantity: pendingQuantity, // send 0 to delete item
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state after successful save
      if (pendingQuantity === 0) {
        setSavedQuantity(null); // deleted from user line items
        setPendingQuantity(0);
      } else {
        setSavedQuantity(pendingQuantity);
      }
      console.log("Save successful:", response.data);
    } catch (error) {
      console.error("Error saving item:", error);
    } finally {
      setSaving(false);
    }
  };

  const updatePending = async (newPending) => {
    setPendingQuantity(newPending); // update local state immediately
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${base_url}/user-line-items/update-pending-quantity`, {
        productId: id,
        pendingQuantity: newPending,
      }, { headers: { Authorization: `Bearer ${token}` }});

      setPendingCartQuantity(1);
      headerContext?.setPendingPrice(
        (currentPendingPrice) => currentPendingPrice + price
      );
    } catch (error) {
      console.error("Error updating pending quantity:", error);
    }
  };


  const headerContext = useContext(HeaderContext);

  return (
    <div className="itemContainer">
      {/* Item Name */}
      <h3>{name}</h3>

      {/* Item Description */}
      <p>{description}</p>

      <div className="qtyGroups">
        {/* The original item quantity (only visible the quantity has changed) */}
        {hasChanged && (
          <PriceQtyGroup
            selectName={`${id}-qty`}
            price={price}
            quantity={savedQuantity}
            disabled={true}
            helpText={hasChanged && "Original Value"}
          />
        )}

        {/* The current item quantity */}
        <PriceQtyGroup
          selectName={`${id}-qty-new`}
          price={price}
          quantity={pendingQuantity}
          setQuantity={updatePending}
          helpText={hasChanged ? "New Value" : "" }
          showZero={hasChanged}
        />
      </div>

      {/* Save this item button (only visible if the quantity has changed) */}
      {hasChanged && (
        <button type="button" onClick={saveItem} disabled={saving}>
          {saving ? "Saving..." : "Save This Item"}
        </button>
      )}

      {/* Add to cart button (only visible if the quantity is 0 and the quantity has not changed) */}
      {!quantity && !hasChanged && (
        <button type="button" onClick={() => updatePending(1)}>
          Add to Cart
        </button>
      )}
    </div>
  );
}
