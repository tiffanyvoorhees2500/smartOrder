"use strict";

const express = require("express");
const router = express.Router();
const finalizeController = require("../controllers/finalizeController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

router.post(
  "/finalize-order",
  authenticateToken,
  requireAdmin,
  finalizeController.finalizeOrder
);

module.exports = router;
