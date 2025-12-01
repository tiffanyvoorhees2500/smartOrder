"use strict";

const { sequelize } = require("../models");
const adminOrderService = require("../services/adminOrderService");
const adminLineItemService = require("../services/adminLineItemsService");
const userOrderService = require("../services/userOrderService");
const userLineItemService = require("../services/userLineItemService");

exports.finalizeOrder = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      orderDate,
      paidForById,
      shipToState,
      shippingAmount,
      taxAmount,
      adminLineItems,
      userAmounts
    } = req.body;

    // Create the admin order
    const adminOrder = await adminOrderService.createAdminOrder(
      { orderDate,paidForById, shipToState, shippingAmount, taxAmount },
      t
    );

    // Create admin line items
    await adminLineItemService.createBulkAdminLineItems(
      {
        adminOrderId: adminOrder.id,
        adminLineItems: adminLineItems
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
        extractedUserLineItems
      );

    // Update userLineItem adminOrderId and pricing details in bulk
    await userLineItemService.bulkFinalizeCurrentOrders(
      { userLineItemsWithPricing, adminOrderId: adminOrder.id },
      t
    );

    await t.commit();
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
