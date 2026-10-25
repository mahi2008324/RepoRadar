export function errorHandler(err, req, res, next) {
  console.error('[API Error]:', err);

  const status = err.statusCode || err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(status).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
    ...(isProduction ? {} : { stack: err.stack })
  });
}

export default errorHandler;
