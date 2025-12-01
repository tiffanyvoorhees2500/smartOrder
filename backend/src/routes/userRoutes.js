"use strict";

const express = require("express");
const userController = require("../controllers/userController");
const pastOrderController = require("../controllers/pastOrderController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const router = express.Router();

// All users - Admins only
router.get("/", authenticateToken, requireAdmin, userController.getAllUsers);

router.get("/dropdown", authenticateToken, requireAdmin, userController.getUserDropdownListOptions);

// Create a new user - Admins only
router.post("/manage-users", authenticateToken, requireAdmin, userController.createUser);

// Login user
router.post("/login", userController.loginUser);

// Update user's defaultShipToState only...
router.put("/update-ship-to-state", authenticateToken, userController.updateUserShipToState);

// Get past order data for currently logged in user
router.get("/past", authenticateToken, pastOrderController.getPastOrdersByUser);

// Update user - Admins or Logged in user only
router.put("/:id", authenticateToken, userController.updateUser);

// Delete user - Admins only
router.delete("/:id", authenticateToken, requireAdmin, userController.deleteUser);

// Get user by ID - Admins or Logged in user only
router.get("/:id", authenticateToken, userController.getUserById);

module.exports = router;
