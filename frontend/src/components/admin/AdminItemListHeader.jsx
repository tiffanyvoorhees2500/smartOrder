import { useEffect, useState } from "react";
import InlayInputBox from "../form/InlayInputBox";
import "./AdminItemListHeader.css";
import { fetchProductDropdownListOptions } from '../../services/productService';


import { fetchUserDropdownListOptions} from "../../services/userService";

export default function AdminItemListHeader({ className, setIsVisible }) {
  const [productsList, setProductsList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState(null);

  useEffect(() => {
    // Fetch products for admin order page
    const loadProductsList = async () => {
      try {
        const productList = await fetchProductDropdownListOptions();
        setProductsList(productList);

      } catch (error) {
        console.error("Error fetching admin products:", error);
        setProductError("Failed to load products.");
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProductsList();
  }, []);

  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userError, setUserError] = useState(null);

  useEffect(() => {
    // Fetch products for admin order page
    const loadUsersList = async () => {
      try {
        const usersList = await fetchUserDropdownListOptions();
        setUsersList(usersList);

      } catch (error) {
        console.error("Error fetching admin products:", error);
        setUserError("Failed to load products.");
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsersList();
  }, []);

  return (
    <div className={"adminListHeader " + className}>
      {/* Discount */}
      <label htmlFor="discount">
        Discount:
        <select name="discount" id="discount">
          <option value="0">0%</option>
          <option value="20">20%</option>
          <option value="30">30%</option>
        </select>
      </label>

      <div className="divider-light" />

      {/* Add To Order */}
      <div className="headerRow">
        {/* Person */}
        <label htmlFor="person">
          Person:
          <select name="person" id="person">
            <option value="">
              {loadingUsers
                ? "Loading users..."
                : userError
                ? userError
                : "Add a user..."}
            </option>
            {!loadingUsers &&
              !userError &&
              usersList.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name.length > 100
                    ? user.name.slice(0, 100) + "..."
                    : user.name}
                </option>
              ))}
          </select>
        </label>

        {/* Product */}
        <label htmlFor="product">
          Product:
          <select name="product" id="product">
            <option value="">
              {loadingProducts
                ? "Loading products..."
                : productError
                ? productError
                : "Add a product..."}
            </option>
            {!loadingProducts &&
              !productError &&
              productsList.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name.length > 100
                    ? product.name.slice(0, 100) + "..."
                    : product.name}
                </option>
              ))}
          </select>
        </label>

        {/* Quantity */}
        <label htmlFor="quantity">
          Quantity:
          <select name="quantity" id="quantity" defaultValue={0}>
            {Array.from({ length: 100 }, (_, index) => (
              <option key={index} value={index}>
                {index}
              </option>
            ))}
          </select>
        </label>

        {/* Confirm Add Button */}
        <button type="button" className="highlightButton">
          Add To Order
        </button>
      </div>

      <div className="divider-light" />

      {/* Shipping, Tax, and Finalize Button */}
      <div className="headerRow none">
        {/* Shipping Total */}
        <InlayInputBox htmlFor="shipping_total" title="Shipping Total">
          <input
            type="number"
            name="shipping_total"
            id="shipping_total"
            placeholder="0.00"
          />
        </InlayInputBox>

        {/* Tax Total */}
        <InlayInputBox htmlFor="tax_total" title="Tax Total">
          <input
            type="number"
            name="tax_total "
            id="tax_total"
            placeholder="0.00"
          />
        </InlayInputBox>

        {/* Finalize Button */}
        <button
          type="button"
          className="highlightButton"
          onClick={() => setIsVisible(true)}
        >
          <span>$500.00</span>
          <span>Finalize Order</span>
        </button>
      </div>
    </div>
  );
}
