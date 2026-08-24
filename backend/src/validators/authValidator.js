const sanitizeText = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ');
};

const sanitizeEmail = (value) => sanitizeText(value).toLowerCase();

const PASSWORD_MIN_LENGTH = 12;

function validatePassword(password) {
  const errors = [];

  if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters.`);
  }
  if (!/[A-Z]/.test(password)) errors.push('Password must include an uppercase letter.');
  if (!/[a-z]/.test(password)) errors.push('Password must include a lowercase letter.');
  if (!/\d/.test(password)) errors.push('Password must include a number.');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('Password must include a special character.');

  return { isValid: errors.length === 0, errors };
}

function validateRegistration(data = {}) {
  const sanitizedName = sanitizeText(data.name);
  const sanitizedEmail = sanitizeEmail(data.email);
  const sanitizedRole = sanitizeText(data.role || '').toLowerCase();
  const password = typeof data.password === 'string' ? data.password : '';

  const errors = [];

  if (!sanitizedName || sanitizedName.length < 2 || sanitizedName.length > 100) {
    errors.push('Name must be between 2 and 100 characters.');
  }

  if (!sanitizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
    errors.push('A valid email address is required.');
  }

  errors.push(...validatePassword(password).errors);

  if (!['admin', 'teacher', 'student'].includes(sanitizedRole)) {
    errors.push('Role must be one of: admin, teacher, student.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: {
      name: sanitizedName,
      email: sanitizedEmail,
      password,
      role: sanitizedRole,
    },
  };
}

function validateLogin(data = {}) {
  const errors = [];
  const email = sanitizeEmail(data.email || '');
  const password = typeof data.password === 'string' ? data.password : '';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('A valid email is required.');
  }

  if (!password || password.length < 1) {
    errors.push('Password is required.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: {
      email,
      password,
    },
  };
}

module.exports = {
  sanitizeText,
  sanitizeEmail,
  validatePassword,
  validateRegistration,
  validateLogin,
};
