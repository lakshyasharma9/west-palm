require('dotenv').config({ path: '../../.env' });
const { updateNewsletter } = require('../../shared/db-helper');
const { verifyAuth } = require('../../shared/auth-helper');
const {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  parseBody,
  handleCorsPreFlight,
  logError,
  checkMethod,
  getCurrentTimestamp
} = require('../../shared/utils');

exports.handler = async (event) => {
  try {
    const methodCheck = checkMethod(event, ['PUT']);
    if (methodCheck.isOptions) return handleCorsPreFlight();
    if (!methodCheck.allowed) return errorResponse('Method not allowed', 405);

    const authResult = verifyAuth(event);
    if (!authResult.authenticated) return unauthorizedResponse(authResult.error);

    const id = event.pathParameters?.id;
    if (!id) return errorResponse('Newsletter ID is required', 400);

    const body = parseBody(event);
    if (!body) return errorResponse('Invalid request body');

    // Ensure year and month are always numbers — DynamoDB GSI requires type N
    const updateData = {
      ...body,
      year:  body.year  != null ? Number(body.year)  : undefined,
      month: body.month != null ? Number(body.month) : undefined,
      updatedAt: getCurrentTimestamp()
    };

    // Remove undefined fields to avoid overwriting with null
    if (isNaN(updateData.year))  delete updateData.year;
    if (isNaN(updateData.month)) delete updateData.month;

    const result = await updateNewsletter(id, updateData);
    if (!result.success) return errorResponse(result.error || 'Newsletter not found', 404);

    return successResponse(result.data, 'Newsletter updated successfully');
  } catch (error) {
    logError('Newsletter Update Handler', error);
    return errorResponse('An error occurred while updating newsletter', 500);
  }
};
