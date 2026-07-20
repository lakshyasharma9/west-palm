require('dotenv').config({ path: '../../.env' });
const { deleteQuery } = require('../../shared/db-helper');
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
 * Lambda Handler - Delete Query
 * DELETE /api/queries/{id}
 */
exports.handler = async (event) => {
  try {
    // Handle CORS preflight
    const methodCheck = checkMethod(event, ['DELETE']);
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

    // Delete query from database
    const result = await deleteQuery(queryId);

    if (!result.success) {
      return errorResponse('Failed to delete query');
    }

    // Return success response
    return successResponse(
      { id: queryId },
      'Query deleted successfully'
    );

  } catch (error) {
    logError('Query Delete Handler', error);
    return errorResponse('An error occurred while deleting the query', 500);
  }
};
