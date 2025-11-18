import { useContext } from 'react';
import './Item.css';
import PriceQtyGroup from './PriceQtyGroup';
import { HeaderContext } from '../header/HeaderContext';

export default function Item({ item }) {
  const {
    id,
    name,
    description,
    price,
    originalQuantity,
    dbPendingQuantity,
    productLineItemId,
  } = item;

  const { originalDiscount, pendingDiscount, updatePendingQuantity, saveItem } =
    useContext(HeaderContext);

  const inCart = originalQuantity !== null && dbPendingQuantity !== 0; // show original Qty group even if 0

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
            discount={originalDiscount} // only for displaying % off
            quantity={originalQuantity}
            disabled={true}
            helpText={'Original Value'}
          />
        )}

        {/* The current item quantity */}
        <PriceQtyGroup
          selectName={`${id}-qty-new`}
          price={price}
          discount={pendingDiscount} // only for displaying % off
          quantity={dbPendingQuantity}
          setQuantity={
            (newQty) => updatePendingQuantity(productLineItemId, id, newQty) // update parent state
          }
          helpText={inCart ? 'New Value' : undefined}
          showZero={inCart}
        />
      </div>

      {/* Save this item button (only visible if the quantity has changed) */}
      {inCart && originalQuantity !== dbPendingQuantity && (
        <button type='button' onClick={() => saveItem(id)}>
          Save This Item
        </button>
      )}

      {/* Add to cart button (only visible if the quantity is 0 and the quantity has not changed) */}
      {!originalQuantity && !dbPendingQuantity && (
        <button
          type='button'
          onClick={() => updatePendingQuantity?.(productLineItemId, id, 1)}
        >
          Add to Cart
        </button>
      )}
    </div>
  );
}
