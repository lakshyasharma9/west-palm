const crypto = require('crypto');

/**
 * Generate ETag for cache validation
 */
function generateETag(data) {
  const hash = crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
  return `"${hash}"`;
}

/**
 * Standard API response format
 */
function createResponse(statusCode, body, headers = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS'
  };

  return {
    statusCode,
    headers: { ...defaultHeaders, ...headers },
    body: JSON.stringify(body)
  };
}

/**
 * Success response with optional cache headers
 */
function successResponse(data, message = 'Success', statusCode = 200, cacheOptions = null) {
  const headers = {};
  
  // Add cache headers if specified
  if (cacheOptions) {
    if (cacheOptions.public) {
      const maxAge = cacheOptions.maxAge || 300; // Default 5 minutes
      headers['Cache-Control'] = `public, max-age=${maxAge}`;
      headers['ETag'] = generateETag(data);
    } else if (cacheOptions.private) {
      headers['Cache-Control'] = 'private, no-cache';
    }
  }
  
  return createResponse(statusCode, {
    success: true,
    message,
    data
  }, headers);
}

/**
 * Error response
 */
function errorResponse(message, statusCode = 400, error = null) {
  return createResponse(statusCode, {
    success: false,
    message,
    error
  });
}

/**
 * Validation error response
 */
function validationError(errors) {
  return createResponse(400, {
    success: false,
    message: 'Validation failed',
    errors
  });
}

/**
 * Unauthorized response
 */
function unauthorizedResponse(message = 'Unauthorized') {
  return createResponse(401, {
    success: false,
    message
  });
}

/**
 * Not found response
 */
function notFoundResponse(message = 'Resource not found') {
  return createResponse(404, {
    success: false,
    message
  });
}

/**
 * Parse JSON body from event
 */
function parseBody(event) {
  try {
    return typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch (error) {
    return null;
  }
}

/**
 * Validate required fields
 */
function validateRequiredFields(data, requiredFields) {
  const errors = [];
  
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      errors.push(`${field} is required`);
    }
  });

  return errors;
}

/**
 * Validate email format
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize string input
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
}

/**
 * Generate UUID
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Get current ISO timestamp
 */
function getCurrentTimestamp() {
  return new Date().toISOString();
}

/**
 * Handle CORS preflight
 */
function handleCorsPreFlight() {
  return createResponse(200, { message: 'OK' });
}

/**
 * Log error with context
 */
function logError(context, error) {
  console.error(`[${context}] Error:`, {
    message: error.message,
    stack: error.stack,
    timestamp: getCurrentTimestamp()
  });
}

/**
 * Check if request method is allowed
 */
function checkMethod(event, allowedMethods) {
  const method = event.httpMethod || event.requestContext?.http?.method;
  
  if (method === 'OPTIONS') {
    return { allowed: true, isOptions: true };
  }

  if (!allowedMethods.includes(method)) {
    return { allowed: false, isOptions: false };
  }

  return { allowed: true, isOptions: false };
}

module.exports = {
  createResponse,
  successResponse,
  errorResponse,
  validationError,
  unauthorizedResponse,
  notFoundResponse,
  parseBody,
  validateRequiredFields,
  validateEmail,
  sanitizeString,
  generateUUID,
  getCurrentTimestamp,
  handleCorsPreFlight,
  logError,
  checkMethod,
  generateETag
};
