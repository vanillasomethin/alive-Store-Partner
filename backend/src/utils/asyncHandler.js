/**
 * AsyncHandler - Wraps async route handlers to catch errors
 *
 * Usage:
 * router.get('/route', asyncHandler(async (req, res) => {
 *   const data = await someAsyncOperation();
 *   res.json({ success: true, data });
 * }));
 *
 * This eliminates the need for try-catch blocks in every route handler
 */

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Alternative implementation using async/await
 */
export const asyncHandlerAlt = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    next(error);
  }
};

export default asyncHandler;
