import { useContext, useState } from 'react';
import './PriceSheetPage.css';
import Item from './components/item/Item';
import DiscountSelector from './components/discountSelector/DiscountSelector';
import { HeaderContext } from './components/header/HeaderContext';
import { states } from './components/form/states';
import axios from 'axios';

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
    setUser,
    token,
  } = useContext(HeaderContext);

  const base_url = process.env.REACT_APP_API_BASE_URL;
  const [searchTerm, setSearchTerm] = useState('');

  const updateUserShipToState = async (e) => {
    const newState = e.target.value;
    setUser((prev) => ({ ...prev, defaultShipToState: newState }));

    try {
      await axios.put(
        `${base_url}/users/update-ship-to-state`,
        { defaultShipToState: newState },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = items.filter((item) => {
    const term = searchTerm.trim().toLowerCase();
    return (
      item.name.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term)
    );
  });

  if (!user) return <div>Loading user info...</div>;

  return (
    <div className='priceSheetPage'>
      <div className='optionsDiv'>
        <label>
          Search Products
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='Search by name or ingredients...'
          />
        </label>

        {/* User Ship To State */}
        <label>
          State
          <select
            name='defaultShipToState'
            value={user?.defaultShipToState || ''}
            onChange={updateUserShipToState}
            required
          >
            <option value=''>Select a state</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

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

        <label>
          Including Your Pending: {pendingBulkBottles}
          <DiscountSelector
            value={pendingDiscount}
            onChange={(d) => setPendingDiscount(d)}
            options={discountOptions}
          />
        </label>
      </div>

      {/* List of items */}
      <div className='items'>
        {filteredItems.map((item) => (
          <Item key={item.id} item={item} searchTerm={searchTerm} />
        ))}
      </div>
    </div>
  );
}
