"use strict";

const { Op } = require("sequelize");
const {
  AdminOrder,
  AdminLineItem,
  Product,
  User,
  UserOrder,
  UserLineItem
} = require("../models");

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
      parseFloate(order.shippingAmount ?? 0),
      parseFloate(order.taxAmount ?? 0)
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

exports.getBulkPastOrdersSortedByProduct = async () => {
  const adminOrders = await AdminOrder.findAll({
    include: [
      {
        model: AdminLineItem,
        as: "adminLineItems",
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["name"]
          }
        ]
      },
      {
        model: UserLineItem,
        as: "userLineItems",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name"]
          },
          {
            model: Product,
            as: "product",
            attributes: ["name"]
          }
        ]
      }
    ],
    order: [["orderDate", "DESC"]]
  });

  const formatted = adminOrders.map((order) => {
    // Group AdminLineItems by product
    const productMap = new Map();

    for (const item of order.adminLineItems || []) {
      const productId = item.productId;
      if (!productMap.has(productId)) {
        productMap.set(productId, {
          productId,
          productName: item.product?.name ?? "Unknown product",
          unitPrice: parseFloat(item.finalPrice ?? item.basePrice ?? 0),
          totalQty: 0,
          total: 0,
          users: []
        });
      }
    }

    // Add user-level breakdown
    for (const userItem of order.userLineItems || []) {
      const productId = userItem.productId;
      const productEntry = productMap.get(productId);
      if (!productEntry) continue; // Skip if not in admin items

      productEntry.users.push({
        userId: userItem.userId,
        userName: userItem.user?.name ?? "Unknown user",
        quantity: userItem.quantity ?? 0
      });
    }

    // Calculate lineTotals for each product using calculateOrderTotals function
    // Calculate lineTotals for each product using calculateOrderTotals
    const products = Array.from(productMap.values())
      .map((product) => {
        const { lineItems: itemsWithTotals, subtotal } = calculateOrderTotals(
          product.users.map((u) => ({
            quantity: u.quantity,
            finalPrice: product.unitPrice
          }))
        );

        // Assign lineTotals to each user
        product.users = product.users.map((u, idx) => ({
          ...u,
          lineTotal: itemsWithTotals[idx].lineTotal
        }));

        product.total = subtotal; // total for this product across all users
        return product;
      })
      .sort((a, b) => a.productName.localeCompare(b.productName));

    const subtotal = +products.reduce((sum, p) => sum + p.total, 0).toFixed(2);
    const shippingAmount = +parseFloat(order.shippingAmount ?? 0).toFixed(2);
    const taxAmount = +parseFloat(order.taxAmount ?? 0).toFixed(2);
    const total = +(subtotal + shippingAmount + taxAmount).toFixed(2);

    return {
      adminOrderId: order.id,
      orderDate: order.orderDate,
      subtotal,
      shippingAmount,
      taxAmount,
      total,
      products
    };
  });

  return formatted;
};

exports.getBulkPastOrdersSortedByUser = async () => {
  const adminOrders = await AdminOrder.findAll({
    include: [
      {
        model: AdminLineItem,
        as: "adminLineItems",
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["name"]
          }
        ]
      },
      {
        model: UserLineItem,
        as: "userLineItems",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name"]
          },
          {
            model: Product,
            as: "product",
            attributes: ["name"]
          }
        ]
      },
      {
        model: UserOrder,
        as: "userOrders",
        attributes: ["userId", "shippingAmount", "taxAmount"]
      }
    ],
    order: [["orderDate", "DESC"]]
  });

  const formatted = adminOrders.map((order) => {
    // Group UserLineItem by User
    const userMap = new Map();

    for (const item of order.userLineItems || []) {
      const userId = item.userId;

      if (!userMap.has(userId)) {
        userMap.set(userId, {
          userId,
          userName: item.user.name ?? "Unknown",
          products: [],
          subtotal: 0,
          shippingAmount: 0,
          taxAmount: 0,
          total: 0
        });
      }

      const userEntry = userMap.get(userId);

      userEntry.products.push({
        productId: item.productId,
        productName: item.product?.name ?? "Unknown product",
        quantity: item.quantity ?? 0,
        unitPrice: parseFloate(item.finalPrice ?? item.basePrice ?? 0)
      });
    }

    // For each user, calculate totals using calculateOrderTotals Function
    for (const uo of order.userOrders || []) {
      const entry = userMap.get(uo.userId);
      if (!entry) continue;

      const {
        lineItems: itemsWithTotals,
        subtotal,
        grandTotal
      } = calculateOrderTotals(
        entry.products.map((p) => ({
          quantity: p.quantity,
          finalPrice: p.unitPrice
        })),
        parseFloat(uo.shippingAmount ?? 0),
        parseFloat(uo.taxAmount ?? 0)
      );

      // Update products with lineTotals and totals
      entry.products = entry.products.map((p, idx) => ({
        ...p,
        lineTotal: itemsWithTotals[idx].lineTotal
      }));
      entry.subtotal = subtotal;
      entry.shippingAmount = parseFloat(uo.shippingAmount ?? 0);
      entry.taxAmount = parseFloat(uo.taxAmount ?? 0);
      entry.total = grandTotal;
    }

    // Convert map to array sorted by user name
    const users = Array.from(userMap.values()).sort((a, b) =>
      a.userName.localeCompare(b.userName)
    );

    const overallGrandTotal = +users
      .reduce((sum, user) => sum + user.total, 0)
      .toFixed(2);

    return {
      adminOrderId: order.id,
      orderDate: order.orderDate,
      overallGrandTotal,
      users
    };
  });

  return formatted;
};
