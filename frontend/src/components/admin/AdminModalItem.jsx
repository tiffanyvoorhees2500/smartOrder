import "./AdminModalItem.css";
import InlayInputBox from "../form/InlayInputBox";
import { useState, useEffect } from "react";

export function AdminModalItem({
  user,
  userId,
  subtotal,
  shipping,
  taxes,
  isPaidByUser,
  handleUserAmountChange
}) {

  const [shippingInput, setShippingInput] = useState(shipping.toFixed(2));
  const [taxesInput, setTaxesInput] = useState(taxes.toFixed(2));

  useEffect(() => setShippingInput(shipping.toFixed(2)), [shipping]);
  useEffect(() => setTaxesInput(taxes.toFixed(2)), [taxes]);

  // When a user leaves the shipping or taxes input
  // validate and format the input, then update local state and notify parent
  const handleBlur = (field) => {
    const inputValue = parseFloat(field === "shipping" ? shippingInput : taxesInput);
    const parsedValue = parseFloat(inputValue);
    // fall back to the original value if the input is not a number
    const originalValue = field === "shipping" ? shipping : taxes;
    const value = isNaN(parsedValue) ? originalValue : parsedValue;

    // update local input state
    field === "shipping" ? setShippingInput(value.toFixed(2)) : setTaxesInput(value.toFixed(2));
    // propagate to parent
    handleUserAmountChange(userId, field, value);
  };

  // Calculate Total
  const total = (shipping + taxes + subtotal).toFixed(2);

  // Input Element Ids
  const subtotalId = `subtotal_${user}`;
  const shippingId = `shipping_${user}`;
  const taxesId = `taxes_${user}`;
  const totalId = `total_${user}`;

  return (
    <div className="adminModalItem">
      {/* User Name */}
      <span>{user}</span>

      {/* Subtotal */}
      <InlayInputBox htmlFor={subtotalId} title={"Subtotal"}>
        <div>
          <span>$</span>
          <input
            type="number"
            id={subtotalId}
            name={subtotalId}
            value={subtotal.toFixed(2)}
            disabled
          />
        </div>
      </InlayInputBox>

      {/* Shipping */}
      <InlayInputBox htmlFor={shippingId} title={"Shipping"}>
        <div>
          <span>$</span>
          <input
            type="number"
            id={shippingId}
            name={shippingId}
            value={shippingInput}
            step={0.01}
            onChange={(e) => setShippingInput(e.target.value)}
            onBlur={(e) => handleBlur("shipping")}
            onFocus={(e) => e.target.select()}
            disabled={isPaidByUser} // Paying user's shipping is not editable
          />
        </div>
      </InlayInputBox>

      {/* Taxes */}
      <InlayInputBox htmlFor={taxesId} title={"Taxes"}>
        <div>
          <span>$</span>
          <input
            type="number"
            id={taxesId}
            name={taxesId}
            value={taxesInput}
            step={0.01}
            onChange={(e) => setTaxesInput(e.target.value)}
            onBlur={(e) => handleBlur("taxes")}
            onFocus={(e) => e.target.select()}
            disabled={isPaidByUser} // Paying user's taxes is not editable
          />
        </div>
      </InlayInputBox>

      {/* Total */}
      <InlayInputBox htmlFor={totalId} title={"Total"}>
        <div>
          <span>$</span>
          <input
            type="number"
            id={totalId}
            name={totalId}
            value={total}
            disabled
          />
        </div>
      </InlayInputBox>
    </div>
  );
}
