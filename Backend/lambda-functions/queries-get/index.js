require('dotenv').config({ path: '../../.env' });
const { getQueryById } = require('../../shared/db-helper');
const { verifyAuth } = require('../../shared/auth-helper');
const {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
  handleCorsPreFlight,
  logError,
  checkMethod
} = require('../../shared/utils');

/**
 * Lambda Handler - Get Single Query
 * GET /api/queries/{id}
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

    // Get query ID from path parameters
    const queryId = event.pathParameters?.id;

    if (!queryId) {
      return errorResponse('Query ID is required');
    }

    // Get query from database
    const result = await getQueryById(queryId);

    if (!result.success) {
      return notFoundResponse('Query not found');
    }

    // Return success response
    return successResponse(
      result.data,
      'Query retrieved successfully'
    );

  } catch (error) {
    logError('Query Get Handler', error);
    return errorResponse('An error occurred while fetching the query', 500);
  }
};
