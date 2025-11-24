"use strict"

const { Op } = require("sequelize");
const { UserOrder, UserLineItem, Product, AdminOrder } = require("../models");

exports.getPastOrdersForUser = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all past user orders
        const userOrders = await UserOrder.findAll({
            where: {
                userId,
                adminOrderId: { [Op.ne]: null } // only include orders wher adminOrderId is not null
            },
            include: [
                {
                    model: AdminOrder,
                    as: "adminOrder",
                    attributes: ["orderDate"]
                },
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

    res.json(formatted);
  } catch (error) {
    console.error("getPastOrdersForUser error:", error);
    res.status(500).json({ message: "Failed to get past orders" });
  }
};