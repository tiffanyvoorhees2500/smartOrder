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
          <input
            type="text"
            name="person"
            id="person"
            placeholder="Add a person..."
          />
        </label>

        {/* Product */}
        <label htmlFor="product">
          Product:
          <input
            type="text"
            name="product"
            id="product"
            placeholder="Add a product..."
          />
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
          <input type="text" name="shipping_total" id="shipping_total" />
        </InlayInputBox>

        {/* Tax Total */}
        <InlayInputBox htmlFor="tax_total" title="Tax Total">
          <input type="text" name="tax_total " id="tax_total" />
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
