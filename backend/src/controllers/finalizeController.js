"use strict";

const { sequelize } = require("../models");
const adminOrderService = require("../services/adminOrderService");
const adminLineItemService = require("../services/adminLineItemsService");
const userOrderService = require("../services/userOrderService");
const userLineItemService = require("../services/userLineItemService");
const userService = require("../services/userService");
const groupMeService = require("../services/groupMeBotService");

exports.finalizeOrder = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      orderDate,
      paidForById,
      shipToState,
      shippingAmount,
      taxAmount,
      selectedDiscount,
      adminLineItems,
      userAmounts
    } = req.body;

    // Create the admin order
    const adminOrder = await adminOrderService.createAdminOrder(
      { orderDate, paidForById, shipToState, shippingAmount, taxAmount },
      t
    );

    // Create admin line items
    await adminLineItemService.createBulkAdminLineItems(
      {
        adminOrderId: adminOrder.id,
        adminLineItems: adminLineItems,
        selectedDiscount
      },
      t
    );

    // Create the user order
    await userOrderService.createBulkUserOrders(
      {
        adminOrderId: adminOrder.id,
        userAmounts: userAmounts,
        shipToState: shipToState,
        adminShippingAmount: shippingAmount,
        adminTaxAmount: taxAmount
      },
      t
    );

    // Extract user line items from admin line items
    const extractedUserLineItems =
      userLineItemService.extractUserLineItemsFromAdminLineItems(
        adminLineItems
      );

    // Add Pricing to userLineItems
    const userLineItemsWithPricing =
      await userLineItemService.attachPricingToUserLineItems(
        extractedUserLineItems,
        selectedDiscount
      );

    // Update userLineItem adminOrderId and pricing details in bulk
    await userLineItemService.bulkFinalizeCurrentOrders(
      { userLineItemsWithPricing, adminOrderId: adminOrder.id },
      t
    );

    // Calculate order totals for GroupMeMessage
    const orderSubtotals = userOrderService.calculateUserSubtotals(
      userLineItemsWithPricing
    );

    // add calculated totals to userAmounts Object
    const userOrderPriceWithTotals = userAmounts.map((u) => {
      const subtotal = orderSubtotals[u.userId] || 0;
      const grandTotal = subtotal + u.shippingAmount + u.taxAmount;

      return {
        ...u,
        subtotal,
        grandTotal
      };
    });

    // Create Group Me Message
    const formatCurrency = (amount) => {
      return `$${amount.toFixed(2)}`;
    };

    let messageLines = [];

    messageLines.push(
      `OHS Order Placed: ${new Date(orderDate).toLocaleDateString()}`
    );
    messageLines.push("");

    for (const userOrder of userOrderPriceWithTotals) {
      const userName = await userService.getUserName(userOrder.userId);
      messageLines.push(`${userName}: ${formatCurrency(userOrder.grandTotal)}`);
    }

    messageLines.push("");
    messageLines.push(
      "Please visit https://yourapp.com/past-orders to see your completed order details."
    );

    const message = messageLines.join("\n");

    await groupMeService.sendGroupMeMessage(message);

    // Everything was successful, so committ the transaction
    await t.commit();

    //Send success response
    res.status(200).json({ message: "Admin order finalized successfully" });
  } catch (error) {
    console.error("Error finalizing order:", error);

    // Rollback transaction in case of error
    await t.rollback();

    res.status(500).json({
      message: "Failed to finalize admin order",
      error: error.message
    });
  }
};
