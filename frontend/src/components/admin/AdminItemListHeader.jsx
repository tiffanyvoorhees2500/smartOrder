import { useEffect, useState } from "react";
import InlayInputBox from "../form/InlayInputBox";
import "./AdminItemListHeader.css";
import { fetchProductDropdownListOptions } from "../../services/productService";
import { states } from "../../components/form/states";
import DiscountSelector from "../selectors/DiscountSelector";
import ShipToStateSelector from "../selectors/ShipToStateSelector";
import UserSelector from "../selectors/UserSelector";

export default function AdminItemListHeader({
  className,
  setIsVisible,
  discountOptions,
  selectedDiscount,
  setSelectedDiscount,
  selectedShipToState,
  setSelectedShipToState,
  numberBottles,
  adminSubtotal,
  usersList,
  loadingUsers,
  userError
}) {
  const [productsList, setProductsList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState(null);

  const [taxAmount, setTaxAmount] = useState(0);
  const [shippingAmount, setShippingAmount] = useState(0);

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

  return (
    <div className={"adminListHeader " + className}>
      {/* Discount */}
      <label htmlFor="discount">
        Discount:
        <DiscountSelector
          value={selectedDiscount}
          onChange={setSelectedDiscount}
          options={discountOptions}
        />
      </label>

      <p>Number of Bottles in Bulk Order: {numberBottles}</p>

      {/* State Selector */}
      <ShipToStateSelector
        label="State"
        name="defaultShipToState"
        value={selectedShipToState || ""}
        options={states}
        onChange={setSelectedShipToState}
        required
        placeholder="Select a state"
      />

      <div className="divider-light" />

      {/* Add To Order */}
      <div className="headerRow">
        {/* Person */}
        <UserSelector 
          label="Person"
          name="person"
          id="person"
          value=""
          options={usersList}
          onChange={() => {}}
          loading={loadingUsers}
          error={userError}
          required
          placeholder="Select a user..."
        />

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
            value={shippingAmount}
            onChange={(e) => setShippingAmount(parseFloat(e.target.value) || 0)}
          />
        </InlayInputBox>

        {/* Tax Total */}
        <InlayInputBox htmlFor="tax_total" title="Tax Total">
          <input
            type="number"
            name="tax_total "
            id="tax_total"
            placeholder="0.00"
            value={taxAmount}
            onChange={(e) => setTaxAmount(parseFloat(e.target.value) || 0)}
          />
        </InlayInputBox>

        {/* Finalize Button */}
        <button
          type="button"
          className="highlightButton"
          onClick={() => setIsVisible(true)}
        >
          <span>
            <b>
              ${(adminSubtotal + taxAmount + shippingAmount).toFixed(2)}{" "}
              Matches?
            </b>
          </span>
          <span>Finalize Order</span>
        </button>
      </div>
    </div>
  );
}
