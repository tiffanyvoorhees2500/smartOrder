"use strict";

const { UserLineItem } = require("../models");

exports.saveCurrentOrderUserLineItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body; // quantity is the new pending quantity to set
    const userId = req.user.id;

    // Look for an existing UserLineItem for this user and product without an adminOrderId
    let lineItem = await UserLineItem.findOne({
      where: {
        userId,
        productId,
        adminOrderId: null
      }
    });

    if (quantity === 0) {
      // If quantity is zero, delete the line item if it exists
      if (lineItem) {
        await lineItem.destroy();
        return res.status(200).json({ message: "Line item deleted" });
      }
      return res.status(200).json({ message: "No line item to delete" });
    }

    if (!lineItem) {
      // Create a new UserLineItem if none exists for this current order
      lineItem = await UserLineItem.create({
        userId,
        productId,
        quantity: quantity,
        pendingQuantity: null,
        adminOrderId: null
      });
      return res.status(201).json({ message: "Line item created", lineItem });
    } else {
      // If found, update the existing UserLineItem
      await lineItem.update({
        quantity: quantity,
        pendingQuantity: null // Clear pendingQuantity after saving
      });

      return res.status(201).json({ message: "Line item updated", lineItem });
    }
  } catch (error) {
    console.error("Error saving current order user line item:", error);
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


