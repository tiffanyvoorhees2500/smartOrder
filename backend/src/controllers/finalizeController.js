"use strict";

const { sequelize } = require("../models");
const adminOrderService = require("../services/adminOrderService");
const adminLineItemService = require("../services/adminLineItemsService");
const userOrderService = require("../services/userOrderService");
const userLineItemService = require("../services/userLineItemService");

exports.finalizeOrder = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    // Create the admin order
    const adminOrder = await adminOrderService.createAdminOrder(req.body, {
      transaction: t
    });

    // Create admin line items
    await adminLineItemService.createAdminLineItems(
      adminOrder.id,
      req.body.lineItems,
      { transaction: t }
    );

    // Create the user order
    const userOrder = await userOrderService.createUserOrder(req.body, {
      transaction: t
    });

    // Update adminOrderId in user line items
    await userLineItemService.updateUserLineItemsWithAdminOrderId(
      req.body.userId,
      adminOrder.id,
      { transaction: t }
    );

    await t.commit();
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
