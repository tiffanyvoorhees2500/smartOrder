import "./AdminOrderModal.css";
import InlayInputBox from "../form/InlayInputBox";
import Modal from "../misc/Modal";
import { AdminModalItem } from "./AdminModalItem";

export default function AdminOrderModal({
  isVisible,
  setIsVisible,
  userOptions,
  paidByUserId,
  setPaidByUserId,
  userOrders,
  setUserOrders,
  adminSubtotal,
  adminTaxAmount,
  adminShippingAmount
}) {
  // Get today's date and remove the time
  const today = new Date().toISOString().split("T")[0];

  // Calculate grand totals
  const bulkTotal = adminSubtotal + adminTaxAmount + adminShippingAmount;

  const usersTaxTotal = userOrders.reduce((sum, { taxes }) => sum + taxes, 0);
  const usersShippingTotal = userOrders.reduce(
    (sum, { shipping }) => sum + shipping,
    0
  );
  const userGrandTotal = userOrders.reduce(
    (sum, { subtotal, shipping, taxes }) => sum + subtotal + shipping + taxes,
    0
  );

  // Calculate totals to verify against bulk total
  const shippingDiff = Math.abs(usersShippingTotal - adminShippingAmount);
  const taxDiff = Math.abs(usersTaxTotal - adminTaxAmount);
  const grandTotalDiff = Math.abs(userGrandTotal - bulkTotal);

  // Find the user object that matches the selected paidByUserId
  const paidByUser = userOptions.find((u) => u.id === paidByUserId);

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
          <select
            className="paid_by"
            value={paidByUserId}
            onChange={setPaidByUserId}
          >
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
          <span>Amount Paid to OHS: ${bulkTotal.toFixed(2)} </span>
          <br />
          <span>
            Amount to be collected by:{" "}
            {paidByUser ? paidByUser.name : "Unknown"} -- ${" "}
            {userGrandTotal.toFixed(2)}
          </span>
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
