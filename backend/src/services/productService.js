"use strict";

const db = require("../models");
const { Product } = db;

exports.getAlphabeticalProductListOptions = async () => {
  try {
    // Fetch products that are not discontinued
    const productsList = await Product.findAll({
      where: { discontinued: false },
      attributes: ["id", "name"],
      order: [["name", "ASC"]], // Alphabetical order
      raw: true
    });

    return productsList;
  } catch (error) {
    console.error("Error fetching products options:", error);
    throw error;
  }
};
