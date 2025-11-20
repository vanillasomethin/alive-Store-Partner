/**
 * Product Routes
 * Handles advertised products and geolocation queries
 *
 * Note: Store-specific product management routes (POST/PUT/DELETE) are in kirana.js
 */

import express from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import {
  listProducts,
  getNearbyProducts,
  getProduct,
} from '../controllers/productController.js';

const router = express.Router();

/**
 * @route   GET /api/products
 * @desc    List all products with optional filters
 * @access  Public
 * @query   category, brand, kiranaStoreId, minMargin, maxMargin, inStock, isActive, limit, offset
 */
router.get('/', asyncHandler(listProducts));

/**
 * @route   GET /api/products/nearby
 * @desc    Get products near customer location
 * @access  Public
 * @query   lat (required), lng (required), radius (optional, default: 5km), category, brand, inStock
 */
router.get('/nearby', asyncHandler(getNearbyProducts));

/**
 * @route   GET /api/products/:id
 * @desc    Get product details by ID
 * @access  Public
 */
router.get('/:id', asyncHandler(getProduct));

export default router;
