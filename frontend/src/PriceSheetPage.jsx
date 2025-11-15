import { createContext, useState, useEffect } from 'react';
import './PriceSheetPage.css';
import Item from './components/item/Item';
import axios from 'axios';

const base_url = process.env.REACT_APP_API_BASE_URL;

export const PriceSheetPageContext = createContext({
  discount: 30,
  setDiscount: () => {},
});

export default function PriceSheetPage() {
  const [discount, setDiscount] = useState(30);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = items.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term)
    );
  });

  useEffect(() => {
    // Fetch list of products
    const token = localStorage.getItem('token');
    axios
      .get(`${base_url}/products/user-list`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setItems(res.data))
      .catch((err) => console.error('Error fetching products:', err));
  }, []);

  return (
    <PriceSheetPageContext.Provider value={{ discount, setDiscount }}>
      <div className='priceSheetPage'>
        <div className='searchElement'>
          <label>
            Search Products
            <input
              type='text'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder='Search by name or ingredients...'
            />
          </label>
        </div>

        {/* Temp code to test discount context */}
        <select onChange={(e) => setDiscount(e.target.value)} value={discount}>
          <option value={30}>30%</option>
          <option value={50}>50%</option>
          <option value={70}>70%</option>
        </select>

        {/* List of items */}
        <div className='items'>
          {filteredItems.map((item) => (
            <Item key={item.id} {...item} searchTerm={searchTerm} />
          ))}
        </div>
      </div>
    </PriceSheetPageContext.Provider>
  );
}
