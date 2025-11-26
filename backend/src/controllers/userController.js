const db = require("../models/index.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { User } = db;
const { getAlphabeticalUserListOptions } = require("../services/userService");

// Create a new user
exports.createUser = async (req, res) => {
  const {
    name,
    email,
    password,
    defaultShipToState,
    isAdmin,
    pricingType,
    discountType
  } = req.body;
  try {
    // Check if user with the same email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      defaultShipToState,
      password: hashedPassword,
      isAdmin: isAdmin || false,
      pricingType: pricingType || "Retail",
      discountType: discountType || "Individual"
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a user
exports.updateUser = async (req, res) => {
  const userId = req.params.id;
  const requester = req.user;
  const {
    name,
    email,
    password,
    defaultShipToState,
    isAdmin,
    pricingType,
    discountType
  } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Regular users can only update their own profile
    if (!requester.isAdmin && requester.id !== user.id) {
      return res
        .status(403)
        .json({ error: "You can only update your own profile." });
    }

    // Prevent duplicate email
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res
          .status(400)
          .json({ error: "Email is already in use by another account." });
      }
    }

    // Admins can update everything
    // Regular users cannot change isAdmin, pricingType, or discountType
    const updateData = {
      name,
      email,
      defaultShipToState
    };

    if (requester.isAdmin) {
      updateData.isAdmin = isAdmin;
      updateData.pricingType = pricingType;
      updateData.discountType = discountType;
    }

    // Only update password if provided
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await user.update(updateData);

    // if the logged-in user updated their own info, issue a new token
    let newToken = null;
    if (String(requester.id) === String(user.id)) {
      newToken = jwt.sign(
        {
          id: user.id,
          isAdmin: user.isAdmin,
          name: user.name
        },
        process.env.JWT_SECRET,
      );
    }

    res.json({
      user,
      token: newToken // may be null if NOT updating own profile
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  const userId = req.params.id;
  const requester = req.user;

  // Only admins can delete users
  if (!requester.isAdmin) {
    return res.status(403).json({ error: "Only admins can delete users." });
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.destroy();

    // If the admin deleted their own account, clear the token
    const deletedOwnAccount = String(requester.id) === String(user.id);

    res.json({
      message: deletedOwnAccount
        ? "Your account has been deleted."
        : "User deleted.",
      logout: deletedOwnAccount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin, name: user.name },
      process.env.JWT_SECRET,
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        "id",
        "name",
        "email",
        "defaultShipToState",
        "isAdmin",
        "pricingType",
        "discountType"
      ]
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  const userId = req.params.id;
  const requester = req.user;

  try {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] } // never send the hash
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Authorization check
    const isRequesterAdmin = requester?.isAdmin === true;
    const isOwnProfile = String(requester?.id) === String(user.id);

    if (!isRequesterAdmin && !isOwnProfile) {
      return res
        .status(403)
        .json({ error: "You are not authorized to view this user." });
    }

    // Return the user
    res.json(user);
  } catch (error) {
    console.error("getUserById error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update a user's defaultShipToState
exports.updateUserShipToState = async (req, res) => {
  const requester = req.user;
  const { defaultShipToState } = req.body;
  const userId = req.params.id || requester.id; // use param if admin, else current user

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Regular users can only update their own profile
    if (!requester.isAdmin && userId !== requester.id) {
      return res
        .status(403)
        .json({ error: "You can only update your own profile." });
    }

    await user.update({ defaultShipToState });

    res.json({
      user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Return a list of [userId, name, defaultShipToState] for all users
exports.getUserDropdownListOptions = async (req, res) => {
  try {
    const usersList = await getAlphabeticalUserListOptions();
    res.status(200).json({ usersList });
  } catch (error) {
    console.error("Error fetching user dropdown options:", error);
    res.status(500).json({ error: "Server error" });
  }
};
