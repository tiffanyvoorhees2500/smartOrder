import { useState } from "react";
import GroupBy from "./groupBy";

export default function PastOrder({ pastOrder, groupBy, index }) {
  const [open, setOpen] = useState(index === 0);
  
  return (
    <div
      key={pastOrder.adminOrderId}
      className={`pastOrderContainer`}
      onClick={() => setOpen(!open)}
    >
      {/* Past Order Header and Total */}
      <div className="pastOrderHeader">
        <span>{pastOrder.orderDate.split("T")[0]}</span>
        <span>${pastOrder.total}</span>
      </div>

      {/* Past Order Value Grouped */}
      <div className={`groupByContainer  ${open ? "active" : ""}`}>
        <GroupBy
          products={pastOrder.products}
          groupByType={groupBy}
        />
        <div className="orderSummary">
          <span>Subtotal: ${pastOrder.subtotal}</span>
          <span>Shipping Amount: ${pastOrder.shippingAmount}</span>
          <span>Tax Amount ${pastOrder.taxAmount}</span>
          <span>Grand Total ${pastOrder.total}</span>
        </div>
      </div>
    </div>
  );
}
