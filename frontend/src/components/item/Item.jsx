import { useContext } from 'react';
import './Item.css';
import PriceQtyGroup from './PriceQtyGroup';
import { HeaderContext } from '../header/HeaderContext';

export default function Item({ item, searchTerm }) {
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

  // if either quantity is greater than zero, consider the item "in the cart"  
  const inCart = (originalQuantity ?? 0) > 0 || dbPendingQuantity > 0;

  const highlightMatch = (text) => {
    if(!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text
      .split(regex)
      .map((part, i) =>
        regex.test(part) ? <mark key={i}>{part}</mark> : part
      );
  }

  return (
    <div className='itemContainer'>
      {/* Item Name */}
      <h3>{highlightMatch(name)}</h3>

      {/* Item Description */}
      <p>{highlightMatch(description)}</p>

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

      {/* Save this item button (only visible if the quantity is different than pending) */}
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
