const crypto = require('crypto');

function generateTemporaryPassword() {
  const random = crypto.randomBytes(9).toString('base64url').slice(0, 10);
  return `Sms@${random}9!`;
}

module.exports = { generateTemporaryPassword };
