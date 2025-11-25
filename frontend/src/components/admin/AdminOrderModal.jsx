import "./AdminOrderModal.css";
import { getUserFromToken } from "../../utils/auth";
import InlayInputBox from "../form/InlayInputBox";
import Modal from "../misc/Modal";
import { AdminModalItem } from "./AdminModalItem";
import { useState } from "react";

export default function AdminOrderModal({ isVisible, setIsVisible }) {
  const user = getUserFromToken();
  // Get today's date and remove the time
  const today = new Date().toISOString().split("T")[0];

  const userOptions = [
    { name: "User 1", id: "1" },
    { name: "User 2", id: "2" },
    { name: "User 3", id: "3" }
  ];

  const [userOrders, setUserOrders] = useState([
    {
      user: "User 1",
      subtotal: 1342.63,
      shipping: 1.67,
      taxes: 0.83
    },
    {
      user: "User 2",
      subtotal: 18.04,
      shipping: 1.67,
      taxes: 0.83
    },
    {
      user: "User 3",
      subtotal: 175.89,
      shipping: 1.67,
      taxes: 0.83
    },
    {
      user: "User 4",
      subtotal: 62.24,
      shipping: 1.67,
      taxes: 0.83
    },
    {
      user: "User 5",
      subtotal: 766.29,
      shipping: 1.67,
      taxes: 0.83
    },
    {
      user: "User 6",
      subtotal: 685.93,
      shipping: 1.67,
      taxes: 0.83
    }
  ]);

  const grandTotal = userOrders.reduce(
    (sum, { subtotal, shipping, taxes }) => sum + subtotal + shipping + taxes,
    0
  );

  return (
    <Modal {...{ isVisible, setIsVisible }} className="adminOrderModal">
      {/* Modal Header */}
      <h2>Finalize Order</h2>

      {/* Order Details Section */}
      <div className="modalSection">
        {/* Section Title */}
        <div className="modalSectionTitle">
          <span>Order Details</span>
          <div className="divider-light"></div>
        </div>

        {/* Date of order */}
        <InlayInputBox htmlFor={"date"} title={"Date Order Placed"}>
          <input type="date" name="date" id="date" defaultValue={today} />
        </InlayInputBox>

        {/* Order Paid By */}
        <InlayInputBox htmlFor={"paid_by"} title={"Order Paid By"}>
          <select className="paid_by" defaultValue={user.id}>
            <option value={user.id}>{user.name}</option>
            {userOptions.map((userOption) => (
              <option key={userOption.id} value={userOption.id}>
                {userOption.name}
              </option>
            ))}
          </select>
        </InlayInputBox>
      </div>

      {/* Payment Section */}
      <div className="modalSection">
        {/* Section Title */}
        <div className="modalSectionTitle">
          <span>Amount Paid to OHS: ${grandTotal.toFixed(2)} </span>
          <div className="divider-light"></div>
        </div>

        {/* User Order List */}
        <div className="userList">
          {userOrders.map((userOrder, i) => (
            <AdminModalItem
              key={i}
              user={userOrder.name}
              {...userOrder}
              setUserOrders={setUserOrders}
            />
          ))}
        </div>
      </div>

      {/* Confirm Button */}
      <button type="button" className="highlightButton">
        Confirm
      </button>
    </Modal>
  );
}
