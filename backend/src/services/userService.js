"use strict";

const db = require("../models");
const { User } = db;

exports.getAlphabeticalUserListOptions = async () => {
  try {
    const usersList = await User.findAll({
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
      raw: true
    });

    return usersList;
  } catch (error) {
    console.error("Error fetching user dropdown options:", error);
    throw error;
  }
};

exports.getUserBasePrice = async (userId, productId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");
    const pricingType = user.pricingType.toLowerCase(); // e.g., 'retail' or 'wholesale'

    const basePrice = await db.Product.findByPk(productId).then((product) => {
      if (!product) throw new Error("Product not found");
      return product[pricingType]; // Access price based on user's pricing type
    });

    return basePrice;
  } catch (error) {
    console.error("Error fetching user base price:", error);
    throw error;
  }
};
