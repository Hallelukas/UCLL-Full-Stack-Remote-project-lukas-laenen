import rateLimit from 'express-rate-limit';
import { logger } from './logger';

const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  handler: (req, res, next, options) => {
    logger.warn({
      event: 'RATE_LIMIT_EXCEEDED',
      message: 'Account creation rate limit exceeded',
      ip: req.ip,
      url: req.originalUrl,
      status: 'blocked'
    });

    res.status(429).json({
      status: 'error',
      message: 'Too many accounts created from this IP, try later.'
    });
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  handler: (req, res, next, options) => {
    logger.warn({
      event: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Authentication rate limit exceeded',
      ip: req.ip,
      url: req.originalUrl,
      status: 'blocked'
    });

    res.status(429).json({
      status: 'error',
      message: 'Too many requests, please slow down.'
    });
  }
});

export { createAccountLimiter, authLimiter };