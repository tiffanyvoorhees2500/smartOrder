import { useState, useEffect, useContext } from 'react';
import './Item.css';
import PriceQtyGroup from './PriceQtyGroup';
import { HeaderContext } from '../header/HeaderContext';

export default function Item({ item }) {
  const {
    id,
    name,
    description,
    price,
    quantity,
    pendingQuantity,
    productLineItemId,
  } = item;

  const {
    originalQuantityDiscount,
    pendingQuantityDiscount,
    setPendingQuantity,
    updatePendingQuantity,
  } = useContext(HeaderContext);

  // true if productLineItemId is not null
  const inCart = !!quantity

  // calculate discounted prices
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
        {/* The original item quantity (only visible if productLineItemId exists) */}
        {inCart && (
          <PriceQtyGroup
            selectName={`${id}-qty`}
            price={price}
            discountedPrice={originalDiscountedPrice}
            discountObj={originalQuantityDiscount} // only for displaying % off
            quantity={quantity}
            disabled={true}
            helpText={inCart && 'Original Value'}
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
            updatePendingQuantity?.(productLineItemId, id, newQty); // update parent state
          }}
          helpText={inCart && 'New Value'}
          showZero={inCart}
        />
      </div>

      {/* Save this item button (only visible if the quantity has changed) */}
      {(inCart && quantity !== pendingQuantity) && <button type='button'>Save This Item</button>}

      {/* Add to cart button (only visible if the quantity is 0 and the quantity has not changed) */}
      {!quantity && !inCart && (
        <button
          type='button'
          onClick={() => {
            updatePendingQuantity?.(productLineItemId, id, 1);
          }}
        >
          Add to Cart
        </button>
      )}
    </div>
  );
}
