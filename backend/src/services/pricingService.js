const { User, UserLineItem } = require("../models");
const {
  DISCOUNT_OPTIONS,
  getDiscountByBottleCount
} = require("../utils/discounts");

/**
 * Calculate total bottles for discount and normal totals
 *
 * @param {Object} user - Sequelize User Instance
 * @returns {Promise<Object>} - Summary of bottle counts and discounts
 *   - totalBottlesForCurrentQuantity: sum used to determine discount
 *   - totalBottlesForPendingQuantity: sum of actual quantities for all but user + sum of pendingQuantities if exists else quantity for user
 *   - selectedDiscountForCurrent: discount tier based on totalBottlesForCurrentQuantity
 *   - selectedDiscountForPending: discount tier based on totalBottlesForPendingQuantity
 */

async function calculateUserDiscount(user) {
  let lineItems;

  if (user.discountType.toLowerCase() === "group") {
    // We need to get all userLineItems where adminOrderId is null and that are in the same location as user
    lineItems = await UserLineItem.findAll({
      where: { adminOrderId: null, saveForLater: false },
      include: {
        model: User,
        as: "user",
        where: { defaultShipToState: user.defaultShipToState }
      }
    });
  } else {
    // Only need the current users line items where adminOrderId is null
    lineItems = await UserLineItem.findAll({
      where: { adminOrderId: null, userId: user.id }
    });
  }

  // Calculate totalBottlesForDiscount
  const totalBottlesForCurrentQuantities = lineItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalBottlesWithPendingQuantities = lineItems.reduce((sum, item) => {
    // For yourself, use pendingQuantity if it exists
    if (item.userId === user.id) {
      return sum + (item.pendingQuantity ?? item.quantity);
    }
    // For everyone else, use quantity
    return sum + item.quantity;
  }, 0);

  const selectedDiscountForCurrent = getDiscountByBottleCount(
    totalBottlesForCurrentQuantities
  ).discount;
  const selectedDiscountForPending = getDiscountByBottleCount(
    totalBottlesWithPendingQuantities
  ).discount;

  return {
    DISCOUNT_OPTIONS,
    totalBottlesForCurrentQuantities,
    totalBottlesWithPendingQuantities,
    selectedDiscountForCurrent,
    selectedDiscountForPending
  };
}

async function calculateAdminDiscount(shipToState) {

  // We need to get all userLineItems where adminOrderId is null and that are in the same location as admin order shipToState
  const lineItems = await UserLineItem.findAll({
    where: { adminOrderId: null, saveForLater: false },
    include: {
      model: User,
      as: "user",
      where: { defaultShipToState: shipToState }
    }
  });

  // Calculate totalBottlesForDiscount
  const totalBottlesForCurrentQuantities = lineItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const selectedDiscountForCurrent = getDiscountByBottleCount(
    totalBottlesForCurrentQuantities
  ).discount;

  return {
    DISCOUNT_OPTIONS,
    totalBottlesForCurrentQuantities,
    selectedDiscountForCurrent,
  };
}

module.exports = { calculateUserDiscount, calculateAdminDiscount };
