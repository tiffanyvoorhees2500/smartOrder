import { useState, useEffect } from 'react';
import './Item.css';
import PriceQtyGroup from './PriceQtyGroup';

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
export default function Item({
  id,
  name,
  description,
  price,
  quantity = null,
  pendingQuantity: pendingQtyFromParent,
  originalQuantityDiscount,
  pendingQuantityDiscount,
  onQuantityChange,
}) {
  // if quantity is null, set to 0, otherwise use quantity from db
  const [pendingQuantity, setPendingQuantity] = useState(
    pendingQtyFromParent ?? 0
  );

  // Sync local state if parent updates pendingQuantity
  useEffect(() => {
    setPendingQuantity(pendingQtyFromParent ?? 0);
  }, [pendingQtyFromParent]);

  // true when user modifies quantity (quantity can be null)
  const hasChanged = (quantity ?? 0) !== pendingQuantity;

  const applyDiscount = (price, discountObj) =>
    discountObj ? price * (1 - discountObj.discount) : price;

  const originalDiscountedPrice = applyDiscount(
    price,
    originalQuantityDiscount
  );
  const pendingDiscountedPrice = applyDiscount(price, pendingQuantityDiscount);

  return (
    <div className='itemContainer'>
      {/* Item Name */}
      <h3>{name}</h3>

      {/* Item Description */}
      <p>{description}</p>

      <div className='qtyGroups'>
        {/* The original item quantity (only visible the quantity has changed) */}
        {hasChanged && (
          <PriceQtyGroup
            selectName={`${id}-qty`}
            price={price}
            discountedPrice={originalDiscountedPrice}
            discountObj={originalQuantityDiscount} // only for displaying % off
            quantity={quantity}
            disabled={true}
            helpText={hasChanged && 'Original Value'}
          />
        )}

        {/* The current item quantity */}
        <PriceQtyGroup
          selectName={`${id}-qty-new`}
          price={price}
          discountedPrice={pendingDiscountedPrice}
          discountObj={pendingQuantityDiscount} // only for displaying % off
          quantity={pendingQuantity}
          setQuantity={(newQty) => {
            setPendingQuantity(newQty); // update local state
            onQuantityChange?.(newQty); // update parent state
          }}
          helpText={hasChanged && 'New Value'}
          showZero={hasChanged}
        />
      </div>

      {/* Save this item button (only visible if the quantity has changed) */}
      {hasChanged && <button type='button'>Save This Item</button>}

      {/* Add to cart button (only visible if the quantity is 0 and the quantity has not changed) */}
      {!quantity && !hasChanged && (
        <button
          type='button'
          onClick={() => {
            setPendingQuantity(1);
            onQuantityChange?.(1);
          }}
        >
          Add to Cart
        </button>
      )}
    </div>
  );
}
