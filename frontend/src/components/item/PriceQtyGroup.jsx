import { useContext } from "react";
import "./PriceQtyGroup.css";
import { PriceSheetPageContext } from "../../PriceSheetPage";

/**
 *
 * @param {string} selectName - The name of the select input element
 * @param {number} price - The price of the item
 * @param {number} quantity - The quantity of the item
 * @param {boolean} disabled - Whether to display the disabled overlay
 * @param {function} setQuantity - The function to update the quantity
 * @param {string} helpText - The help text to display
 * @param {boolean} showZero - Whether to show the select input when the quantity is 0
 * @returns {JSX.Element}
 */
export default function PriceQtyGroup({
  selectName,
  price,
  quantity,
  disabled = false,
  setQuantity = () => {},
  helpText,
  showZero = true,
}) {
  const context = useContext(PriceSheetPageContext);
  const { discount } = context;

  let newPrice = price; // Price Calculations

  // Set the prices to 2 decimal places
  price = price.toFixed(2);
  newPrice = newPrice.toFixed(2);

  // The quantity select box
  let quantitySpace = (
    <>
      {" "}
      <label htmlFor={selectName} aria-label="quantity" className="quantity">
        <select
          name={selectName}
          id={selectName}
          defaultValue={quantity}
          onChange={(e) => setQuantity(+e.target.value)}
          disabled={disabled}
        >
          {Array.from({ length: 100 }, (_, index) => {
            return <option key={index}>{index}</option>;
          })}
        </select>
      </label>
      <span>@</span>
    </>
  );

  // If showZero is false and the quantity is 0, hide the select box
  if (!showZero && !quantity) {
    quantitySpace = null;
  }

  return (
    <div className={`priceQtyGroupContainer`}>
      {/* Disabled Overlay */}
      {disabled && <div className="disabledOverlay"></div>}

      <div className="helpText">
        {/* Help Text ("Original Value" or "New Value") */}
        <span>{helpText}</span>

        {/* Discount percentage and original price */}
        <div>
          {discount}% Off <span className="strike">${price}</span>
        </div>
      </div>

      {/* Price and Quantity row */}
      <div className="priceQtyGroup">
        {/* Quantity Select Box */}
        {quantitySpace}

        {/* Price */}
        <div className="price">
          <span>${newPrice}</span>
          <div className="divider-thick"></div>
          <span className="bold">${newPrice}</span>
        </div>
      </div>
    </div>
  );
}
