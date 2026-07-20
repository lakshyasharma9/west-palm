require('dotenv').config({ path: '../../.env' });
const { getNewsletterBySlug, incrementNewsletterViews } = require('../../shared/db-helper');
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

    const slug = event.pathParameters?.slug;
    if (!slug) return errorResponse('Newsletter slug is required', 400);

    const result = await getNewsletterBySlug(slug);
    if (!result.success) return errorResponse(result.error || 'Newsletter not found', 404);

    await incrementNewsletterViews(result.data.id);

    return successResponse(result.data, 'Newsletter fetched successfully');
  } catch (error) {
    logError('Newsletter Get By Slug Handler', error);
    return errorResponse('An error occurred while fetching newsletter', 500);
  }
};
