/**
 * Authentication Middleware
 * Protects routes by verifying JWT tokens
 */

import { verifyToken, extractTokenFromHeader } from '../utils/jwt.js';
import { AuthError, ForbiddenError } from '../utils/errors.js';

/**
 * Verify JWT token and attach user to request
 * Usage: router.get('/protected', authenticate, controller)
 */
export const authenticate = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      throw new AuthError('No authentication token provided');
    }

    // Verify token
    const decoded = verifyToken(token);

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      phone: decoded.phone,
      role: decoded.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Verify user has specific role
 * Usage: router.post('/admin', authenticate, authorize('admin'), controller)
 * @param {...string} roles - Allowed roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError(`Access denied. Required roles: ${roles.join(', ')}`)
      );
    }

    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token
 * Usage: router.get('/public-or-private', optionalAuth, controller)
 */
export const optionalAuth = (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const decoded = verifyToken(token);
      req.user = {
        userId: decoded.userId,
        phone: decoded.phone,
        role: decoded.role,
      };
    }

    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
};

/**
 * Check if user is customer
 */
export const isCustomer = authorize('customer');

/**
 * Check if user is kirana store owner
 */
export const isKirana = authorize('kirana');

/**
 * Check if user is admin
 */
export const isAdmin = authorize('admin');

export default {
  authenticate,
  authorize,
  optionalAuth,
  isCustomer,
  isKirana,
  isAdmin,
};
