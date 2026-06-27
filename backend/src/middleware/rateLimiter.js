import rateLimit from 'express-rate-limit';

export const reportRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.REPORTS_PER_HOUR_PER_IP || 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many reports from this network in the last hour. Try again later.' },
});

// Presign tokens are cheap to generate but each one reserves a storage slot.
// Cap at the same limit as reports — there's no reason to generate more
// upload URLs than you're allowed to submit reports.
export const presignRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.REPORTS_PER_HOUR_PER_IP || 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many upload requests from this network. Try again later.' },
});
