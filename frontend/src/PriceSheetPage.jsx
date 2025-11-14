import { createContext, useState, useEffect } from "react";
import "./PriceSheetPage.css";
import Item from "./components/item/Item";
import axios from "axios";

const base_url = process.env.REACT_APP_API_BASE_URL;

// const testData = [
//   {
//     id: 1,
//     name: "Item 1",
//     description:
//       "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum quod voluptatem veniam quis vero neque eius repellat. Explicabo rerum eligendi labore. Sapiente, ab veniam iure consectetur voluptas officia. Adipisci, enim!",
//     price: 10.99,
//     quantity: 2,
//   },
//   {
//     id: 2,
//     name: "Item 2",
//     description:
//       "Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse odio ipsum est tempora laboriosam magnam corrupti, distinctio nobis quis aperiam, natus reprehenderit, harum aliquam minus consectetur laudantium autem voluptatum exercitationem?",
//     price: 144.99,
//     quantity: null,
//   },
//   {
//     id: 3,
//     name: "Item 3",
//     description:
//       "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Et, magnam quae dolorem ipsa perferendis rem quia est animi atque natus aliquid sunt magni, culpa repellat, incidunt quaerat quibusdam dignissimos fugit.",
//     price: 50.99,
//     quantity: 3,
//   },
//   {
//     id: 4,
//     name: "Item 4",
//     description: "",
//     price: 1.0,
//     quantity: 10,
//   },
// ];

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
