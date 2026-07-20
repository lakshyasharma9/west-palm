require('dotenv').config({ path: '../../.env' });
const { verifyAuth } = require('../../shared/auth-helper');
const { generatePresignedUploadUrl, validateFileType, validateFileSize } = require('../../shared/s3-helper');
const {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  handleCorsPreFlight,
  logError,
  checkMethod,
  parseBody
} = require('../../shared/utils');

/**
 * Lambda Handler - Generate Presigned Upload URL
 * POST /api/upload/url
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

    const { fileName, fileType, fileSize } = body;

    if (!fileName || !fileType) {
      return errorResponse('fileName and fileType are required');
    }

    if (!validateFileType(fileName)) {
      return errorResponse('Invalid file type. Allowed: .jpg, .jpeg, .png, .jfif, .webp, .gif, .bmp, .svg, .pdf, .zip, .docx, .doc, .mp4, .mov, .avi, .mkv');
    }

    if (fileSize && !validateFileSize(fileSize)) {
      const maxSize = parseInt(process.env.MAX_FILE_SIZE || '26214400');
      return errorResponse(`File size exceeds ${maxSize / 1024 / 1024}MB`);
    }

    const result = generatePresignedUploadUrl(fileName, fileType, 300);

    if (!result.success) {
      throw new Error('Failed to generate upload URL');
    }

    return successResponse(
      {
        uploadUrl: result.uploadUrl,
        fileKey: result.fileKey,
        fileUrl: result.fileUrl,
        expiresIn: 300
      },
      'Upload URL generated successfully'
    );

  } catch (error) {
    logError('Upload URL Handler', error);
    return errorResponse('An error occurred while generating upload URL', 500);
  }
};
