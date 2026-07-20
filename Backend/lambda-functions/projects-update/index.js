require('dotenv').config({ path: '../../.env' });
const { updateProject } = require('../../shared/db-helper');
const { verifyAuth } = require('../../shared/auth-helper');
const { uploadFile } = require('../../shared/s3-helper');
const {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  parseBody,
  handleCorsPreFlight,
  logError,
  checkMethod
} = require('../../shared/utils');

exports.handler = async (event) => {
  try {
    const methodCheck = checkMethod(event, ['PUT', 'PATCH']);
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

    const body = parseBody(event);
    if (!body) {
      return errorResponse('Invalid request body');
    }

    const updateData = { ...body };

    if (body.bannerImage && body.bannerImage.data) {
      const fileBuffer = Buffer.from(body.bannerImage.data, 'base64');
      const fileName = body.bannerImage.name || 'banner.jpg';
      const fileType = body.bannerImage.type || 'image/jpeg';
      const uploadResult = await uploadFile(fileBuffer, `project-${Date.now()}-${fileName}`, fileType);
      if (uploadResult.success) {
        updateData.bannerUrl = uploadResult.fileKey;
        if (!updateData.heroUrl) {
          updateData.heroUrl = uploadResult.fileKey;
        }
      }
      delete updateData.bannerImage;
    }

    if (body.heroImage && body.heroImage.data) {
      const fileBuffer = Buffer.from(body.heroImage.data, 'base64');
      const fileName = body.heroImage.name || 'hero.jpg';
      const fileType = body.heroImage.type || 'image/jpeg';
      const uploadResult = await uploadFile(fileBuffer, `project-${Date.now()}-${fileName}`, fileType);
      if (uploadResult.success) {
        updateData.heroUrl = uploadResult.fileKey;
      }
      delete updateData.heroImage;
    }

    // Handle gallery image upload
    if (body.galleryImage && body.galleryImage.data) {
      // First get current project to get existing gallery
      const { getProjectById } = require('../../shared/db-helper');
      const currentProject = await getProjectById(projectId);
      
      const fileBuffer = Buffer.from(body.galleryImage.data, 'base64');
      const fileName = body.galleryImage.name || `gallery-${Date.now()}.jpg`;
      const fileType = body.galleryImage.type || 'image/jpeg';
      const uploadResult = await uploadFile(fileBuffer, `${projectId}/gallery/${fileName}`, fileType);
      
      if (uploadResult.success) {
        // Add to existing gallery array from database
        const currentGallery = (currentProject.success && currentProject.data.gallery) ? currentProject.data.gallery : [];
        currentGallery.push({
          id: Date.now().toString(),
          url: uploadResult.fileKey,
          type: fileType.startsWith('video/') ? 'video' : 'image',
          name: fileName
        });
        updateData.gallery = currentGallery;
      }
      delete updateData.galleryImage;
    }

    const result = await updateProject(projectId, updateData);
    if (!result.success) {
      return errorResponse('Failed to update project');
    }

    return successResponse(result.data, 'Project updated successfully');
  } catch (error) {
    logError('Project Update Handler', error);
    return errorResponse('An error occurred while updating the project', 500);
  }
};
