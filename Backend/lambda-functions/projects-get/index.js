require('dotenv').config({ path: '../../.env' });
const { getProjectById } = require('../../shared/db-helper');
const {
  successResponse,
  errorResponse,
  notFoundResponse,
  handleCorsPreFlight,
  logError,
  checkMethod
} = require('../../shared/utils');

exports.handler = async (event) => {
  try {
    const methodCheck = checkMethod(event, ['GET']);
    if (methodCheck.isOptions) {
      return handleCorsPreFlight();
    }
    if (!methodCheck.allowed) {
      return errorResponse('Method not allowed', 405);
    }

    const projectId = event.pathParameters?.id;
    if (!projectId) {
      return errorResponse('Project ID is required');
    }

    const result = await getProjectById(projectId);
    if (!result.success) {
      return notFoundResponse('Project not found');
    }

    return successResponse(
      result.data, 
      'Project retrieved successfully',
      200,
      { public: true, maxAge: 300 } // Cache for 5 minutes
    );
  } catch (error) {
    logError('Project Get Handler', error);
    return errorResponse('An error occurred while fetching the project', 500);
  }
};
