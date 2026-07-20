require('dotenv').config({ path: '../../.env' });
const { createProject } = require('../../shared/db-helper');
const { verifyAuth } = require('../../shared/auth-helper');
const { uploadFile } = require('../../shared/s3-helper');
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

/**
 * Lambda Handler - Create Project
 * POST /api/projects
 */
exports.handler = async (event) => {
  try {
    const methodCheck = checkMethod(event, ['POST']);
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

    const body = parseBody(event);
    if (!body) {
      return errorResponse('Invalid request body');
    }

    const requiredFields = ['name', 'address', 'type'];
    const validationErrors = validateRequiredFields(body, requiredFields);

    if (validationErrors.length > 0) {
      return validationError(validationErrors);
    }

    let bannerUrl = null;
    let heroUrl = null;

    if (body.bannerImage && body.bannerImage.data) {
      const fileBuffer = Buffer.from(body.bannerImage.data, 'base64');
      const fileName = body.bannerImage.name || 'banner.jpg';
      const fileType = body.bannerImage.type || 'image/jpeg';

      const uploadResult = await uploadFile(fileBuffer, `project-${Date.now()}-${fileName}`, fileType);
      if (uploadResult.success) {
        bannerUrl = uploadResult.fileKey;
        heroUrl = uploadResult.fileKey;
      }
    }

    const projectData = {
      id: generateUUID(),
      name: sanitizeString(body.name),
      address: sanitizeString(body.address),
      type: body.type,
      status: body.status || 'Planning',
      bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80',
      heroUrl: heroUrl || 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1600&q=80',
      heroStats: body.heroStats || [],
      overview: body.overview || { vision: '', sustainability: '' },
      specs: body.specs || [],
      gallery: body.gallery || [],
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };

    const result = await createProject(projectData);

    if (!result.success) {
      throw new Error('Failed to create project');
    }

    return successResponse(
      result.data,
      'Project created successfully',
      201
    );

  } catch (error) {
    logError('Project Create Handler', error);
    return errorResponse('An error occurred while creating project', 500);
  }
};
