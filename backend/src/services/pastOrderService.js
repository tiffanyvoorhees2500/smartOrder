"use strict";

const { Op } = require("sequelize");
const { calculateOrderTotals } = require("../services/pricingService");
const {
  AdminOrder,
  AdminLineItem,
  Product,
  User,
  UserOrder,
  UserLineItem
} = require("../models");
const { getPastAdminOrdersWithCalculations } = require("./adminOrderService");

exports.getPastOrdersByUser = async (userId) => {
  // Get all past user orders
  const userOrders = await UserOrder.findAll({
    where: {
      userId,
      adminOrderId: { [Op.ne]: null } // only include orders where adminOrderId is not null
    },
    include: [
      {
        model: AdminOrder,
        as: "adminOrder",
        attributes: ["orderDate"]
      }
    ],
    order: [["createdAt", "DESC"]]
  });

  const formatted = [];

  for (const order of userOrders) {
    const lineItems = await UserLineItem.findAll({
      where: {
        userId,
        adminOrderId: order.adminOrderId // match by adminOrderId
      },
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["name"]
        }
      ]
    });

    // Skip orders with 0 line items
    if (!lineItems.length) continue;

    // Format each line item
    const {
      lineItems: itemsWithTotals,
      subtotal,
      grandTotal
    } = calcuateOrderTotals(
      lineItems.map((li) => ({
        productName: li.product?.name ?? "Unknown product",
        quantity: li.quantity,
        finalPrice: li.finalPrice ?? li.basePrice ?? 0
      })),
      parseFloat(order.shippingAmount ?? 0),
      parseFloat(order.taxAmount ?? 0)
    );

    formatted.push({
      userOrderId: order.id,
      orderDate: order.adminOrder?.orderDate ?? order.createdAt,
      items: itemsWithTotals,
      subtotal,
      shippingAmount: parseFloat(order.shippingAmount ?? 0),
      taxAmount: parseFloat(order.taxAmount ?? 0),
      total: grandTotal
    });
  }

  return formatted;
};

exports.getBulkPastOrdersSortedByProduct = async ({
  limit = 10,
  offset = 0
} = {}) => {
  const adminOrders = await getPastAdminOrdersWithCalculations({
    limit,
    offset
  });

  return adminOrders.map((order) => {
    const productMap = new Map();

    // Build product map
    for (const item of order.adminLineItems) {
      console.log(item.adminQuantity);
      console.log(item.lineTotal);
      productMap.set(item.productId, {
        productId: item.productId,
        productName: item.product?.name ?? "Unknown",
        basePrice: parseFloat(item.basePrice),
        percentOff: parseFloat(item.percentOff),
        adminQuantity: item.adminQuantity,
        finalPrice: item.finalPrice,
        total: item.lineTotal,
        users: []
      });
    }

    // Attach user-level quantities to each product
    for (const userItem of order.userLineItems) {
      const productEntry = productMap.get(userItem.productId);
      if (!productEntry) continue;

      productEntry.users.push({
        userId: userItem.userId,
        userName: userItem.user?.name ?? "Unknown",
        quantity: userItem.quantity
      });
    }

    return {
      adminOrderId: order.id,
      orderDate: order.orderDate,
      subtotal: order.subtotal,
      shippingAmount: parseFloat(order.shippingAmount ?? 0),
      taxAmount: parseFloat(order.taxAmount ?? 0),
      total: order.total,
      products: Array.from(productMap.values())
    };
  });
};

exports.getBulkPastOrdersSortedByUser = async ({
  limit = 10,
  offset = 0
} = {}) => {
  const adminOrders = getPastAdminOrdersWithCalculations({ limit, offset });

  return adminOrders.map((order) => {
    const userMap = new Map();

    // Group userLineItems by userId
    for (const item of order.userLineItems) {
      if (!userMap.has(item.userId)) {
        userMap.set(item.userId, {
          userId: item.userId,
          userName: item.user?.name ?? "Unknown",
          products: [],
          subtotal: 0,
          totalShipping: 0,
          totalTax: 0
        });
      }

      const userEntry = userMap.get(item.userId);
      userEntry.products.push({
        productId: item.productId,
        productName: item.product?.name ?? "Unknown",
        quantity: item.quantity,
        basePrice: item.basePrice,
        percentOff: item.percentOff
      });

      // Accumulate shipping and tax per user
      userEntry.totalShipping += item.shippingAmount || 0;
      userEntry.totalTax += item.taxAmount || 0;
    }

    // Calculate totals per user
    for (const userEntry of userMap.values()) {
      const { lineItems, subtotal, grandTotal } = calculateOrderTotals(
        userEntry.products.map((p) => ({
          quantity: p.quantity,
          basePrice: p.basePrice,
          percentOff: p.percentOff
        })),
        userEntry.totalShipping,
        userEntry.totalTax
      );

      userEntry.products = userEntry.products.map((p, idx) => ({
        ...p,
        lineTotal: lineItems[idx].lineTotal,
        finalPrice: lineItems[idx].finalPrice
      }));

      userEntry.subtotal = subtotal;
      userEntry.total = grandTotal;
    }

    return {
      adminOrderId: order.id,
      orderDate: order.orderDate,
      users: Array.from(userMap.values())
    };
  });
};
