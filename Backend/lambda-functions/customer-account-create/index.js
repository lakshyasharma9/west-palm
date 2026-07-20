require('dotenv').config({ path: '../../.env' });
const { createCustomerUser } = require('../../shared/db-helper');
const { hashPassword } = require('../../shared/auth-helper');
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
const { v4: uuidv4 } = require('uuid');

/**
 * Lambda Handler - Create Customer Account (Admin Only)
 * POST /api/admin/customers
 */
exports.handler = async (event) => {
  try {
    const methodCheck = checkMethod(event, ['POST']);
    if (methodCheck.isOptions) {
      return handleCorsPreFlight();
    }
    if (!methodCheck.allowed) {
      return errorResponse('Method not allowed', 405);
    }

    // Verify admin role from JWT
    const role = event.requestContext?.authorizer?.role;
    if (role !== 'admin') {
      return errorResponse('Unauthorized - Admin access required', 403);
    }

    const body = parseBody(event);
    if (!body) {
      return errorResponse('Invalid request body');
    }

    // Validate required fields
    const requiredFields = ['username', 'password', 'email'];
    const validationErrors = validateRequiredFields(body, requiredFields);

    // Validate email format
    if (body.email && !validateEmail(body.email)) {
      validationErrors.push('Invalid email format');
    }

    if (validationErrors.length > 0) {
      return validationError(validationErrors);
    }

    const { username, password, email, companyName, oneDriveLink, projectStatusSheetUrl, projectIds } = body;

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create customer data
    const customerData = {
      customerId: uuidv4(),
      username: username.toLowerCase(),
      password: hashedPassword,
      email: email.toLowerCase(),
      companyName: companyName || '',
      oneDriveLink: oneDriveLink || '',
      projectStatusSheetUrl: projectStatusSheetUrl || '',
      projectIds: projectIds || [],
      role: 'customer',
      createdAt: new Date().toISOString(),
      lastLogin: null
    };

    // Save to database
    const result = await createCustomerUser(customerData);

    if (!result.success) {
      throw new Error('Failed to create customer');
    }

    // Remove password from response
    const { password: _, ...customerResponse } = result.data;

    return successResponse(
      customerResponse,
      'Customer account created successfully',
      201
    );

  } catch (error) {
    logError('Create Customer Handler', error);
    return errorResponse('An error occurred while creating customer', 500);
  }
};
