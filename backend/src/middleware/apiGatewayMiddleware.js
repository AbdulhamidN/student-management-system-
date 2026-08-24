const crypto = require('crypto');
const { distributedRateLimit } = require('./distributedRateLimit');

const gatewayRateLimit = distributedRateLimit();

function apiGateway(req, res, next) {
  req.requestId = req.get('x-request-id') || crypto.randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  res.setHeader('X-Gateway', 'student-management-api');
  if (!req.user) return next();
  return gatewayRateLimit(req, res, next);
}

module.exports = apiGateway;
