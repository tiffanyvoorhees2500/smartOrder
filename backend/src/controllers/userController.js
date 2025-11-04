import { User } from '../models/index.js';
import bcrypt from 'bcryptjs';

// Create a new user
export const createUser = async (req, res) => {
  const { name, email, password } = req.body;
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

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        defaultShipToState: user.defaultShipToState,
        pricingType: user.pricingType,
        groupType: user.groupType,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
