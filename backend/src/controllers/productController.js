"use strict";

const db = require("../models");
const { Product, Ingredient, UserLineItem, User } = db;
const {
  calculateUserDiscount,
  calculateAdminDiscount
} = require("../services/pricingService");
const {
  currentBulkUserLineItemsWithUserAndProductsAndQuantity
} = require("../services/userLineItemService");
const {
  getAlphabeticalProductListOptions
} = require("../services/productService");

exports.getProductDropdownListOptions = async (req, res) => {
  try {
    const productsList = await getAlphabeticalProductListOptions();
    res.status(200).json({ productsList });
  } catch (error) {
    console.error("Error fetching product dropdown list options:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

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

    // Fetch userLineItems for bulk order
    const userLineItems =
      await currentBulkUserLineItemsWithUserAndProductsAndQuantity(shipToState);

    // Preload user discount info for each unique user
    const userDiscountInfo = {};
    for (const uli of userLineItems) {
      if (!userDiscountInfo[uli.userId]) {
        const user = await User.findByPk(uli.userId);
        userDiscountInfo[uli.userId] = await calculateUserDiscount(user);
      }
    }

    // Build adminLineItems grouped by product
    const adminLineItemsMap = {};
    userLineItems.forEach((uli) => {
      const productId = uli.productId;
      if (!adminLineItemsMap[productId]) {
        adminLineItemsMap[productId] = {
          id: productId,
          name: uli.product.name,
          wholesale: Number(uli.product.wholesale),
          retail: Number(uli.product.retail),
          adminQuantity: 0,
          discountPercentage: adminDiscountInfo.selectedDiscountForCurrent,
          userItems: []
        };
      }
      adminLineItemsMap[productId].userItems.push({
        userId: uli.userId,
        name: uli.user.name,
        quantity: uli.quantity
      });

      // update the sum
      adminLineItemsMap[productId].adminQuantity += uli.quantity;
    });

    const adminLineItems = Object.values(adminLineItemsMap).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    res.status(200).json({
      adminShipToState: shipToState,
      adminDiscountInfo,
      userDiscountInfo,
      adminLineItems: adminLineItems
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
