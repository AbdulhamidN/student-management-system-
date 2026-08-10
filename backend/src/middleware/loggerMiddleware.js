/**
 * =====================================================
 * loggerMiddleware.js
 * -----------------------------------------------------
 * Purpose:
 * Log HTTP requests with status code and response time.
 *
 * Uses res.on('finish') to capture status code.
 * =====================================================
 */

const logger = (req, res, next) => {
    const start = Date.now();

    // Log when the response is finished
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    });

    next();
};

module.exports = logger;