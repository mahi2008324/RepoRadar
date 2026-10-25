/**
 * Express rate limiting configurations
 */
import rateLimit from 'express-rate-limit';

// General API limiter: 300 requests per 15 minutes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter limiter for expensive repository analysis operations: 30 analyses per 15 minutes
export const analysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Analysis request limit reached. Please wait a few minutes before analyzing another repository.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
