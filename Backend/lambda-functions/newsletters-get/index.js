require('dotenv').config({ path: '../../.env' });
const { getNewsletterById } = require('../../shared/db-helper');
const {
  successResponse,
  errorResponse,
  handleCorsPreFlight,
  logError,
  checkMethod
} = require('../../shared/utils');

exports.handler = async (event) => {
  try {
    const methodCheck = checkMethod(event, ['GET']);
    if (methodCheck.isOptions) return handleCorsPreFlight();
    if (!methodCheck.allowed) return errorResponse('Method not allowed', 405);

    const id = event.pathParameters?.id;
    if (!id) return errorResponse('Newsletter ID is required', 400);

    const result = await getNewsletterById(id);
    if (!result.success) return errorResponse(result.error || 'Newsletter not found', 404);

    return successResponse(result.data, 'Newsletter fetched successfully');
  } catch (error) {
    logError('Newsletter Get Handler', error);
    return errorResponse('An error occurred while fetching newsletter', 500);
  }
};
