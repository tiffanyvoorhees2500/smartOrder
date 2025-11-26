import { Fragment } from "react/jsx-runtime";
import "./groupByItem.css";

export default function GroupByItem({ items }) {
  // Loop through each item
  return items.map((item) => {
    // Calculate the total quantity and total price for this item
    const totalQuantity = item.users.reduce(
      (a, { quantity }) => a + quantity,
      0
    );
    const totalPrice = item.price * totalQuantity;

    return (
      <div className="groupBy" key={item.itemId}>
        {/* Item Name */}
        <span className="bold">{item.itemName}</span>

        {/* Item Quantity, Price, and Total */}
        <span className="bold">
          {totalQuantity} @ ${item.price} = ${totalPrice.toFixed(2)}
        </span>

        {/* Display the user names and quantities */}
        {item.users.map((user) => (
          <Fragment key={`${user.name}-${item.itemId}`}>
            {/* User Name */}
            <span>
              {user.quantity} {user.name}
            </span>

            {/* User Quantity, Price, and Total */}
            <span>
              {user.name} - {user.quantity} @ ${item.price} = $
              {(user.quantity * item.price).toFixed(2)}
            </span>
          </Fragment>
        ))}
      </div>
    );
  });
}
