const { UserOrder } = require("../models");

// A User Order will never be created without an Admin Order, and will always be processed as a bulk order.
async function createBulkUserOrders(
  adminOrderId,
  userAmounts,
  adminShippingAmount,
  adminTaxAmount,
  shipToState,
  transaction
) {
  // Make sure the sum of user shipping and tax amounts matches the admin amounts
  const totalUserShipping = userAmounts.reduce(
    (sum, { shippingAmount }) => sum + parseFloat(shippingAmount),
    0
  );
  const totalUserTax = userAmounts.reduce(
    (sum, { taxAmount }) => sum + parseFloat(taxAmount),
    0
  );

  if (totalUserShipping !== parseFloat(adminShippingAmount)) {
    throw new Error("User shipping amounts do not match admin shipping amount");
  }

  if (totalUserTax !== parseFloat(adminTaxAmount)) {
    throw new Error("User tax amounts do not match admin tax amount");
  }

  // A userAmounts object is expected to be in the format:
  // [ { userId: 'user-uuid-1', shippingAmount: 5, taxAmount: 1.5 },
  // { userId: 'user-uuid-2', shippingAmount: 4, taxAmount: 3 }, ... ]
  const userOrdersData = userAmounts.map(
    ({ userId, shippingAmount, taxAmount }) => ({
      userId,
      adminOrderId,
      shippingAmount,
      taxAmount,
      shipToState
    })
  );

  return await UserOrder.bulkCreate(userOrdersData, { transaction });
}

module.exports = { createBulkUserOrders };
