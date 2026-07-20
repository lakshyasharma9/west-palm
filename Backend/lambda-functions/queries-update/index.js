require('dotenv').config({ path: '../../.env' });
const { updateQueryStatus } = require('../../shared/db-helper');
const { verifyAuth } = require('../../shared/auth-helper');
const {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  validationError,
  parseBody,
  handleCorsPreFlight,
  logError,
  checkMethod
} = require('../../shared/utils');

/**
 * Lambda Handler - Update Query Status
 * PATCH /api/queries/{id}
 */
exports.handler = async (event) => {
  try {
    // Handle CORS preflight
    const methodCheck = checkMethod(event, ['PATCH']);
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

    // Parse request body
    const body = parseBody(event);
    if (!body) {
      return errorResponse('Invalid request body');
    }

    // Validate status
    const { status } = body;

    if (!status) {
      return validationError(['Status is required']);
    }

    if (!['pending', 'resolved'].includes(status)) {
      return validationError(['Status must be "pending" or "resolved"']);
    }

    // Update query status in database
    const result = await updateQueryStatus(queryId, status);

    if (!result.success) {
      return errorResponse('Failed to update query status');
    }

    // Return success response
    return successResponse(
      result.data,
      'Query status updated successfully'
    );

  } catch (error) {
    logError('Query Update Handler', error);
    return errorResponse('An error occurred while updating the query', 500);
  }
};
