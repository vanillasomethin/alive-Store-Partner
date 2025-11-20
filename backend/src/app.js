/**
 * ALIVE Advertising Backend - Express Application Setup
 * This file configures the Express application with all middleware
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler, notFound, requestLogger } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// ============================================
// MIDDLEWARE SETUP
// ============================================

// CORS - Allow cross-origin requests
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use(requestLogger);
}

// ============================================
// HEALTH CHECK ROUTE
// ============================================

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'ALIVE Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ============================================
// API ROUTES
// ============================================

// API version prefix
const API_PREFIX = '/api';

// Root API route
app.get(API_PREFIX, (req, res) => {
  res.json({
    success: true,
    message: 'ALIVE Advertising API v1.0',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: API_PREFIX,
      auth: `${API_PREFIX}/auth`,
      kirana: `${API_PREFIX}/kirana`,
      products: `${API_PREFIX}/products`,
      // Add more routes as they are created
      // orders: `${API_PREFIX}/orders`,
    },
  });
});

// Import route modules
import authRoutes from './routes/auth.js';
import kiranaRoutes from './routes/kirana.js';
import productRoutes from './routes/products.js';

// Register routes
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/kirana`, kiranaRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);

// TODO: Add more routes as needed
// import orderRoutes from './routes/orders.js';
// app.use(`${API_PREFIX}/orders`, orderRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler - must be after all routes
app.use(notFound);

// Global error handler - must be last
app.use(errorHandler);

export default app;
