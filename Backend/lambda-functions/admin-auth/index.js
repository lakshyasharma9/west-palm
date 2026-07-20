require('dotenv').config({ path: '../../.env' });
const { getAdminByEmail, updateAdminLastLogin } = require('../../shared/db-helper');
const { generateToken, comparePassword } = require('../../shared/auth-helper');
const {
  successResponse,
  errorResponse,
  validationError,
  parseBody,
  validateRequiredFields,
  validateEmail,
  handleCorsPreFlight,
  logError,
  checkMethod
} = require('../../shared/utils');

/**
 * Lambda Handler - Admin Login
 * POST /api/auth/login
 */
exports.handler = async (event) => {
  try {
    // Handle CORS preflight
    const methodCheck = checkMethod(event, ['POST']);
    if (methodCheck.isOptions) {
      return handleCorsPreFlight();
    }
    if (!methodCheck.allowed) {
      return errorResponse('Method not allowed', 405);
    }

    // Parse request body
    const body = parseBody(event);
    if (!body) {
      return errorResponse('Invalid request body');
    }

    // Validate required fields
    const requiredFields = ['email', 'password'];
    const validationErrors = validateRequiredFields(body, requiredFields);

    // Validate email format
    if (body.email && !validateEmail(body.email)) {
      validationErrors.push('Invalid email format');
    }

    if (validationErrors.length > 0) {
      return validationError(validationErrors);
    }

    const { email, password } = body;

    // Get admin user from database
    const admin = await getAdminByEmail(email.toLowerCase());

    if (!admin) {
      return errorResponse('Invalid email or password', 401);
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, admin.password);

    if (!isPasswordValid) {
      return errorResponse('Invalid email or password', 401);
    }

    // Update last login
    await updateAdminLastLogin(email.toLowerCase());

    // Generate JWT token
    const token = generateToken({
      email: admin.email,
      role: 'admin'
    });

    // Return success response with token
    return successResponse(
      {
        token,
        user: {
          email: admin.email,
          lastLogin: admin.lastLogin
        }
      },
      'Login successful'
    );

  } catch (error) {
    logError('Admin Login Handler', error);
    return errorResponse('An error occurred during login', 500);
  }
};
