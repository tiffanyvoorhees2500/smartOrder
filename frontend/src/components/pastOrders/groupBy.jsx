import { formatCurrency } from "../../utils/normalize";
import ShortenProductName from "../../utils/ShortenProductName";
import GroupByRow from "./groupByRow";

export default function GroupBy({ products, groupByType }) {
  let grouped = products;

  /* Display the grouped items */
  return grouped.map((group) => {
    const shortGroupName = ShortenProductName(group.productName);
    const id = group.productId;

    return (
      <div key={id} className="groupByCard">
        {/* Display the group name (item name or user name) */}
        <div className="bold">
          <span>{shortGroupName}</span>
          <div className="cardSummary">
            <span>{group.adminQuantity}</span>
            <span>@</span>
            <span>{formatCurrency(group.finalPrice)}</span>
            <span>=</span>
            <span>{formatCurrency(group.total)}</span>
          </div>
        </div>

        {/* Display list of items or users */}
        <div>
          {group.users.map((item) => (
            <GroupByRow
              key={`${id}-${item.userId || item.productId}`}
              name={ShortenProductName(item.userName || item.productName)}
              quantity={item.quantity}
            />
          ))}
        </div>
      </div>
    );
  });
}
