require('dotenv').config({ path: '../../.env' });
const { getCustomerByUsername, updateCustomerLastLogin } = require('../../shared/db-helper');
const { generateToken, comparePassword } = require('../../shared/auth-helper');
const {
  successResponse,
  errorResponse,
  validationError,
  parseBody,
  validateRequiredFields,
  handleCorsPreFlight,
  logError,
  checkMethod
} = require('../../shared/utils');

/**
 * Lambda Handler - Customer Login
 * POST /api/customer/login
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
    const requiredFields = ['username', 'password'];
    const validationErrors = validateRequiredFields(body, requiredFields);

    if (validationErrors.length > 0) {
      return validationError(validationErrors);
    }

    const { username, password } = body;

    // Get customer user from database
    const customer = await getCustomerByUsername(username.toLowerCase());

    if (!customer) {
      return errorResponse('Invalid username or password', 401);
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, customer.password);

    if (!isPasswordValid) {
      return errorResponse('Invalid username or password', 401);
    }

    // Update last login
    await updateCustomerLastLogin(customer.customerId);

    // Generate JWT token with customer role
    const token = generateToken({
      customerId: customer.customerId,
      username: customer.username,
      role: 'customer'
    });

    // Return success response with token
    return successResponse(
      {
        token,
        user: {
          customerId: customer.customerId,
          username: customer.username,
          email: customer.email,
          companyName: customer.companyName,
          lastLogin: customer.lastLogin
        }
      },
      'Login successful'
    );

  } catch (error) {
    logError('Customer Login Handler', error);
    return errorResponse('An error occurred during login', 500);
  }
};
