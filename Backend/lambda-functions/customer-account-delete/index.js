require('dotenv').config({ path: '../../.env' });
const { deleteCustomerUser } = require('../../shared/db-helper');
const {
  successResponse,
  errorResponse,
  handleCorsPreFlight,
  logError,
  checkMethod
} = require('../../shared/utils');

/**
 * Lambda Handler - Delete Customer Account (Admin Only)
 * DELETE /api/admin/customers/:id
 */
exports.handler = async (event) => {
  try {
    const methodCheck = checkMethod(event, ['DELETE']);
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

    const result = await deleteCustomerUser(customerId);

    if (!result.success) {
      return errorResponse('Failed to delete customer', 404);
    }

    return successResponse(
      null,
      'Customer deleted successfully'
    );

  } catch (error) {
    logError('Delete Customer Handler', error);
    return errorResponse('An error occurred while deleting customer', 500);
  }
};
