import { useEffect, useState, useRef } from "react";
import InlayInputBox from "../form/InlayInputBox";
import { toast } from "react-toastify";
import "./AdminItemListHeader.css";
import { fetchProductDropdownListOptions } from "../../services/productService";
import { states } from "../../components/form/states";
import UniversalDropdown from "../selectors/universalDropdown";
import { addUserLineItemFromAdminPage } from "../../services/userLineItemService";
import DiscountSelector from "../selectors/DiscountSelector";
import ShipToStateSelector from "../selectors/ShipToStateSelector";

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
  userError,
  adminTaxAmount,
  setAdminTaxAmount,
  adminShippingAmount,
  setAdminShippingAmount,
  refreshAdminItems
}) {
  const personDropdownRef = useRef(null);

  const [productsList, setProductsList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState(null);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedQty, setSelectedQty] = useState(1);

  const [shippingInput, setShippingInput] = useState(
    adminShippingAmount.toFixed(2)
  );
  const [taxInput, setTaxInput] = useState(adminTaxAmount.toFixed(2));

  useEffect(() => {
    // Fetch products for admin order page
    const loadProductsList = async () => {
      try {
        const productList = await fetchProductDropdownListOptions();
        // Split to only product name ignore stuff in ()
        const cleanedProducts = productList.map((product) => ({
          ...product,
          name: product.name.split("(")[0].trim()
        }));

        setProductsList(cleanedProducts);
      } catch (error) {
        console.error("Error fetching admin products:", error);
        setProductError("Failed to load products.");
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProductsList();
  }, []);

  const handleAddToOrder = async () => {
    if (!selectedUserId || !selectedProductId || selectedQty <= 0) {
      toast.error(
        "Error: Please select a user, product, and quantity greater than zero."
      );
      return;
    }

    try {
      await addUserLineItemFromAdminPage({
        userId: selectedUserId,
        productId: selectedProductId,
        quantity: selectedQty,
        state: selectedShipToState
      });

      if (refreshAdminItems) await refreshAdminItems();

      setSelectedUserId("");
      setSelectedProductId("");
      setSelectedQty(1);

      // <-- Set focus back to person dropdown
      personDropdownRef.current?.focus();

      toast.success("Order updated successfully!");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to add to order. Internal Error."
      );
    }
  };

  // Filter users by selected ship-to state
  const filteredUsers = selectedShipToState
    ? usersList.filter(
        (user) => user.defaultShipToState === selectedShipToState
      )
    : usersList;

  useEffect(() => {
    setShippingInput(adminShippingAmount.toFixed(2));
  }, [adminShippingAmount]);

  useEffect(() => {
    setTaxInput(adminTaxAmount.toFixed(2));
  }, [adminTaxAmount]);

  // when shipping input loses focus run validation
  const handleShippingBlur = () => {
    let value = parseFloat(shippingInput);
    if (isNaN(value) || value < 0) value = 0; // don't allow negative shipping amount
    setShippingInput(value.toFixed(2));
    setAdminShippingAmount(value);
  };

  // when tax input loses focus run validation
  const handleTaxBlur = () => {
    let value = parseFloat(taxInput);
    if (isNaN(value) || value < 0) value = 0; // don't allow negative tax amount
    setTaxInput(value.toFixed(2));
    setAdminTaxAmount(value);
  };

  return (
    <div className={"adminListHeader " + className}>
      {/* Discount */}
      <label htmlFor="discount">
        Discount:
        <DiscountSelector
          id={"discount"}
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
        <UniversalDropdown
          label="Person:"
          name="person"
          id="person"
          options={filteredUsers}
          value={selectedUserId}
          onChange={setSelectedUserId}
          loading={loadingUsers}
          error={userError}
          required
          placeholder="Select a user..."
          inputRef={personDropdownRef}
        />

        {/* Product */}
        <UniversalDropdown
          label="Product:"
          id="product"
          name="product"
          options={productsList}
          value={selectedProductId}
          onChange={setSelectedProductId}
          placeholder="Select a product..."
          required
          loading={loadingProducts}
          error={productError}
        />

        {/* Quantity */}
        <label htmlFor="quantity">
          Quantity:
          <select
            name="quantity"
            id="quantity"
            value={selectedQty}
            onChange={(e) => setSelectedQty(Number(e.target.value))}
          >
            {Array.from({ length: 100 }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1}
              </option>
            ))}
          </select>
        </label>

        {/* Confirm Add Button */}
        <button
          type="button"
          className="highlightButton"
          onClick={handleAddToOrder}
        >
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
            value={shippingInput}
            onChange={(e) => setShippingInput(e.target.value)}
            onBlur={handleShippingBlur}
            onFocus={(e) => e.target.select()}
          />
        </InlayInputBox>

        {/* Tax Total */}
        <InlayInputBox htmlFor="tax_total" title="Tax Total">
          <input
            type="number"
            name="tax_total "
            id="tax_total"
            placeholder="0.00"
            value={taxInput}
            onChange={(e) => setTaxInput(e.target.value)}
            onBlur={handleTaxBlur}
            onFocus={(e) => e.target.select()}
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
              $
              {(adminSubtotal + adminTaxAmount + adminShippingAmount).toFixed(
                2
              )}{" "}
              Matches?
            </b>
          </span>
          <span>Finalize Order</span>
        </button>
      </div>
    </div>
  );
}
