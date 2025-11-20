/**
 * Global error handling middleware for ALIVE Advertising Backend
 * Catches all errors and sends standardized responses
 */

import { AppError } from '../utils/errors.js';

/**
 * Formats Prisma errors into user-friendly messages
 */
const handlePrismaError = (error) => {
  let message = 'Database operation failed';
  let statusCode = 500;

  if (error.code === 'P2002') {
    // Unique constraint violation
    const field = error.meta?.target?.[0] || 'field';
    message = `${field} already exists`;
    statusCode = 409;
  } else if (error.code === 'P2025') {
    // Record not found
    message = 'Record not found';
    statusCode = 404;
  } else if (error.code === 'P2003') {
    // Foreign key constraint failed
    message = 'Related record not found';
    statusCode = 400;
  }

  return { message, statusCode };
};

/**
 * Main error handler middleware
 * Must be registered AFTER all routes in app.js
 */
export const errorHandler = (err, req, res, next) => {
  // Default error values
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging (in production, use a proper logger)
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = handlePrismaError(err);
    error.message = prismaError.message;
    error.statusCode = prismaError.statusCode;
  }

  // Handle Prisma validation errors
  if (err.name === 'PrismaClientValidationError') {
    error.message = 'Invalid data provided';
    error.statusCode = 400;
  }

  // Handle JSON parse errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error.message = 'Invalid JSON';
    error.statusCode = 400;
  }

  // Get status code and message
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err,
      }),
    },
  });
};

/**
 * 404 handler for undefined routes
 * Place this BEFORE the error handler
 */
export const notFound = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

/**
 * Request logger middleware (optional but useful)
 */
export const requestLogger = (req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    query: req.query,
    body: req.method !== 'GET' ? req.body : undefined,
    ip: req.ip,
  });
  next();
};
