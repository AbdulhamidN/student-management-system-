const CircuitBreaker = require('opossum');

function isTransientError(error) {
  return Boolean(error?.transient || ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'EAI_AGAIN'].includes(error?.code));
}

async function retryTransient(operation, { retries = 3, baseDelayMs = 100 } = {}) {
  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (error) {
      if (!isTransientError(error) || attempt >= retries) throw error;
      const delay = baseDelayMs * (2 ** attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempt += 1;
    }
  }
}

function createCircuitBreaker(operation, options = {}) {
  return new CircuitBreaker(operation, {
    timeout: options.timeout || 3000,
    errorThresholdPercentage: options.errorThresholdPercentage || 50,
    resetTimeout: options.resetTimeout || 10000,
    ...options,
  });
}

module.exports = { isTransientError, retryTransient, createCircuitBreaker };
