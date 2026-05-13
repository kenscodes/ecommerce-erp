import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './database';
import userRoutes from './routes/users';
import inventoryRoutes from './routes/inventory';
import orderRoutes from './routes/orders';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initializeDatabase().then(() => {
  console.log('Database initialized');
}).catch(err => {
  console.error('Database initialization error:', err);
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);

// Basic route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ERP Backend is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`ERP Backend running on http://localhost:${PORT}`);
});
