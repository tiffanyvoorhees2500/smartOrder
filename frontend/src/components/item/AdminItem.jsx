import "./AdminItem.css";
import PriceQtyGroup from "./PriceQtyGroup";
import InlayInputBox from "../form/InlayInputBox";

export default function AdminItem({ adminItem }) {
  // Set the input element ids for this item
  const wholesaleInputId = `wholesale_price_${adminItem.id}`;
  const retailInputId = `retail_price_${adminItem.id}`;
  const discountInputId = `discount_percentage_${adminItem.id}`;
  const finalInputId = `final_price_${adminItem.id}`;

  // Calculat the final price
  const finalPrice = adminItem.userItems
    .map((x) => {
      // calculate discounted prices
      const discountedPrice =
        x.price * (1 - adminItem.discountPercentage / 100); // Make decimal form
      const total = x.quantity * discountedPrice;
      return total;
    })
    .reduce((a, b) => a + b, 0);

  return (
    <div className="itemContainer adminItemContainer">
      <div className="adminItemsLeft">
        {/* Container for the bulk quantity and product name */}
        <div className="bulkQtyNameContainer">
          <span className="bulkQty">{adminItem.userItems.length}</span>
          <span className="bulkName">{adminItem.name}</span>
        </div>

        {/* Wholesale Price */}
        <InlayInputBox htmlFor={wholesaleInputId} title="Wholesale Price">
          <input
            type="number"
            name={wholesaleInputId}
            id={wholesaleInputId}
            defaultValue={adminItem.wholesalePrice}
          />
        </InlayInputBox>

        {/* Retail Price */}
        <InlayInputBox htmlFor={retailInputId} title="Retail Price">
          <input
            type="number"
            name={retailInputId}
            id={retailInputId}
            defaultValue={adminItem.retailPrice}
          />
        </InlayInputBox>

        {/* Discount Percentage */}
        <InlayInputBox htmlFor={discountInputId} title="Discount %">
          <input
            type="number"
            name={discountInputId}
            id={discountInputId}
            defaultValue={adminItem.discountPercentage}
            disabled
          />
        </InlayInputBox>

        {/* Final Price */}
        <InlayInputBox htmlFor={finalInputId} title="Final Price">
          <input
            type="number"
            name={finalInputId}
            id={finalInputId}
            defaultValue={finalPrice}
            disabled
          />
        </InlayInputBox>
      </div>

      {/* Container for the user items */}
      <div className="adminItemsRight">
        {adminItem.userItems.map((userItem) => (
          <PriceQtyGroup
            key={`${adminItem.id}-${userItem.userId}`}
            selectName={`${adminItem.id}-${userItem.userId}-quantity`}
            price={userItem.price}
            helpText={userItem.name}
            quantity={userItem.quantity}
            discount={adminItem.discountPercentage}
          />
        ))}
      </div>
    </div>
  );
}
