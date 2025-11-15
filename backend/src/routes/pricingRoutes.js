'use strict';
const express = require('express');
const pricingController = require('../controllers/pricingController');
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();

// Get all products for the user's product price sheet list
router.get("/discount-data", authenticateToken, pricingController.getDiscountData);

module.exports = router;