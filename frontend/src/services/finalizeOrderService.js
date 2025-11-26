import axios from "axios";
const base_url = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

/**
 * Finalize a bulk order.
 *
 * @typedef {Object} LineItem
 * @property {number} productId - Product being purchased.
 * @property {number} quantity - Total quantity across all users.
 * @property {number} percentOff - Discount (0 = none, 0.10 = 10% off).
 *
 * @typedef {Object} UserAmount
 * @property {string} userId - User receiving a user order.
 * @property {number} shippingAmount - Portion of total shipping.
 * @property {number} taxAmount - Portion of total tax.
 *
 * @typedef {Object} FinalizeOrderPayload
 * @property {string} userId - The user performing the finalization.
 * @property {string} paidForById - The user who pays the final bill.
 * @property {string} shipToState - State used for tax/shipping rules.
 * @property {number} shippingAmount - Admin-level shipping total.
 * @property {number} taxAmount - Admin-level tax total.
 * @property {LineItem[]} lineItems - Items included in the admin order.
 * @property {UserAmount[]} userAmounts - Breakdown of user-level costs.
 *
 * @param {FinalizeOrderPayload} orderData - Payload sent to backend.
 * @returns {Promise<Object>} Finalized order response.
 */

export const finalizeOrder = async (orderData) => {
  try {
    const response = await axios.post(
      `${base_url}/orders/finalize`,
      orderData,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error finalizing order:", error);
    throw error;
  }
};
