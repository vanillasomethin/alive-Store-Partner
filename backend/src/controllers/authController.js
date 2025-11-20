/**
 * Authentication Controller
 * Handles signup, login, OTP verification, and user info
 */

import { sendOTP, verifyOTP } from '../services/otp.js';
import { generateToken } from '../utils/jwt.js';
import { ValidationError, AuthError, ConflictError, NotFoundError } from '../utils/errors.js';

// TEMPORARY: In-memory user storage (replace with Prisma once DB is ready)
// Structure: { phone: { id, phone, name, role, createdAt } }
const userStore = new Map();

/**
 * Helper: Validate phone number format
 */
const validatePhone = (phone) => {
  if (!phone) {
    throw new ValidationError('Phone number is required');
  }

  // Indian phone number: 10 digits
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    throw new ValidationError('Invalid phone number. Must be 10 digits starting with 6-9');
  }
};

/**
 * Helper: Get or create user ID
 */
const generateUserId = () => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Signup - Register new customer and send OTP
 * POST /api/auth/signup
 * Body: { phone, name }
 */
export const signup = async (req, res) => {
  const { phone, name } = req.body;

  // Validate input
  validatePhone(phone);

  if (!name || name.trim().length < 2) {
    throw new ValidationError('Name is required (minimum 2 characters)');
  }

  // Check if user already exists
  if (userStore.has(phone)) {
    throw new ConflictError('Phone number already registered. Please login instead.');
  }

  // TODO: Replace with Prisma
  // const existingUser = await prisma.customer.findUnique({
  //   where: { phone }
  // });
  // if (existingUser) {
  //   throw new ConflictError('Phone number already registered');
  // }

  // Send OTP
  const otpResult = await sendOTP(phone);

  // Store user data temporarily (will be persisted after OTP verification)
  userStore.set(phone, {
    id: generateUserId(),
    phone,
    name: name.trim(),
    role: 'customer',
    isVerified: false,
    createdAt: new Date().toISOString(),
  });

  res.status(200).json({
    success: true,
    message: 'OTP sent successfully',
    data: {
      phone,
      ...(process.env.NODE_ENV === 'development' && { otp: otpResult.otp }),
    },
  });
};

/**
 * Login - Send OTP to existing user
 * POST /api/auth/login
 * Body: { phone }
 */
export const login = async (req, res) => {
  const { phone } = req.body;

  // Validate input
  validatePhone(phone);

  // Check if user exists
  const user = userStore.get(phone);
  if (!user) {
    throw new NotFoundError('Phone number not registered. Please signup first.');
  }

  // TODO: Replace with Prisma
  // const user = await prisma.customer.findUnique({
  //   where: { phone }
  // });
  // if (!user) {
  //   throw new NotFoundError('Phone number not registered');
  // }

  // Send OTP
  const otpResult = await sendOTP(phone);

  res.status(200).json({
    success: true,
    message: 'OTP sent successfully',
    data: {
      phone,
      ...(process.env.NODE_ENV === 'development' && { otp: otpResult.otp }),
    },
  });
};

/**
 * Verify OTP - Verify OTP and return JWT token
 * POST /api/auth/verify-otp
 * Body: { phone, otp }
 */
export const verifyOTPAndLogin = async (req, res) => {
  const { phone, otp } = req.body;

  // Validate input
  validatePhone(phone);

  if (!otp || otp.length !== 6) {
    throw new ValidationError('Invalid OTP format. Must be 6 digits.');
  }

  // Verify OTP
  await verifyOTP(phone, otp);

  // Get user
  const user = userStore.get(phone);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Mark user as verified
  user.isVerified = true;

  // TODO: Replace with Prisma
  // const user = await prisma.customer.findUnique({
  //   where: { phone }
  // });
  // if (!user) {
  //   throw new NotFoundError('User not found');
  // }

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    phone: user.phone,
    role: user.role,
  });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
    },
  });
};

/**
 * Get current user info (protected route)
 * GET /api/auth/me
 * Headers: Authorization: Bearer <token>
 */
export const getCurrentUser = async (req, res) => {
  // User is attached to req by authenticate middleware
  const { userId, phone } = req.user;

  // Get user from store
  const user = userStore.get(phone);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // TODO: Replace with Prisma
  // const user = await prisma.customer.findUnique({
  //   where: { id: userId }
  // });
  // if (!user) {
  //   throw new NotFoundError('User not found');
  // }

  res.status(200).json({
    success: true,
    data: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
};

/**
 * Logout (optional - mainly client-side for JWT)
 * POST /api/auth/logout
 * Headers: Authorization: Bearer <token>
 *
 * Note: With JWT, logout is primarily handled client-side by removing the token.
 * This endpoint is here for consistency and can be used for logging/analytics.
 */
export const logout = async (req, res) => {
  // For JWT, we don't maintain server-side sessions
  // Client should remove the token

  // You could:
  // 1. Add token to blacklist (requires Redis)
  // 2. Log the logout event
  // 3. Clear any server-side session data

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
};

export default {
  signup,
  login,
  verifyOTPAndLogin,
  getCurrentUser,
  logout,
};
