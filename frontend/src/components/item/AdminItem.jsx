import "./AdminItem.css";
import PriceQtyGroup from "./PriceQtyGroup";
import InlayInputBox from "../form/InlayInputBox";

export default function AdminItem() {
  return (
    <div className="itemContainer adminItemContainer">
      <div className="adminItemsLeft">
        <div className="bulkQtyNameContainer">
          <span className="bulkQty">3</span>
          <span className="bulkName">Sample Item</span>
        </div>
        <InlayInputBox htmlFor="wholesale_price" title="Wholesale Price">
          <input type="text" name="wholesale_price" id="wholesale_price" />
        </InlayInputBox>
        <InlayInputBox htmlFor="retail_price" title="Retail Price">
          <input type="text" name="retail_price" id="retail_price" />
        </InlayInputBox>
        <InlayInputBox htmlFor="discount_percentage" title="Discount %">
          <input
            type="text"
            name="discount_percentage"
            id="discount_percentage"
          />
        </InlayInputBox>
        <InlayInputBox htmlFor="final" title="Final Price">
          <input type="text" name="final" id="final" />
        </InlayInputBox>
      </div>

      <div className="adminItemsRight">
        <PriceQtyGroup selectName={"test"} price={15} helpText={"New User 1"} />
        <PriceQtyGroup selectName={"test"} price={15} helpText={"New User 2"} />
        <PriceQtyGroup selectName={"test"} price={15} helpText={"New User 3"} />
      </div>
    </div>
  );
}
