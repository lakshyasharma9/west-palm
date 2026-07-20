require('dotenv').config({ path: '../../.env' });
const { updateCustomerUser } = require('../../shared/db-helper');
const { hashPassword } = require('../../shared/auth-helper');
const {
  successResponse,
  errorResponse,
  parseBody,
  validateEmail,
  handleCorsPreFlight,
  logError,
  checkMethod
} = require('../../shared/utils');

/**
 * Lambda Handler - Update Customer Account (Admin Only)
 * PUT /api/admin/customers/:id
 */
exports.handler = async (event) => {
  try {
    const methodCheck = checkMethod(event, ['PUT']);
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

    const customerId = event.pathParameters?.id;
    if (!customerId) {
      return errorResponse('Customer ID is required', 400);
    }

    const body = parseBody(event);
    if (!body) {
      return errorResponse('Invalid request body');
    }

    // Validate email if provided
    if (body.email && !validateEmail(body.email)) {
      return errorResponse('Invalid email format', 400);
    }

    const updateData = { ...body };

    // Hash password if it's being updated
    if (body.password) {
      updateData.password = await hashPassword(body.password);
    }

    // Update customer
    const result = await updateCustomerUser(customerId, updateData);

    if (!result.success) {
      return errorResponse(result.error || 'Failed to update customer', 404);
    }

    // Remove password from response
    const { password: _, ...customerResponse } = result.data;

    return successResponse(
      customerResponse,
      'Customer updated successfully'
    );

  } catch (error) {
    logError('Update Customer Handler', error);
    return errorResponse('An error occurred while updating customer', 500);
  }
};
