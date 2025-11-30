import axios from "axios";
const base_url = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

/**
 * Finalize a bulk order.
 * @typedef {Object} UserItem
 * @property {string} name - Name of User.
 * @property {number} quantity - Quantity for this product and this user.
 * @property {string} userId - ID of the user.
 *
 * @typedef {Object} AdminLineItem
 * @property {number} adminQuantity - Sum or user quantities for this item.
 * @property {number} discountPercentage - Percent off applied at admin level.
 * @property {number} finalPrice - Price after discount.
 * @property {number} id - Product Id being purchased.
 * @property {string} name - Name of the product.
 * @property {number} wholesale - Wholesale price before discount.
 * @property {number} retail - Retail price before discount.
 * @property {number} subtotal - Total price for this line item (finalPrice * adminQuantity).
 * @property {UserItem[]} userItems - Array of user-specific line items contributing to this admin line item.
 *
 * @typedef {Object} UserAmount
 * @property {string} userId - User receiving a user order.
 * @property {number} shippingAmount - Portion of total shipping.
 * @property {number} taxAmount - Portion of total tax.
 *
 * @typedef {Object} FinalizeOrderPayload
 * @property {string} paidForById - The user who pays the final bill.
 * @property {string} shipToState - State used for tax/shipping rules.
 * @property {number} shippingAmount - Admin-level shipping total.
 * @property {number} taxAmount - Admin-level tax total.
 * @property {AdminLineItem[]} adminLineItems - Items included in the admin order.
 * @property {UserAmount[]} userAmounts - Breakdown of user-level costs.
 *
 * @param {FinalizeOrderPayload} orderData - Payload sent to backend.
 * @returns {Promise<Object>} Finalized order response.
 */

export const finalizeOrder = async (orderData) => {
  try {
    const response = await axios.post(
      `${base_url}/admin/finalize-order`,
      orderData,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error finalizing order:", error);
    throw error;
  }
};
