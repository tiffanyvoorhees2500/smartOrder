import "./AdminModalItem.css";
import InlayInputBox from "../form/InlayInputBox";
import { useState } from "react";

export function AdminModalItem({ user, subtotal, shipping, taxes }) {
  const [shippingValue, setShippingValue] = useState(shipping);
  const [taxesValue, setTaxesValue] = useState(taxes);
  const total = shippingValue + taxesValue + subtotal;

  const subtotalId = `subtotal_${user}`;
  const shippingId = `shipping_${user}`;
  const taxesId = `taxes_${user}`;
  const totalId = `total_${user}`;

  return (
    <div className="adminModalItem">
      <span>{user}</span>
      <InlayInputBox htmlFor={subtotalId} title={"Subtotal"}>
        <input
          type="number"
          id={subtotalId}
          name={subtotalId}
          defaultValue={subtotal}
          disabled
        />
      </InlayInputBox>
      <InlayInputBox htmlFor={shippingId} title={"Shipping"}>
        <input
          type="number"
          id={shippingId}
          name={shippingId}
          defaultValue={shippingValue}
          step={0.01}
          onInput={(e) => setShippingValue(+e.target.value)}
        />
      </InlayInputBox>
      <InlayInputBox htmlFor={taxesId} title={"Taxes"}>
        <input
          type="number"
          id={taxesId}
          name={taxesId}
          defaultValue={taxesValue}
          step={0.01}
          onInput={(e) => setTaxesValue(+e.target.value)}
        />
      </InlayInputBox>
      <InlayInputBox htmlFor={totalId} title={"Total"}>
        <div>
          <span>$</span>
          <input
            type="number"
            id={totalId}
            name={totalId}
            value={total}
            disabled
            prefix="$"
          />
        </div>
      </InlayInputBox>
    </div>
  );
}
