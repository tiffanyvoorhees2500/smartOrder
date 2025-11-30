import { useMemo } from "react";
import "./AdminItem.css";
import PriceQtyGroup from "./PriceQtyGroup";
import InlayInputBox from "../form/InlayInputBox";
import { toDecimalPercent, toWholePercent } from "../../utils/normalize";

export default function AdminItem({
  adminItem,
  adminDiscountPercentage,
  onQuantityChange
}) {
  // Set the input element ids for this item
  const wholesaleInputId = `wholesale_price_${adminItem.id}`;
  const retailInputId = `retail_price_${adminItem.id}`;
  const discountInputId = `discount_percentage_${adminItem.id}`;
  const finalInputId = `final_price_${adminItem.id}`;

  const totalQuantity = adminItem.userItems
    .map((x) => x.quantity)
    .reduce((a, b) => a + b, 0);

  const finalPrice = useMemo(() => {
    return (
      adminItem.wholesale -
      adminItem.wholesale * toDecimalPercent(adminDiscountPercentage)
    );
  }, [adminItem.wholesale, adminDiscountPercentage]);

  const subtotal = finalPrice * totalQuantity;

  const handleWholesaleBlur = (e) => {
    const value = parseFloat(e.target.value);
    e.target.value = isNaN(value) ? adminItem.wholesale.toFixed(2) : value.toFixed(2);
  }

  const handleRetailBlur = (e) => {
    const value = parseFloat(e.target.value);
    e.target.value = isNaN(value) ? adminItem.retail.toFixed(2) : value.toFixed(2);
  }

  return (
    <div className="itemContainer adminItemContainer">
      <div className="adminItemsLeft">
        {/* Container for the bulk quantity and product name */}
        <div className="bulkQtyNameContainer">
          <span className="bulkQty">{totalQuantity}</span>
          <span className="bulkName">{adminItem.name}</span>
        </div>

        {/* Wholesale Price */}
        <InlayInputBox htmlFor={wholesaleInputId} title="Wholesale Price">
          <input
            type="number"
            name={wholesaleInputId}
            id={wholesaleInputId}
            defaultValue={adminItem.wholesale.toFixed(2)}
            onFocus={(e) => e.target.select()}
            onBlur={handleWholesaleBlur}
          />
        </InlayInputBox>

        {/* Retail Price */}
        <InlayInputBox htmlFor={retailInputId} title="Retail Price">
          <input
            type="number"
            name={retailInputId}
            id={retailInputId}
            defaultValue={adminItem.retail.toFixed(2)}
            onFocus={(e) => e.target.select()}
            onBlur={handleRetailBlur}
          />
        </InlayInputBox>

        {/* Discount Percentage */}
        <InlayInputBox htmlFor={discountInputId} title="Discount %">
          <input
            type="number"
            name={discountInputId}
            id={discountInputId}
            value={toWholePercent(adminItem.discountPercentage)}
            disabled
          />
        </InlayInputBox>

        {/* Final Price */}
        <InlayInputBox htmlFor={finalInputId} title="Final Price">
          <input
            type="number"
            name={finalInputId}
            id={finalInputId}
            value={finalPrice.toFixed(2)}
            disabled
          />
        </InlayInputBox>

        <div className="subtotal">
          <div className="divider-thick"></div>
          <span>${subtotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Container for the user items */}
      <div className="adminItemsRight">
        {adminItem.userItems.map((userItem) => (
          <PriceQtyGroup
            key={`${adminItem.id}-${userItem.userId}`}
            selectName={`${adminItem.id}-${userItem.userId}-quantity`}
            price={adminItem.wholesale}
            helpText={userItem.name}
            quantity={userItem.quantity}
            setQuantity={(newQuantity) =>
              onQuantityChange(adminItem.id, userItem.userId, newQuantity)
            }
            discount={toWholePercent(adminItem.discountPercentage)}
          />
        ))}
      </div>
    </div>
  );
}
