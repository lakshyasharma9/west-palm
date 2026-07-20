require('dotenv').config({ path: '../../.env' });
const { createQuery } = require('../../shared/db-helper');
const { uploadFile, validateFileType, validateFileSize } = require('../../shared/s3-helper');
const {
  successResponse,
  errorResponse,
  validationError,
  parseBody,
  validateRequiredFields,
  validateEmail,
  sanitizeString,
  generateUUID,
  getCurrentTimestamp,
  handleCorsPreFlight,
  logError,
  checkMethod
} = require('../../shared/utils');

/**
 * Lambda Handler - Contact Form Submission
 * POST /api/contact
 */
exports.handler = async (event) => {
  try {
    // Handle CORS preflight
    const methodCheck = checkMethod(event, ['POST']);
    if (methodCheck.isOptions) {
      return handleCorsPreFlight();
    }
    if (!methodCheck.allowed) {
      return errorResponse('Method not allowed', 405);
    }

    // Parse request body
    const body = parseBody(event);
    if (!body) {
      return errorResponse('Invalid request body');
    }

    // Validate required fields
    const requiredFields = ['name', 'email', 'message'];
    const validationErrors = validateRequiredFields(body, requiredFields);

    // Validate email format
    if (body.email && !validateEmail(body.email)) {
      validationErrors.push('Invalid email format');
    }

    // Validate services array
    if (body.service && !Array.isArray(body.service)) {
      validationErrors.push('Services must be an array');
    }

    if (validationErrors.length > 0) {
      return validationError(validationErrors);
    }

    // Sanitize inputs
    const sanitizedData = {
      fullName: sanitizeString(body.name),
      email: sanitizeString(body.email).toLowerCase(),
      company: sanitizeString(body.company || ''),
      services: Array.isArray(body.service) ? body.service.map(s => sanitizeString(s)) : [],
      message: sanitizeString(body.message)
    };

    // Handle file attachment if present
    let attachmentUrl = null;
    if (body.attachment) {
      // If attachment is base64 encoded file
      if (body.attachment.data && body.attachment.name) {
        const fileBuffer = Buffer.from(body.attachment.data, 'base64');
        const fileName = body.attachment.name;
        const fileType = body.attachment.type || 'application/octet-stream';

        // Validate file
        if (!validateFileType(fileName)) {
          return errorResponse('Invalid file type. Allowed: PDF, ZIP, DOCX, JPG, PNG');
        }

        if (!validateFileSize(fileBuffer.length)) {
          return errorResponse('File size exceeds maximum limit of 25MB');
        }

        // Upload to S3
        const uploadResult = await uploadFile(fileBuffer, fileName, fileType);
        if (!uploadResult.success) {
          logError('File Upload', new Error(uploadResult.error));
          return errorResponse('Failed to upload attachment');
        }

        attachmentUrl = uploadResult.fileKey;
      } else if (typeof body.attachment === 'string') {
        // If attachment is already a URL or filename
        attachmentUrl = body.attachment;
      }
    }

    // Create query object
    const queryData = {
      id: generateUUID(),
      fullName: sanitizedData.fullName,
      email: sanitizedData.email,
      company: sanitizedData.company,
      services: sanitizedData.services,
      message: sanitizedData.message,
      attachment: attachmentUrl,
      date: getCurrentTimestamp(),
      status: 'pending'
    };

    // Save to DynamoDB
    const result = await createQuery(queryData);

    if (!result.success) {
      throw new Error('Failed to save query');
    }

    // Return success response
    return successResponse(
      {
        id: queryData.id,
        message: 'Your inquiry has been submitted successfully. We will get back to you within 24 hours.'
      },
      'Query submitted successfully',
      201
    );

  } catch (error) {
    logError('Contact Form Handler', error);
    return errorResponse('An error occurred while processing your request', 500);
  }
};
