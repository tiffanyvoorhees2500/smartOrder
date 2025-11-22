import InlayInputBox from "../form/InlayInputBox";
import "./AdminItemListHeader.css";
export default function AdminItemListHeader({ className, setIsVisible }) {
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
            <option value="">Add a person...</option>
          </select>
        </label>

        {/* Product */}
        <label htmlFor="product">
          Product:
          <select name="product" id="product">
            <option value="">Add a product...</option>
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
