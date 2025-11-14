import { createContext, useState, useEffect } from "react";
import "./PriceSheetPage.css";
import Item from "./components/item/Item";
import axios from "axios";

const base_url = process.env.REACT_APP_API_BASE_URL;

export const PriceSheetPageContext = createContext({
  discount: 30,
  setDiscount: () => {},
});

export default function PriceSheetPage() {
  const [discount, setDiscount] = useState(30);
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Fetch list of products
    const token = localStorage.getItem("token");
    axios.get(`${base_url}/products/user-list`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setItems(res.data))
      .catch(err => console.error("Error fetching products:", err));
  }, []);

  return (
    <PriceSheetPageContext.Provider value={{ discount, setDiscount }}>
      <div className="priceSheetPage">
        {/* Temp code to test discount context */}
        <select onChange={(e) => setDiscount(e.target.value)} value={discount}>
          <option value={30}>30%</option>
          <option value={50}>50%</option>
          <option value={70}>70%</option>
        </select>

        {/* List of items */}
        <div className="items">
          {items.map((item) => (
            <Item key={item.id} {...item} />
          ))}
        </div>
      </div>
    </PriceSheetPageContext.Provider>
  );
}
