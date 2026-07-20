require('dotenv').config({ path: '../../.env' });
const { getCustomerProjects, getCustomerById } = require('../../shared/db-helper');
const {
  successResponse,
  errorResponse,
  handleCorsPreFlight,
  logError,
  checkMethod
} = require('../../shared/utils');

/**
 * Lambda Handler - Get Customer Projects
 * GET /api/customer/projects
 * Returns projects + customer's oneDriveLink & projectStatusSheetUrl
 */
exports.handler = async (event) => {
  try {
    const methodCheck = checkMethod(event, ['GET']);
    if (methodCheck.isOptions) return handleCorsPreFlight();
    if (!methodCheck.allowed) return errorResponse('Method not allowed', 405);

    const customerId = event.requestContext?.authorizer?.customerId;
    if (!customerId) return errorResponse('Unauthorized - Customer ID not found', 401);

    // Get customer info (has oneDriveLink & projectStatusSheetUrl)
    const customerResult = await getCustomerById(customerId);
    if (!customerResult.success) return errorResponse('Customer not found', 404);

    const customer = customerResult.data;

    // Get projects for this customer
    const result = await getCustomerProjects(customerId);
    if (!result.success) throw new Error('Failed to fetch customer projects');

    return successResponse(
      {
        projects: result.data,
        count: result.data.length,
        customerInfo: {
          oneDriveLink: customer.oneDriveLink || '',
          projectStatusSheetUrl: customer.projectStatusSheetUrl || '',
          companyName: customer.companyName || ''
        }
      },
      'Projects retrieved successfully'
    );

  } catch (error) {
    logError('Customer Projects Handler', error);
    return errorResponse('An error occurred while fetching projects', 500);
  }
};
