import "./AdminModalItem.css";
import InlayInputBox from "../form/InlayInputBox";
import { useEffect, useState } from "react";

export function AdminModalItem({
  user,
  subtotal,
  shipping,
  taxes,
  setUserOrders
}) {
  function updateUserOrders() {
    // Update User Orders with new shipping and taxes where the user matches
    setUserOrders((prevUserOrders) => {
      return prevUserOrders.map((userOrder) => {
        if (userOrder.user === user) {
          return {
            ...userOrder,
            shipping: shippingValue,
            taxes: taxesValue
          };
        } else {
          return userOrder;
        }
      });
    });
  }

  const [shippingValue, setShippingValue] = useState(shipping);
  const [taxesValue, setTaxesValue] = useState(taxes);

  // Update User Orders anytime shipping or taxes changes
  useEffect(updateUserOrders, [shippingValue, taxesValue, setUserOrders, user]);

  // Calculate Total
  const total = (shippingValue + taxesValue + subtotal).toFixed(2);

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
            defaultValue={subtotal.toFixed(2)}
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
            defaultValue={shippingValue}
            step={0.01}
            onInput={(e) => setShippingValue(+e.target.value)}
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
            defaultValue={taxesValue}
            step={0.01}
            onInput={(e) => setTaxesValue(+e.target.value)}
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
