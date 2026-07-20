require('dotenv').config({ path: '../../.env' });
const { getAllQueries } = require('../../shared/db-helper');
const { verifyAuth } = require('../../shared/auth-helper');
const {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  handleCorsPreFlight,
  logError,
  checkMethod
} = require('../../shared/utils');

/**
 * Lambda Handler - Get All Queries
 * GET /api/queries?status=pending (optional filter)
 */
exports.handler = async (event) => {
  try {
    // Handle CORS preflight
    const methodCheck = checkMethod(event, ['GET']);
    if (methodCheck.isOptions) {
      return handleCorsPreFlight();
    }
    if (!methodCheck.allowed) {
      return errorResponse('Method not allowed', 405);
    }

    // Verify authentication
    const authResult = verifyAuth(event);
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error);
    }

    // Get status filter from query parameters
    const status = event.queryStringParameters?.status || null;

    // Validate status if provided
    if (status && !['pending', 'resolved'].includes(status)) {
      return errorResponse('Invalid status. Must be "pending" or "resolved"');
    }

    // Get queries from database
    const result = await getAllQueries(status);

    if (!result.success) {
      throw new Error('Failed to fetch queries');
    }

    // Return success response
    return successResponse(
      {
        queries: result.data,
        count: result.data.length,
        filter: status || 'all'
      },
      'Queries retrieved successfully'
    );

  } catch (error) {
    logError('Queries List Handler', error);
    return errorResponse('An error occurred while fetching queries', 500);
  }
};
