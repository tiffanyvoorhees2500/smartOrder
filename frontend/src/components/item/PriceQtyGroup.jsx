import { useContext } from "react";
import "./PriceQtyGroup.css";
// import { PriceSheetPageContext } from "../../PriceSheetPage";

/**
 *
 * @param {string} selectName - The name of the select input element
 * @param {number} price - The price of the item
 * @param {number} discountedPrice - The amount after discount
 * @param {number} quantity - The quantity of the item
 * @param {boolean} disabled - Whether to display the disabled overlay
 * @param {function} setQuantity - The function to update the quantity
 * @param {string} helpText - The help text to display
 * @param {boolean} showZero - Whether to show the select input when the quantity is 0
 * @param {object} discountObj - {title, min, max, discount } user only to display % off
 * @returns {JSX.Element}
 */
export default function PriceQtyGroup({
  selectName,
  price,
  discountedPrice,
  quantity,
  disabled = false,
  setQuantity = () => {},
  helpText,
  showZero = true,
  discountObj = null,
}) {

  // Line total (qty * price * (1 - discount))
  const total = quantity * discountedPrice

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
        {discountObj && (
          <div>
            {Math.round(discountObj.discount * 100)}% Off{" "}
            <span className="strike">${price.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Price and Quantity row */}
      <div className="priceQtyGroup">
        {/* Quantity Select Box */}
        {quantitySpace}

        {/* Price */}
        <div className="price">
          <span>${discountedPrice.toFixed(2)}</span>
          <div className="divider-thick"></div>
          <span className="bold">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
