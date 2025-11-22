"use strict";

const db = require("../models");
const { Product } = db;

exports.getProductListOptions = async () => {
  try {
    // Fetch products that are not discontinued
    const productsList = await Product.findAll({
        where: { discontinued: false },
        attributes: ["id", "name"],
        raw: true
    });

    return productsList;
  } catch (error) {
    console.error("Error fetching products options:", error);
    throw error;
  }
};