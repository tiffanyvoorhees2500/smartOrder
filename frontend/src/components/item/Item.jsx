import { useState, useContext } from 'react';
import './Item.css';
import PriceQtyGroup from './PriceQtyGroup';
import { HeaderContext } from '../header/HeaderContext';

export default function Item({
  id,
  name,
  description,
  price,
  originalQuantity = 0,
  dbPendingQuantity = 0,
  productLineItemId = null,
}) {
  const [savedQuantity, setSavedQuantity] = useState(originalQuantity ?? 0); // State for saved quantity from backend
  const [pendingQuantity, setPendingQuantity] = useState(
    dbPendingQuantity ?? savedQuantity ?? 0
  ); // State for new/pending quantity shown in dropdown
  const [saving, setSaving] = useState(false);

  const { originalDiscount, pendingDiscount, updatePendingQuantity, saveItem } =
    useContext(HeaderContext);

  // recalc when parent context updates: if parent refreshes items, you'll probably unmount/remount,
  // but to keep local state in sync when backend reloads, add effect (optional)
  // Omitted here for brevity — if you want, add useEffect to sync savedQuantity when props change.
  const hasChanged = (savedQuantity ?? 0) !== (pendingQuantity ?? 0);
  const showAddToCart =
    (savedQuantity ?? 0) === 0 && (pendingQuantity ?? 0) === 0;

  const onUpdatePending = async (newQty) => {
    setPendingQuantity(newQty);
    // call context to persist + refresh
    await updatePendingQuantity(productLineItemId, id, newQty);
    // after updatePendingQuantity completes it reloads pricing, which will sync totals & items
  };

  const onSave = async () => {
    setSaving(true);
    try {
      await saveItem(productLineItemId, id);
      // after saveItem finishes, context reloads pricing and your item will be updated by parent
    } finally {
      setSaving(false);
    }
  };

  const actualDiscountToUser = hasChanged ? pendingDiscount : originalDiscount;

  return (
    <div className='itemContainer'>
      <h3>{name}</h3>
      <p>{description}</p>

      <div className='qtyGroups'>
        {hasChanged && (
          <PriceQtyGroup
            selectName={`${id}-qty`}
            price={price}
            percentOff={originalDiscount}
            quantity={savedQuantity}
            disabled={true}
            helpText='Original Value'
          />
        )}

        <PriceQtyGroup
          selectName={`${id}-qty-new`}
          price={price}
          percentOff={actualDiscountToUser} // Can be original or pending depending on whether there are pendings or not.
          quantity={pendingQuantity}
          setQuantity={onUpdatePending}
          helpText={hasChanged ? 'New Value' : ''}
          showZero={hasChanged}
        />
      </div>

      {hasChanged && (
        <button type='button' onClick={onSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save This Item'}
        </button>
      )}

      {showAddToCart && (
        <button type='button' onClick={() => onUpdatePending(1)}>
          Add to Cart
        </button>
      )}
    </div>
  );
}
