const express = require("express");
const router = express.Router();
const controller = require("../controllers/userLineItemController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

// Save or update a user line item for the current order
router.post(
  "/save-line-item",
  authenticateToken,
  controller.saveCurrentOrderUserLineItem
);

// Update the pending quantity of a user line item for the current order
router.post(
  "/update-pending-quantity",
  authenticateToken,
  controller.updatePendingQuantity
);

// Save all user line items for the current order
router.post(
  "/save-all",
  authenticateToken,
  controller.saveAll
);

// Add/update a line item from the admin page
router.post(
  "/admin-add-line",
  authenticateToken,
  requireAdmin,
  controller.addUserLineItemFromAdminPage
)

module.exports = router;
