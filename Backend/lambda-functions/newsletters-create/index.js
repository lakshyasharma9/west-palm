require('dotenv').config({ path: '../../.env' });
const { createNewsletter } = require('../../shared/db-helper');
const { verifyAuth } = require('../../shared/auth-helper');
const {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  validationError,
  parseBody,
  validateRequiredFields,
  sanitizeString,
  generateUUID,
  getCurrentTimestamp,
  handleCorsPreFlight,
  logError,
  checkMethod
} = require('../../shared/utils');

exports.handler = async (event) => {
  try {
    const methodCheck = checkMethod(event, ['POST']);
    if (methodCheck.isOptions) return handleCorsPreFlight();
    if (!methodCheck.allowed) return errorResponse('Method not allowed', 405);

    const authResult = verifyAuth(event);
    if (!authResult.authenticated) return unauthorizedResponse(authResult.error);

    const body = parseBody(event);
    if (!body) return errorResponse('Invalid request body');

    const requiredFields = ['title', 'content', 'month', 'year'];
    const validationErrors = validateRequiredFields(body, requiredFields);
    if (validationErrors.length > 0) return validationError(validationErrors);

    const newsletterData = {
      id: generateUUID(),
      title: sanitizeString(body.title),
      slug: body.slug || sanitizeString(body.title).toLowerCase().replace(/\s+/g, '-'),
      content: body.content,
      excerpt: body.excerpt || '',
      plainText: body.plainText || '',
      month: parseInt(body.month),
      year: parseInt(body.year),
      coverImage: body.coverImage || null,
      status: body.status || 'published',
      author: authResult.email || 'admin',
      seo: {
        metaTitle: body.seo?.metaTitle || sanitizeString(body.title),
        metaDescription: body.seo?.metaDescription || '',
        keywords: body.seo?.keywords || []
      },
      views: 0,
      downloads: 0,
      publishedDate: body.status === 'published' ? getCurrentTimestamp() : null,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };

    const result = await createNewsletter(newsletterData);
    if (!result.success) throw new Error('Failed to create newsletter');

    return successResponse(result.data, 'Newsletter created successfully', 201);
  } catch (error) {
    logError('Newsletter Create Handler', error);
    return errorResponse('An error occurred while creating newsletter', 500);
  }
};
