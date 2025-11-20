/**
 * Authentication Routes
 * Handles user signup, login, OTP verification, and user info
 */

import express from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';
import {
  signup,
  login,
  verifyOTPAndLogin,
  getCurrentUser,
  logout,
} from '../controllers/authController.js';

const router = express.Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Register new user and send OTP
 * @access  Public
 * @body    { phone: string, name: string }
 */
router.post('/signup', asyncHandler(signup));

/**
 * @route   POST /api/auth/login
 * @desc    Send OTP to existing user
 * @access  Public
 * @body    { phone: string }
 */
router.post('/login', asyncHandler(login));

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and return JWT token
 * @access  Public
 * @body    { phone: string, otp: string }
 */
router.post('/verify-otp', asyncHandler(verifyOTPAndLogin));

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Protected (requires authentication)
 * @headers Authorization: Bearer <token>
 */
router.get('/me', authenticate, asyncHandler(getCurrentUser));

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Protected (requires authentication)
 * @headers Authorization: Bearer <token>
 */
router.post('/logout', authenticate, asyncHandler(logout));

export default router;
