const db = require('../models/index.js');
const bcrypt =require('bcryptjs');
const jwt = require('jsonwebtoken');

const { User } = db;

// Create a new user
exports.createUser = async (req, res) => {
  const { name, email, password, defaultShipToState } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      defaultShipToState,
      password: hashedPassword,
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
  const { name, email, password, defaultShipToState, isAdmin, pricingType, discountType } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Regular users can only update their own profile
    if (!requester.isAdmin && requester.id !== user.id) {
      return res.status(403).json({ error: "You can only update your own profile." });
    }

    // Admins can update everything
    // Regular users cannot change isAdmin, pricingType, or discountType
    const updateData = {};

    if (requester.isAdmin) {
      updateData.name = name;
      updateData.email = email;
      updateData.defaultShipToState = defaultShipToState;
      updateData.isAdmin = isAdmin;
      updateData.pricingType = pricingType;
      updateData.discountType = discountType;
    } else {
      updateData.name = name;
      updateData.email = email;
      updateData.defaultShipToState = defaultShipToState;
    }

    // Only update password if provided
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await user.update(updateData);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.destroy();
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token });
    // res.json({
    //   message: 'Login successful',
    //   user: {
    //     id: user._id,
    //     name: user.name,
    //     email: user.email,
    //     defaultShipToState: user.defaultShipToState,
    //     pricingType: user.pricingType,
    //     groupType: user.groupType,
    //   },
    //   token,
    // });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'defaultShipToState', 'isAdmin', 'pricingType', 'discountType']
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
      attributes: { exclude: ['password'] },   // never send the hash
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Authorization check
    const isRequesterAdmin = requester?.isAdmin === true;
    const isOwnProfile = String(requester?.id) === String(user.id);

    if (!isRequesterAdmin && !isOwnProfile) {
      return res.status(403).json({ error: 'You are not authorized to view this user.' });
    }

    // Return the user
    res.json(user);
  } catch (error) {
    console.error('getUserById error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
