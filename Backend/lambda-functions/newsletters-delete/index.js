require('dotenv').config({ path: '../../.env' });
const { deleteNewsletter } = require('../../shared/db-helper');
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
    if (methodCheck.isOptions) return handleCorsPreFlight();
    if (!methodCheck.allowed) return errorResponse('Method not allowed', 405);

    const authResult = verifyAuth(event);
    if (!authResult.authenticated) return unauthorizedResponse(authResult.error);

    const id = event.pathParameters?.id;
    if (!id) return errorResponse('Newsletter ID is required', 400);

    const result = await deleteNewsletter(id);
    if (!result.success) throw new Error('Failed to delete newsletter');

    return successResponse(null, 'Newsletter deleted successfully');
  } catch (error) {
    logError('Newsletter Delete Handler', error);
    return errorResponse('An error occurred while deleting newsletter', 500);
  }
};
