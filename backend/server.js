import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './src/models/index.js';
import userRoutes from './src/routes/userRoutes.js';

const { sequelize } = db;

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

//Default Route
app.get('/', (req, res) => {
  res.send('Smart Order Backend is running');
});

// Start server and connect DB
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully.');
        await sequelize.sync(); // Creates tables if they don't exist
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
    console.log(`Server is running on port ${PORT}`);
});