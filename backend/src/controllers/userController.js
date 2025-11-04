import { User } from '../models/index.js';
import bcrypt from 'bcryptjs';

// Create a new user
export const createUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ name, email, defaultShipToState, password: hashedPassword });
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
