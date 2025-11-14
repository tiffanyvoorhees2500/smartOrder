import { useState } from "react";
import "./Item.css";
import PriceQtyGroup from "./PriceQtyGroup";

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
export default function Item({ id, name, description, price, quantity = null }) {

  // if quantity is null, set to 0, otherwise use quantity from db
  const [pendingQuantity, setPendingQuantity] = useState(quantity ?? 0);
  
  // true when user modifies quantity (quantity can be null)
  const hasChanged = (quantity ?? 0) !== pendingQuantity;

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
            quantity={quantity}
            disabled={true}
            helpText={hasChanged && "Original Value"}
          />
        )}

        {/* The current item quantity */}
        <PriceQtyGroup
          selectName={`${id}-qty-new`}
          price={price}
          quantity={pendingQuantity}
          setQuantity={setPendingQuantity}
          helpText={hasChanged && "New Value"}
          showZero={hasChanged}
        />
      </div>

      {/* Save this item button (only visible if the quantity has changed) */}
      {hasChanged && <button type="button">Save This Item</button>}

      {/* Add to cart button (only visible if the quantity is 0 and the quantity has not changed) */}
      {!quantity && !hasChanged && (
        <button type="button" onClick={() => setPendingQuantity(1)}>
          Add to Cart
        </button>
      )}
    </div>
  );
}
