"use strict";

const { Op } = require("sequelize");
const { AdminOrder, AdminLineItem, Product, User, UserOrder, UserLineItem } = require("../models");

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
    const items = lineItems.map(li => {
      const unit = parseFloat(li.finalPrice ?? li.basePrice ?? 0);
      const qty = li.quantity ?? 0;
      const lineTotal = +(unit * qty).toFixed(2);

      return {
        productName: li.product?.name ?? "Unknown product",
        quantity: qty,
        unitPrice: +unit.toFixed(2),
        lineTotal
      };
    });

    const subtotal = +items.reduce((sum, it) => sum + it.lineTotal, 0).toFixed(2);
    const shippingAmount = +parseFloat(order.shippingAmount ?? 0).toFixed(2);
    const taxAmount = +parseFloat(order.taxAmount ?? 0).toFixed(2);
    const orderDate = order.adminOrder?.orderDate ?? order.createdAt;

    formatted.push({
      userOrderId: order.id,
      orderDate,
      items,
      subtotal,
      shippingAmount,
      taxAmount,
      total: +((subtotal + shippingAmount + taxAmount)).toFixed(2)
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

  const formatted = adminOrders.map(order => {
    // Group AdminLineItems by product
    const productMap = new Map();

    for (const item of order.adminLineItems || []) {
      const productId = item.productId;
      if (!productMap.has(productId)) {
        productMap.set(productId, {
          productName: item.product?.name ?? "Unknown product",
          unitPrice: parseFloat(item.finalPrice ?? item.basePrice ?? 0),
          totalQty: 0,
          total: 0,
          users: []
        });
      }

      const productEntry = productMap.get(productId);
      const qty = item.quantity ?? 0;
      const lineTotal = +(qty * productEntry.unitPrice).toFixed(2);

      productEntry.totalQty += qty;
      productEntry.total += lineTotal;
    }

    // Add user-level breakdown
    for (const userItem of order.userLineItems || []) {
      const productId = userItem.productId;
      const productEntry = productMap.get(productId);
      if (!productEntry) continue; // Skip if not in admin items

      const qty = userItem.quantity ?? 0;
      productEntry.users.push({
        userId: userItem.userId,
        userName: userItem.user?.name ?? "Unknown user",
        quantity: qty
      });
    }

    // Convert map to array and sort products A-Z
    const products = Array.from(productMap.values())
      .map(p => ({...p, total: +p.total.toFixed(2)}))
      .sort((a, b) => a.productName.localeCompare(b.productName));

    const subtotal = products.reduce((sum, p) => sum + p.total, 0);
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
    // coming soon :)
};

