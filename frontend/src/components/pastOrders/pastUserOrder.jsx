import "./pastUserOrder.css";
import GroupByItem from "./groupByItem";
import GroupByPerson from "./groupByPerson";
import InlayInputBox from "../form/InlayInputBox";
import { useState } from "react";

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
          itemId: 1,
          itemName: "Item 1",
          price: 10,
          users: [
            {
              name: "User 1",
              quantity: 2
            },
            {
              name: "User 2",
              quantity: 5
            }
          ]
        },
        {
          itemId: 2,
          itemName: "Item 2",
          price: 34.32,
          users: [
            {
              name: "User 2",
              quantity: 6
            },
            {
              name: "User 4",
              quantity: 2
            }
          ]
        }
      ]
    }
  ];

  const pastOrderComponentGroups = {
    person: GroupByPerson,
    item: GroupByItem
  };
  const groupByOptions = Object.keys(pastOrderComponentGroups);
  const [groupBy, setGroupBy] = useState(groupByOptions[0]);

  console.log(groupBy, groupByOptions);

  return (
    <div className="pastUserOrder">
      <h2>All OHS Past Orders</h2>
      <div className="groupSection">
        <span>Group Order By</span>
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
      <div className="orderContainer">
        {pastOrders.map((pastOrder) => (
          <div key={pastOrder.orderId}>
            <div className="pastOrderHeader">
              <span>{pastOrder.date}</span>
              <span>${pastOrder.total}</span>
            </div>
            {pastOrderComponentGroups[groupBy]?.({
              items: pastOrder.items
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
