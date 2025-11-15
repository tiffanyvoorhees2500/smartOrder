const express = require("express");
const router = express.Router();
const controller = require("../controllers/userLineItemController");
const { authenticateToken } = require("../middleware/auth");

// Save or update a user line item for the current order
router.post("/save-line-item", authenticateToken, controller.saveCurrentOrderUserLineItem);

// Update the pending quantity of a user line item for the current order
router.post("/update-pending-quantity", authenticateToken, controller.updatePendingQuantity);

module.exports = router;
