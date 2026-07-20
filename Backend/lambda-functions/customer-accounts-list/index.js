require('dotenv').config({ path: '../../.env' });
const { getAllCustomers } = require('../../shared/db-helper');
const {
  successResponse,
  errorResponse,
  handleCorsPreFlight,
  logError,
  checkMethod
} = require('../../shared/utils');

/**
 * Lambda Handler - Get All Customers (Admin Only)
 * GET /api/admin/customers
 */
exports.handler = async (event) => {
  try {
    const methodCheck = checkMethod(event, ['GET']);
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

    const result = await getAllCustomers();

    if (!result.success) {
      throw new Error('Failed to fetch customers');
    }

    // Remove passwords from response
    const customersWithoutPasswords = result.data.map(customer => {
      const { password, ...customerData } = customer;
      return customerData;
    });

    return successResponse(
      {
        customers: customersWithoutPasswords,
        count: customersWithoutPasswords.length
      },
      'Customers retrieved successfully'
    );

  } catch (error) {
    logError('List Customers Handler', error);
    return errorResponse('An error occurred while fetching customers', 500);
  }
};
