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
 *   - selectedDiscountForCurrent: discount % as float based on totalBottlesForCurrentQuantity
 *   - selectedDiscountForPending: discount % as float  based on totalBottlesForPendingQuantity
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
    selectedDiscountForCurrent
  };
}

function calculateAdminOrderTotals(
  adminLineItems,
  userLineItems,
  shipping = 0,
  tax = 0
) {
  const itemsWithTotals = adminLineItems.map((item) => {
    const adminQuantity = userLineItems
      .filter((u) => u.productId === item.productId)
      .reduce((sum, u) => sum + u.quantity, 0);

    const percentOffToDecimal = parseFloat(item.percentOff) / 100;
    const finalPrice = parseFloat(item.basePrice * (1 - percentOffToDecimal));

    const lineTotal = parseFloat(finalPrice * (adminQuantity ?? 0));
    console.log(adminQuantity);
    return {
      ...item,
      adminQuantity,
      finalPrice,
      lineTotal
    };
  });
  const subtotal = itemsWithTotals.reduce((sum, it) => sum + it.lineTotal, 0);

  const grandTotal = +(subtotal + shipping + tax);

  return { adminLineItemsWithTotals: itemsWithTotals, subtotal, grandTotal };
}

function calculateOrderTotals(lineItems, shipping = 0, tax = 0) {
  console.log(lineItems);
  const itemsWithTotals = lineItems.map((item) => {
    const finalPrice = parseFloat(
      item.basePrice * (1 - (item.percentOff ?? 0))
    );
    const lineTotal = parseFloat(finalPrice * (item.quantity ?? 0));
    return {
      ...item,
      finalPrice,
      lineTotal
    };
  });

  const subtotal = itemsWithTotals.reduce((sum, it) => sum + it.lineTotal, 0);

  const grandTotal = +(subtotal + shipping + tax);

  return { lineItems: itemsWithTotals, subtotal, grandTotal };
}

module.exports = {
  calculateUserDiscount,
  calculateAdminDiscount,
  calculateAdminOrderTotals,
  calculateOrderTotals
};
