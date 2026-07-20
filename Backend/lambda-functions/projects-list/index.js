require('dotenv').config({ path: '../../.env' });
const { getAllProjects } = require('../../shared/db-helper');
const {
  successResponse,
  errorResponse,
  handleCorsPreFlight,
  logError,
  checkMethod
} = require('../../shared/utils');

/**
 * Lambda Handler - Get All Projects
 * GET /api/projects
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

    const result = await getAllProjects();

    if (!result.success) {
      throw new Error('Failed to fetch projects');
    }

    return successResponse(
      {
        projects: result.data,
        count: result.data.length
      },
      'Projects retrieved successfully',
      200,
      { public: true, maxAge: 300 } // Cache for 5 minutes
    );

  } catch (error) {
    logError('Projects List Handler', error);
    return errorResponse('An error occurred while fetching projects', 500);
  }
};
