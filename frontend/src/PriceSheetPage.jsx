import { useState, useEffect, useMemo } from 'react';
import './PriceSheetPage.css';
import Item from './components/item/Item';
import axios from 'axios';
import DiscountSelector from './components/discountSelector/discountSelector';

const base_url = process.env.REACT_APP_API_BASE_URL;

export default function PriceSheetPage() {
  const [discountOptions, setDiscountOptions] = useState([]);
  const [
    selectedOriginalQuantityDiscount,
    setSelectedOriginalQuantityDiscount,
  ] = useState(null);
  const [selectedPendingQuantityDiscount, setSelectedPendingQuantityDiscount] =
    useState(null);
  const [originalBottles, setOriginalBottles] = useState(0);
  const [pendingBottles, setPendingBottles] = useState(0);

  // const [discount, setDiscount] = useState(30);
  const [items, setItems] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Fetch list of products
    axios
      .get(`${base_url}/products/user-list`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setItems(res.data))
      .catch((err) => console.error('Error fetching products:', err));
  }, [token]);

  useEffect(() => {
    // Fetch list of products
    axios
      .get(`${base_url}/pricing/discount-data`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setDiscountOptions(res.data.DISCOUNT_OPTIONS);
        setSelectedOriginalQuantityDiscount(
          res.data.selectedDiscountForCurrent
        );
        setSelectedPendingQuantityDiscount(res.data.selectedDiscountForPending);
        setOriginalBottles(res.data.totalBottlesForCurrentQuantities);
        setPendingBottles(res.data.totalBottlesWithPendingQuantities);
      })
      .catch((err) => console.error('Error fetching discount data:', err));
  }, [token]);

  const hasPendingQuantities = useMemo(
    () =>
      items.some(
        (item) => (item.pendingQuantity ?? 0) !== (item.quantity ?? 0)
      ),
    [items]
  );

  return (
    <div className='priceSheetPage'>
      <div className='discountSelectorsDiv'>
        {/* Original Quantity Discount Selector */}
        <label>
          {originalBottles} bottles currently toward group discount
          <DiscountSelector
            value={selectedOriginalQuantityDiscount}
            onChange={setSelectedOriginalQuantityDiscount}
            options={discountOptions}
          />
        </label>

        {/* Pending Quantity Discount Selector -- only show if pending exists */}
        {hasPendingQuantities && (
          <label>{pendingBottles} total bottles with your pending quantity<DiscountSelector
            value={selectedPendingQuantityDiscount}
            onChange={setSelectedPendingQuantityDiscount}
            options={discountOptions}
          /></label>
        )}
      </div>

      {/* List of items */}
      <div className='items'>
        {items.map((item) => (
          <Item
            key={item.id}
            {...item}
            originalQuantityDiscount={selectedOriginalQuantityDiscount}
            pendingQuantityDiscount={selectedPendingQuantityDiscount}
            onQuantityChange={(newQty) =>
              setItems((prevItems) =>
                prevItems.map((i) =>
                  i.id === item.id ? { ...i, pendingQuantity: newQty } : i
                )
              )
            }
          />
        ))}
      </div>
    </div>
  );
}
