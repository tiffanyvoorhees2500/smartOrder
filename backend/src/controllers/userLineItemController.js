"use strict";

const { UserLineItem, User } = require("../models");
const { upsertUserLineItemForCurrentOrder } = require("../services/userLineItemService");

exports.saveCurrentOrderUserLineItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body; // quantity is the new pending quantity to set
    const userId = req.user.id;

    const result = await upsertUserLineItemForCurrentOrder({
      userId,
      productId,
      quantity
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error saving current item:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updatePendingQuantity = async (req, res) => {
  try {
    const { productId, pendingQuantity } = req.body;
    const userId = req.user.id;

    // Find existing UserLineItem for this user and product without an adminOrderId
    let lineItem = await UserLineItem.findOne({
      where: { userId, productId, adminOrderId: null }
    });

    if (!lineItem) {
      // If no line item exists, create one with quantity 0 and set pendingQuantity
      lineItem = await UserLineItem.create({
        userId,
        productId,
        quantity: 0,
        pendingQuantity,
        adminOrderId: null
      });
    } else {
      // Update the pendingQuantity of the existing line item
      if (pendingQuantity === 0 && lineItem.quantity === 0) {
        // If both pendingQuantity and quantity are 0, delete the line item
        await lineItem.destroy();
        return res.status(200).json({ message: "Line item deleted" });
      } else {
        await lineItem.update({ pendingQuantity });
      }
    }

    return res
      .status(200)
      .json({ message: "Pending quantity updated", lineItem });
  } catch (error) {
    console.error("Error updating pending quantity:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.saveAll = async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid items data" });
    }

    const promises = items.map(async (item) => {
      const { id: productId, dbPendingQuantity: pendingQuantity } = item;

      if (!productId) return; // Skip items without a valid product ID

      let lineItem = await UserLineItem.findOne({
        where: { userId, productId, adminOrderId: null }
      });

      if (!lineItem) {
        // if no line item exists, create one if pendingQuantity > 0
        if (pendingQuantity > 0) {
          await UserLineItem.create({
            userId,
            productId,
            quantity: pendingQuantity,
            pendingQuantity: null,
            adminOrderId: null
          });
        }
        return; // skip if pendingQuantity is 0 and no existing line item
      }

      if (pendingQuantity === 0) {
        // If pendingQuantity is zero, delete the line item
        await lineItem.destroy();
      } else {
        // Update the line item's quantity and set pendingQuantity = null
        await lineItem.update({
          quantity: pendingQuantity,
          pendingQuantity: null
        });
      }
    });

    await Promise.all(promises);

    return res.status(200).json({ message: "All items saved successfully" });
  } catch (error) {
    console.error("Error saving all user line items:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.addUserLineItemFromAdminPage = async (req, res) => {
  try {
    // Confirm that logged in user is an admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Restricted to admins only" });
    }

    const { userId, productId, quantity, state } = req.body;

    // Validate
    if (!userId || !productId || typeof quantity !== "number" || quantity < 0 || !state) {
      return res.status(400).json({ message: "Invalid data" });
    }

    // Validate shipToState
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found. " });
    
    if (user.defaultShipToState !== state) {
      return res.status(400).json({
        message: `Cannot save: ${user.name}'s ship-to-state ${user.defaultShipToState} doesn't match ${state}`
      });
    }

    const result = await upsertUserLineItemForCurrentOrder({
      userId,
      productId,
      quantity
    });

    res.status(200).json({ message: "Order updated.", result });
  } catch (err) {
    console.error("Admin create line error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
