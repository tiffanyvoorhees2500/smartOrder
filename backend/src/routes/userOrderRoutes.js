const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth")
const userOrderController = require("../controllers/userOrderController");

router.get("/", authenticateToken, userOrderController.getPastOrdersForUser);

module.exports = router;