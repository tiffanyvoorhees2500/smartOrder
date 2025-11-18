import { useContext } from 'react';
import './PriceSheetPage.css';
import Item from './components/item/Item';
import DiscountSelector from './components/discountSelector/DiscountSelector';
import { HeaderContext } from './components/header/HeaderContext';

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
  } = useContext(HeaderContext);

  return (
    <div className='priceSheetPage'>
      <div className='discountSelectorsDiv'>
        {/* Discount Selectors */}
        <label>
          Bottles in Bulk Order: {originalBulkBottles}
          <DiscountSelector
            value={originalDiscount}
            onChange={(d) => setOriginalDiscount(d)}
            options={discountOptions}
          />
        </label>
        
        {/* {hasPendingChanges && ( */}
          <label>
            Including Your Pending: {pendingBulkBottles}
            <DiscountSelector
              value={pendingDiscount}
              onChange={(d) => setPendingDiscount(d)}
              options={discountOptions}
            />
          </label>
        {/* )} */}
      </div>

      {/* List of items */}
      <div className='items'>
        {items.map((item) => (
          <Item key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
