"use strict";

const db = require("../models");
const { UserLineItem, User, Product } = db;
const { Op } = require("sequelize");

exports.currentBulkUserLineItemsWithUser = async (shipToState) => {
  // We need to get all userLineItems where adminOrderId is null and that are in the same location as shipToState
  const lineItems = await UserLineItem.findAll({
    where: { adminOrderId: null, saveForLater: false },
    include: {
      model: User,
      as: "user",
      where: { defaultShipToState: shipToState }
    }
  });
  return lineItems;
};

exports.currentBulkUserLineItemsWithUserAndProductsAndQuantity = async (
  shipToState
) => {
  // We need to get all userLineItems where adminOrderId is null and that are in the same location as shipToState
  const lineItems = await UserLineItem.findAll({
    where: {
      adminOrderId: null,
      saveForLater: false,
      quantity: { [Op.gt]: 0 }
    },
    include: [
      {
        model: User,
        as: "user",
        where: { defaultShipToState: shipToState }
      },
      {
        model: Product,
        as: "product"
      }
    ]
  });
  return lineItems;
};

exports.updateUserLineItemsAdminOrderId = async (
  userId,
  productId,
  adminOrderId
) => {
  return await UserLineItem.update(
    { adminOrderId },
    { where: { userId, productId, adminOrderId: null } }
  );
};

// add/update/delete UserLineItem for Current Order from Admin or Current Order pages
exports.upsertUserLineItemForCurrentOrder = async ({
  userId,
  productId,
  quantity
}) => {
  // Find existing line item
  let lineItem = await UserLineItem.findOne({
    where: {
      userId,
      productId,
      adminOrderId: null
    }
  });

  // If quantity is zero, delete the line and finish
  if (quantity === 0) {
    if (lineItem) {
      await lineItem.destroy();
      return { deleted: true };
    }
    return { deleted: false };
  }

  // Create new line item if none exists for the current order
  if (!lineItem) {
    lineItem = await UserLineItem.create({
      userId,
      productId,
      quantity,
      pendingQuantity: null,
      adminOrderId: null
    });
    return { created: true, lineItem };
  }

  // Otherwise update existing
  await lineItem.update({
    quantity,
    pendingQuantity: null // Clear pendingQuantity after saving
  });

  return { updated: true, lineItem };
};
