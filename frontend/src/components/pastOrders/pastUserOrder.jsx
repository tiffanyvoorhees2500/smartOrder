import "./pastUserOrder.css";
import GroupByPerson from "./groupBy";
import InlayInputBox from "../form/InlayInputBox";
import { useState } from "react";
import GroupBy from "./groupBy";

export default function PastUserOrder() {
  // const [groupedBy, setGroupedBy] = useState("person")
  const pastOrders = [
    {
      date: "2023-01-01",
      subtotal: 12.34,
      shipping: 0,
      tax: 0,
      total: 12.34,
      orderId: 1,
      items: [
        {
          id: 1,
          name: "Accute",
          price: 20,
          users: [
            {
              id: 1,
              name: "User 1",
              quantity: 2
            },
            {
              id: 2,
              name: "User 2",
              quantity: 5
            }
          ]
        },
        {
          id: 2,
          name: "Big C Nutrient Pak #1",
          price: 45.2,
          users: [
            {
              id: 2,
              name: "User 2",
              quantity: 6
            },
            {
              id: 4,
              name: "User 4",
              quantity: 2
            }
          ]
        }
      ]
    }
  ];

  const groupByOptions = ["person", "item"];
  const [groupBy, setGroupBy] = useState(groupByOptions[0]);

  return (
    <div className="pastUserOrder">
      {/* Page Title */}
      <h2>All OHS Past Orders</h2>

      {/* Group Order By Section */}
      <div className="groupSection">
        {/* Group By Title */}
        <span>Group Order By</span>

        {/* Group By Select Box */}
        <InlayInputBox title={"Group By"} htmlFor={"groupby"}>
          <select
            name="groupby"
            id="groupby"
            onChange={(e) => setGroupBy(e.target.value)}
          >
            {groupByOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </InlayInputBox>
      </div>

      {/* Past Orders Container */}
      <div className="orderContainer">
        {pastOrders.map((pastOrder) => (
          <div key={pastOrder.orderId}>
            {/* Past Order Header and Total */}
            <div className="pastOrderHeader">
              <span>{pastOrder.date}</span>
              <span>${pastOrder.total}</span>
            </div>

            {/* Past Order Value Grouped */}
            <GroupBy items={pastOrder.items} groupByType={groupBy} />
          </div>
        ))}

        {/* Temp for testing */}
        {pastOrders.map((pastOrder) => (
          <div key={pastOrder.orderId}>
            <div className="pastOrderHeader">
              <span>{pastOrder.date}</span>
              <span>${pastOrder.total}</span>
            </div>
            <GroupBy items={pastOrder.items} groupByType={"item"} />
          </div>
        ))}
      </div>
    </div>
  );
}
