require('dotenv').config({ path: '../../.env' });
const { deleteProject } = require('../../shared/db-helper');
const { verifyAuth } = require('../../shared/auth-helper');
const {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  handleCorsPreFlight,
  logError,
  checkMethod
} = require('../../shared/utils');

exports.handler = async (event) => {
  try {
    const methodCheck = checkMethod(event, ['DELETE']);
    if (methodCheck.isOptions) {
      return handleCorsPreFlight();
    }
    if (!methodCheck.allowed) {
      return errorResponse('Method not allowed', 405);
    }

    const authResult = verifyAuth(event);
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error);
    }

    const projectId = event.pathParameters?.id;
    if (!projectId) {
      return errorResponse('Project ID is required');
    }

    const result = await deleteProject(projectId);
    if (!result.success) {
      return errorResponse('Failed to delete project');
    }

    return successResponse({ id: projectId }, 'Project deleted successfully');
  } catch (error) {
    logError('Project Delete Handler', error);
    return errorResponse('An error occurred while deleting the project', 500);
  }
};
