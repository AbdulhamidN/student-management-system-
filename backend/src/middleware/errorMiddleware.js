/**
 * =====================================================
 * errorMiddleware.js
 * -----------------------------------------------------
 * Purpose:
 * Handle application errors globally.
 *
 * IMPORTANT:
 * Error middleware has 4 parameters.
 *
 * err, req, res, next
 *
 * =====================================================
 */


const errorHandler = (err, req, res, next) => {
    console.error('Unhandled application error', {
        name: err.name,
        statusCode: err.statusCode || 500,
        method: req.method,
        path: req.originalUrl,
    });

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.statusCode && err.statusCode < 500
            ? err.message
            : 'Internal server error.',
    });
};



module.exports = errorHandler;