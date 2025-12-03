const {
  AdminOrder,
  AdminLineItem,
  Product,
  UserLineItem,
  UserOrder,
  User
} = require("../models");
const { calculateAdminOrderTotals } = require("../services/pricingService");

async function createAdminOrder(
  { orderDate, paidForById, shipToState, shippingAmount, taxAmount },
  transaction
) {
  return await AdminOrder.create(
    { orderDate, paidForById, shipToState, shippingAmount, taxAmount },
    { transaction }
  );
}

async function getPastAdminOrdersWithCalculations({
  limit = 10,
  offset = 0
} = {}) {
  const adminOrders = await AdminOrder.findAll({
    include: [
      {
        model: AdminLineItem,
        as: "adminLineItems",
        include: [
          {
            model: Product,
            as: "product" // include product details
          }
        ]
      },
      {
        model: UserLineItem,
        as: "userLineItems",
        include: [
          {
            model: User,
            as: "user"
          }
        ]
      },
      {
        model: UserOrder,
        as: "userOrders"
      }
    ],
    order: [["orderDate", "DESC"]],
    limit,
    offset
  });

  // Attach adminQuantity, finalPrice, and lineTotal to adminLineItems
  return adminOrders.map((order) => {
    // Parse shipping and tax
    const shipping = parseFloat(order.shippingAmount ?? 0);
    const tax = parseFloat(order.taxAmount ?? 0);

    // Calculate totals for the entire order at once
    const { adminLineItemsWithTotals, subtotal, grandTotal } =
      calculateAdminOrderTotals(
        order.adminLineItems,
        order.userLineItems,
        shipping,
        tax
      );

    // Attach calculated values back to each adminLineItem
    order.adminLineItems = order.adminLineItems.map((item, idx) => ({
      ...item.toJSON(),
      adminQuantity: adminLineItemsWithTotals[idx].adminQuantity,
      lineTotal: parseFloat(adminLineItemsWithTotals[idx].lineTotal.toFixed(2)),
      finalPrice: parseFloat(
        adminLineItemsWithTotals[idx].finalPrice.toFixed(2)
      )
    }));

    // Attach order-level totals
    order.subtotal = parseFloat(subtotal.toFixed(2));
    order.total = parseFloat(grandTotal.toFixed(2));
    order.shippingAmount = shipping;
    order.taxAmount = tax;

    return order;
  });
}

module.exports = { createAdminOrder, getPastAdminOrdersWithCalculations };
