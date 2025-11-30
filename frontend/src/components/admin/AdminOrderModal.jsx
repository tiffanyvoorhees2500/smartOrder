import "./AdminOrderModal.css";
import InlayInputBox from "../form/InlayInputBox";
import Modal from "../misc/Modal";
import { AdminModalItem } from "./AdminModalItem";
import { finalizeOrder } from "../../services/finalizeOrderService";

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
  adminShippingAmount,
  selectedShipToState,
  adminLineItems
}) {
  // Get today's date and remove the time
  const today = new Date().toISOString().split("T")[0];

  // Calculate grand totals
  const bulkTotal = adminSubtotal + adminTaxAmount + adminShippingAmount;
  const userGrandTotal = userOrders.reduce(
    (sum, { subtotal, shipping, taxes }) => sum + subtotal + shipping + taxes,
    0
  );

  const paidByUser = userOptions.find((u) => u.id === paidByUserId);

  // Handles changes to user shipping or taxes.. Makes sure totals always match admin amounts by assigning diffs to paidByUser
  const handleUserAmountChange = (userId, field, value) => {
    setUserOrders((prev) => {
      const updated = prev.map((u) =>
        u.userId === userId ? { ...u, [field]: parseFloat(value) || 0 } : u
      );

      // Recalculate totals
      const totalShipping = updated.reduce((sum, u) => sum + u.shipping, 0);
      const totalTaxes = updated.reduce((sum, u) => sum + u.taxes, 0);

      const shippingDiff = adminShippingAmount - totalShipping;
      const taxDiff = adminTaxAmount - totalTaxes;

      return updated.map((u) => {
        if (u.userId === paidByUserId) {
          return {
            ...u,
            shipping: u.shipping + shippingDiff,
            taxes: u.taxes + taxDiff
          };
        }
        return u;
      });
    });
  };

  const handleConfirm = async () => {
    // Create payload for finalizing order
    const orderData = {
      paidForById: paidByUserId,
      shipToState: selectedShipToState,
      shippingAmount: adminShippingAmount,
      taxAmount: adminTaxAmount,
      adminLineItems: adminLineItems,
      userAmounts: userOrders.map((u) => ({
        userId: u.userId,
        shippingAmount: u.shipping,
        taxAmount: u.taxes
      }))
    };
    // console.log("Payload:", orderData);
    try {
      await finalizeOrder(orderData);
      alert("Order finalized successfully!");
      setIsVisible(false);
    } catch (error) {
      console.error("Failed to finalize order:", error);
      alert("Failed to finalize order. Please try again.");
    }
  };

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
              key={userOrder.userId}
              user={userOrder.user}
              userId={userOrder.userId}
              subtotal={userOrder.subtotal}
              shipping={userOrder.shipping}
              taxes={userOrder.taxes}
              isPaidByUser={userOrder.userId === paidByUserId}
              handleUserAmountChange={handleUserAmountChange}
            />
          ))}
        </div>
      </div>

      {/* Confirm Button */}
      <button type="button" className="highlightButton" onClick={handleConfirm}>
        Confirm
      </button>
    </Modal>
  );
}
