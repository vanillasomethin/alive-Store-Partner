/**
 * Custom error classes for ALIVE Advertising Backend
 * Provides consistent error handling across the application
 */

/**
 * Base application error class
 * All custom errors extend from this
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Distinguishes operational errors from programming errors

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 - Validation Error
 * Used for invalid request data, missing fields, etc.
 */
class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

/**
 * 401 - Authentication Error
 * Used when user is not authenticated
 */
class AuthError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
    this.name = 'AuthError';
  }
}

/**
 * 403 - Forbidden Error
 * Used when user is authenticated but doesn't have permission
 */
class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

/**
 * 404 - Not Found Error
 * Used when a resource is not found
 */
class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * 409 - Conflict Error
 * Used when there's a conflict (e.g., duplicate entry)
 */
class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * 500 - Internal Server Error
 * Used for unexpected server errors
 */
class InternalError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500);
    this.name = 'InternalError';
  }
}

/**
 * 503 - Service Unavailable
 * Used when external service is unavailable
 */
class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable') {
    super(message, 503);
    this.name = 'ServiceUnavailableError';
  }
}

export {
  AppError,
  ValidationError,
  AuthError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalError,
  ServiceUnavailableError,
};
