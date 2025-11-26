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
