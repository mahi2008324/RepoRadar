/**
 * Centralized production error handling middleware
 */
export function errorHandler(err, req, res, next) {
  console.error('[API Error]:', err);

  const status = err.statusCode || err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(status).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
    // Never expose stack trace or database internals in production
    ...(isProduction ? {} : { stack: err.stack })
  });
}
