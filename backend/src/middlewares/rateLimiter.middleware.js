import rateLimit from 'express-rate-limit';

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

export default { apiLimiter, analysisLimiter };
