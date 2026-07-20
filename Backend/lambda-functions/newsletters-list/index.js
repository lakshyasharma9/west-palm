require('dotenv').config({ path: '../../.env' });
const { getAllNewsletters } = require('../../shared/db-helper');
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

    const result = await getAllNewsletters();
    if (!result.success) throw new Error('Failed to fetch newsletters');

    return successResponse({ newsletters: result.data }, 'Newsletters fetched successfully');
  } catch (error) {
    logError('Newsletter List Handler', error);
    return errorResponse('An error occurred while fetching newsletters', 500);
  }
};
