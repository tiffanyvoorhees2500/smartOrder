"use strict";
const express = require("express");
const productController = require("../controllers/productController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const router = express.Router();

router.get(
  "/dropdown",
  authenticateToken,
  productController.getProductDropdownListOptions
)

// Get all products for the user's product price sheet list
router.get(
  "/user-list",
  authenticateToken,
  productController.getUserProductList
);

router.get(
  "/admin-list",
  authenticateToken,
  requireAdmin,
  productController.getAdminProductList
);

module.exports = router;
