"use strict";
const express = require("express");
const productController = require("../controllers/productController");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();

// Get all products for the user's product price sheet list
router.get(
  "/user-list",
  authenticateToken,
  productController.getUserProductList
);

module.exports = router;
