"use strict";

const express = require("express");
const router = express.Router();
const finalizeController = require("../controllers/finalizeController");
const pastOrderController = require("../controllers/pastOrderController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

router.post(
  "/finalize-order",
  authenticateToken,
  requireAdmin,
  finalizeController.finalizeOrder
);

router.get("/past", authenticateToken, requireAdmin, pastOrderController.getBulkPastOrdersSortedByProduct);

router.get("/past", authenticateToken, requireAdmin, pastOrderController.getBulkPastOrdersSortedByUser);

module.exports = router;
