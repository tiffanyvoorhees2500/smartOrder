"use strict";

const db = require("../models");
const { Product, Ingredient, UserLineItem } = db;
const {
  calculateUserDiscount,
  calculateAdminDiscount
} = require("../services/pricingService");
const { currentBulkUserLineItemsWithUserAndProducts } = require("../services/userLineItemService");

exports.getUserProductList = async (req, res) => {
  try {
    const discountInfo = await calculateUserDiscount(req.user);

    const userPricing = req.user.pricingType;
    const userId = req.user.id;
    const currentAdminOrderId = null; // current order has no adminOrderId

    // Fetch products that are not discontinued
    const products = await Product.findAll({
      where: {
        discontinued: false
      },
      attributes: [
        "id",
        "name",
        "retail",
        "wholesale",
        "discontinued",
        "number_in_bottle",
        "original_id"
      ],
      include: [
        {
          model: Ingredient,
          as: "ingredients",
          attributes: ["ingredient", "number_label", "string_label"]
        },
        {
          model: UserLineItem,
          as: "userLineItems",
          where: {
            userId: userId,
            adminOrderId: currentAdminOrderId
          },
          required: false, // include even if no matching line items
          attributes: [
            "quantity",
            "basePrice",
            "percentOff",
            "finalPrice",
            "pendingQuantity",
            "saveForLater"
          ]
        }
      ],
      order: [["name", "ASC"]]
    });

    const formattedProducts = products.map((product) => {
      // Sort ingredients alphabetically
      const sortedIngredients = product.ingredients.sort((a, b) =>
        a.ingredient.localeCompare(b.ingredient)
      );

      const description = sortedIngredients
        .map((i) => `${i.ingredient} [${i.number_label} ${i.string_label}]`)
        .join(", ");

      // Extract UserLineItem details if exists
      const uli = product.userLineItems[0] || {};
      const quantity = uli.pendingQuantity ?? uli.quantity ?? null; // current saved quantity
      const originalQuantity = uli.quantity ?? null; // original quantity
      const dbPendingQuantity = uli.pendingQuantity ?? null; // pending quantity... nulls are allowed

      return {
        id: product.id,
        name: product.name,
        price: Number(
          userPricing === "Retail" ? product.retail : product.wholesale
        ),
        description,
        quantity,
        originalQuantity,
        dbPendingQuantity
      };
    });

    res.status(200).json({
      user: {
        defaultShipToState: req.user.defaultShipToState,
        name: req.user.name
      },
      products: formattedProducts,
      discountInfo
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAdminProductList = async (req, res) => {
  try {
    const shipToState = req.query.shipToState;
    if (!shipToState) {
      return res
        .status(400)
        .json({ message: "shipToState query parameter is required" });
    }

    const adminDiscountInfo = await calculateAdminDiscount(shipToState);
    const adminPricing = "Wholesale"; // Admins always see wholesale pricing

    // Fetch userLineItems for bulk order
    const userLineItems = await currentBulkUserLineItemsWithUserAndProducts(shipToState);

    // calculate discount infor for each user in userLineItems
    const userDiscountInfo = {};
    for (const uli of userLineItems) {
      const user = await db.User.findByPk(uli.userId);
      if (!userDiscountInfo[user.id]) {
        userDiscountInfo[user.id] = await calculateUserDiscount(user);
      }
    }


    res.status(200).json({
      adminShipToState: shipToState,
      adminDiscountInfo,
      userDiscountInfo,
      userLineItems: userLineItems,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
