"use strict";

const { AdminOrder } = require("../models");

exports.createAdminOrder = async (req, res) => {
  try {
    const { paidForById, shipToState, shippingAmount, taxAmount } = req.body;

    const adminOrder = await AdminOrder.create({
      paidForById,
      shipToState,
      shippingAmount,
      taxAmount
    });

    return res.status(201).json({ message: "Admin Order Created", adminOrder });
  } catch (error) {
    console.error("Error creating admin order: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
