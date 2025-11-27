import "./AdminModalItem.css";
import InlayInputBox from "../form/InlayInputBox";

export function AdminModalItem({
  user,
  userId,
  subtotal,
  shipping,
  taxes,
  isPaidByUser,
  handleUserAmountChange
}) {
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
            value={shipping}
            step={0.01}
            onChange={(e) =>
              handleUserAmountChange(userId, "shipping", e.target.value)
            }
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
            value={taxes}
            step={0.01}
            onChange={(e) =>
              handleUserAmountChange(userId, "taxes", e.target.value)
            }
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
