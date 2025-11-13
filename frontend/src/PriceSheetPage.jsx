import { createContext, useState } from "react";
import "./PriceSheetPage.css";
import Item from "./components/item/Item";

const testData = [
  {
    id: 1,
    name: "Item 1",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum quod voluptatem veniam quis vero neque eius repellat. Explicabo rerum eligendi labore. Sapiente, ab veniam iure consectetur voluptas officia. Adipisci, enim!",
    price: 10.99,
    quantity: 2,
  },
  {
    id: 2,
    name: "Item 2",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse odio ipsum est tempora laboriosam magnam corrupti, distinctio nobis quis aperiam, natus reprehenderit, harum aliquam minus consectetur laudantium autem voluptatum exercitationem?",
    price: 144.99,
    quantity: null,
  },
  {
    id: 3,
    name: "Item 3",
    description:
      "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Et, magnam quae dolorem ipsa perferendis rem quia est animi atque natus aliquid sunt magni, culpa repellat, incidunt quaerat quibusdam dignissimos fugit.",
    price: 50.99,
    quantity: 3,
  },
  {
    id: 4,
    name: "Item 4",
    description: "",
    price: 1.0,
    quantity: 10,
  },
];

export const PriceSheetPageContext = createContext({
  discount: 30,
  setDiscount: () => {},
});

export default function PriceSheetPage() {
  const [discount, setDiscount] = useState(30);

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
          {testData.map((item) => (
            <Item key={item.id} {...item} />
          ))}
        </div>
      </div>
    </PriceSheetPageContext.Provider>
  );
}
