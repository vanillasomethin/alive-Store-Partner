/**
 * JWT Token Utilities
 * Handles token generation and verification for authentication
 */

import jwt from 'jsonwebtoken';
import { AuthError } from './errors.js';

/**
 * Get JWT secret from environment
 * Throws error if not configured
 */
const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured in environment variables');
  }
  return secret;
};

/**
 * Generate JWT token for user
 * @param {Object} payload - User data to encode in token
 * @param {string} payload.userId - User ID
 * @param {string} payload.phone - User phone number
 * @param {string} payload.role - User role (customer, kirana)
 * @param {string} [expiresIn='24h'] - Token expiry time
 * @returns {string} JWT token
 */
export const generateToken = (payload, expiresIn = '24h') => {
  const secret = getSecret();

  const tokenPayload = {
    userId: payload.userId,
    phone: payload.phone,
    role: payload.role || 'customer',
  };

  return jwt.sign(tokenPayload, secret, {
    expiresIn,
    issuer: 'alive-api',
  });
};

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {AuthError} If token is invalid or expired
 */
export const verifyToken = (token) => {
  const secret = getSecret();

  try {
    const decoded = jwt.verify(token, secret, {
      issuer: 'alive-api',
    });
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AuthError('Token has expired. Please login again.');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new AuthError('Invalid token. Please login again.');
    }
    throw new AuthError('Token verification failed');
  }
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Extracted token or null
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    return null;
  }

  // Expected format: "Bearer <token>"
  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

/**
 * Generate refresh token (longer expiry)
 * @param {Object} payload - User data
 * @returns {string} Refresh token
 */
export const generateRefreshToken = (payload) => {
  return generateToken(payload, '7d'); // 7 days
};

export default {
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  generateRefreshToken,
};
