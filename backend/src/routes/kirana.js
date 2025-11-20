/**
 * Kirana Store Routes
 * Handles store management, analytics, and listing
 */

import express from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { authenticate, isKirana } from '../middleware/auth.js';
import {
  createStore,
  getStore,
  updateStore,
  getStoreAnalytics,
  getNearbyStores,
  listStores,
} from '../controllers/kiranaController.js';
import {
  addProductToStore,
  updateProduct,
  removeProduct,
} from '../controllers/productController.js';

const router = express.Router();

/**
 * @route   GET /api/kirana
 * @desc    List all stores with optional filters
 * @access  Public
 * @query   city, state, storeType, isActive, isVerified, limit, offset
 */
router.get('/', asyncHandler(listStores));

/**
 * @route   GET /api/kirana/nearby
 * @desc    Get nearby stores based on location
 * @access  Public
 * @query   lat (required), lng (required), radius (optional, default: 5km)
 */
router.get('/nearby', asyncHandler(getNearbyStores));

/**
 * @route   POST /api/kirana
 * @desc    Create new Kirana store
 * @access  Public (will be protected with isKirana in production)
 * @body    { name, ownerName, ownerPhone, email?, address, city, state, pincode, latitude, longitude, gstin?, storeType? }
 */
router.post('/', asyncHandler(createStore));

/**
 * @route   GET /api/kirana/:id
 * @desc    Get store details by ID
 * @access  Public
 */
router.get('/:id', asyncHandler(getStore));

/**
 * @route   PUT /api/kirana/:id
 * @desc    Update store information
 * @access  Protected (store owner only)
 * @body    Partial store data
 */
router.put('/:id', asyncHandler(updateStore));
// In production, add: authenticate, isKirana
// router.put('/:id', authenticate, isKirana, asyncHandler(updateStore));

/**
 * @route   GET /api/kirana/:id/analytics
 * @desc    Get store analytics and statistics
 * @access  Protected (store owner only)
 */
router.get('/:id/analytics', asyncHandler(getStoreAnalytics));
// In production, add: authenticate, isKirana
// router.get('/:id/analytics', authenticate, isKirana, asyncHandler(getStoreAnalytics));

// ============================================
// PRODUCT MANAGEMENT ROUTES
// ============================================

/**
 * @route   POST /api/kirana/:id/products
 * @desc    Add product to Kirana store
 * @access  Protected (store owner only)
 * @body    { name, brand, category, description?, imageUrl, mrp, discountedPrice, discountPercent?, stockQuantity?, commissionType?, commissionValue? }
 */
router.post('/:id/products', asyncHandler(addProductToStore));
// In production, add: authenticate, isKirana
// router.post('/:id/products', authenticate, isKirana, asyncHandler(addProductToStore));

/**
 * @route   PUT /api/kirana/:id/products/:pid
 * @desc    Update product (stock, price, etc.)
 * @access  Protected (store owner only)
 * @body    Partial product data
 */
router.put('/:id/products/:pid', asyncHandler(updateProduct));
// In production, add: authenticate, isKirana
// router.put('/:id/products/:pid', authenticate, isKirana, asyncHandler(updateProduct));

/**
 * @route   DELETE /api/kirana/:id/products/:pid
 * @desc    Remove product from store
 * @access  Protected (store owner only)
 */
router.delete('/:id/products/:pid', asyncHandler(removeProduct));
// In production, add: authenticate, isKirana
// router.delete('/:id/products/:pid', authenticate, isKirana, asyncHandler(removeProduct));

export default router;
