import { useState } from "react";
import GroupBy from "./groupBy";
import { formatCurrency } from '../../utils/normalize';

export default function PastOrder({ pastOrder, groupBy, index }) {
  const [open, setOpen] = useState(index === 0);
  console.log(pastOrder);
  return (
    <div
      key={pastOrder.adminOrderId}
      className={`pastOrderContainer`}
      onClick={() => setOpen(!open)}
    >
      {/* Past Order Header and Total */}
      <div className="pastOrderHeader">
        <span>{pastOrder.orderDate.split("T")[0]}</span>
        <span>{formatCurrency(pastOrder.total)}</span>
      </div>

      {/* Past Order Value Grouped */}
      <div className={`groupByContainer  ${open ? "active" : ""}`}>
        <GroupBy products={pastOrder.products} groupByType={groupBy} />
        <div className="orderSummary">
          <span>Subtotal: {formatCurrency(pastOrder.subtotal)}</span>
          <span>Shipping Amount: {formatCurrency(pastOrder.shippingAmount)}</span>
          <span>Tax Amount {formatCurrency(pastOrder.taxAmount)}</span>
          <span>Grand Total {formatCurrency(pastOrder.total)}</span>
        </div>
      </div>
    </div>
  );
}
