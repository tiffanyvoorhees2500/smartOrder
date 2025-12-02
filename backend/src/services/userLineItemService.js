"use strict";

const db = require("../models");
const { UserLineItem, User, Product } = db;
const { Op } = require("sequelize");
const { getUserBasePrice } = require("./userService");
const { calculateUserDiscount } = require("./pricingService");

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

exports.bulkFinalizeCurrentOrders = async (
  { userLineItemsWithPricing, adminOrderId },
  transaction
) => {
  if (!userLineItemsWithPricing || userLineItemsWithPricing.length === 0)
    return;

  const basePriceCases = [];
  const percentOffCases = [];
  const finalPriceCases = [];
  const whereParts = [];

  // Build CASE statements and WHERE clauses safely
  const baseReplacements = [];
  const percentReplacements = [];
  const finalReplacements = [];
  const whereReplacements = [];

  for (const item of userLineItemsWithPricing) {
    // basePrice CASE clause
    basePriceCases.push(`WHEN "userId" = ?::uuid AND "productId" = ? THEN ?`);
    baseReplacements.push(item.userId, item.productId, item.basePrice);

    // percentOff CASE clause
    percentOffCases.push(`WHEN "userId" = ?::uuid AND "productId" = ? THEN ?`);
    percentReplacements.push(item.userId, item.productId, item.percentOff);

    // finalPrice CASE clause
    finalPriceCases.push(`WHEN "userId" = ?::uuid AND "productId" = ? THEN ?`);
    finalReplacements.push(item.userId, item.productId, item.finalPrice);

    // WHERE clause
    whereParts.push(
      `("userId" = ?::uuid AND "productId" = ? AND "adminOrderId" IS NULL)`
    );
    whereReplacements.push(item.userId, item.productId);
  }

  // Now combine them IN ORDER
  const replacements = [
    adminOrderId,
    ...baseReplacements,
    ...percentReplacements,
    ...finalReplacements,
    ...whereReplacements
  ];

  const updateSQL = `
    UPDATE "UserLineItems"
    SET
      "adminOrderId" = ?,
      "basePrice" = CASE
        ${basePriceCases.join(" ")}
      END,
      "percentOff" = CASE
        ${percentOffCases.join(" ")}
      END,
      "finalPrice" = CASE
        ${finalPriceCases.join(" ")}
      END,
      "pendingQuantity" = NULL
    WHERE ${whereParts.join(" OR ")};
  `;

  return await db.sequelize.query(updateSQL, {
    replacements,
    transaction
  });
};

exports.extractUserLineItemsFromAdminLineItems = (adminLineItems) => {
  const extractedItems = [];
  for (const adminItem of adminLineItems) {
    for (const item of adminItem.userItems) {
      extractedItems.push({
        userId: item.userId.toString(), // UUID as string
        productId: Number(adminItem.id), // productId as integer
        quantity: item.quantity // include quantity for future calculations
      });
    }
  }
  return extractedItems;
};

exports.attachPricingToUserLineItems = async (
  extractedUserLineItems,
  selectedDiscount
) => {
  // Precompute pricing for all items in parallel
  const pricedItems = await Promise.all(
    extractedUserLineItems.map(async (item) => {
      const basePrice = Number(
        await getUserBasePrice(item.userId, item.productId)
      );
      // If selectedDiscount is not null/undefined, use it; otherwise calculate
      const percentOff =
        selectedDiscount != null
          ? Number(selectedDiscount)
          : Number(
              (await calculateUserDiscount(await User.findByPk(item.userId)))
                .selectedDiscountForCurrent
            );
      const finalPrice = Number(basePrice * (1 - percentOff));
      return { ...item, basePrice, percentOff, finalPrice };
    })
  );
  return pricedItems;
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
