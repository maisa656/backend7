const { rateLimit } = require('express-rate-limit');

const createRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many creation requests. Please try again later.' }
});

module.exports = createRateLimiter;
