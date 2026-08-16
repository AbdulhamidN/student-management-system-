const { sanitizeText } = require('../validators/authValidator');

function validateAuthRequest(requiredFields = []) {
  return (req, res, next) => {
    const missing = requiredFields.filter((field) => {
      const value = req.body[field];
      return value === undefined || value === null || String(value).trim() === '';
    });

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${missing.join(', ')} is required.`,
      });
    }

    for (const field of requiredFields) {
      if (typeof req.body[field] === 'string') {
        req.body[field] = sanitizeText(req.body[field]);
      }
    }

    return next();
  };
}

module.exports = {
  validateAuthRequest,
};
