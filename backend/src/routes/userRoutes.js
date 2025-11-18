'use strict';

const express = require('express');
const { getAllUsers, createUser, updateUser, deleteUser, loginUser, getUserById, updateUserShipToState } = require("../controllers/userController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const router = express.Router();

// All users - Admins only
router.get("/", authenticateToken, requireAdmin, getAllUsers);

// Create a new user - Admins only
router.post("/manage-users", authenticateToken, requireAdmin, createUser);

// Update user's defaultShipToState only...
router.put("/update-ship-to-state", authenticateToken, updateUserShipToState);

// Update user - Admins or Logged in user only
router.put("/:id", authenticateToken, updateUser);

// Delete user - Admins only
router.delete("/:id", authenticateToken, requireAdmin, deleteUser);

// Login user
router.post("/login", loginUser);

// Get user by ID - Admins or Logged in user only
router.get('/:id', authenticateToken, getUserById);

// Get current logged-in user
router.get("/me", authenticateToken, (req, res) => {
  // req.user is already set by authenticateToken
  res.json(req.user);
});


module.exports = router;
