const AWS = require('aws-sdk');

// Configure AWS S3
AWS.config.update({
  region: process.env.AWS_REGION || 'eu-north-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const s3 = new AWS.S3();

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'west-palm-files';
const UPLOAD_FOLDER = 'projects'; // Changed from 'attachments' to 'projects'

/**
 * Generate presigned URL for file upload
 */
function generatePresignedUploadUrl(fileName, fileType, expiresIn = 300) {
  const key = `${UPLOAD_FOLDER}/${Date.now()}-${fileName}`;
  
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Expires: expiresIn,
    ContentType: fileType
  };

  try {
    const uploadUrl = s3.getSignedUrl('putObject', params);
    return {
      success: true,
      uploadUrl,
      fileKey: key,
      fileUrl: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
    };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate presigned URL for file download
 */
function generatePresignedDownloadUrl(fileKey, expiresIn = 3600) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileKey,
    Expires: expiresIn
  };

  try {
    const downloadUrl = s3.getSignedUrl('getObject', params);
    return { success: true, downloadUrl };
  } catch (error) {
    console.error('Error generating download URL:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Upload file directly to S3 (for Lambda use)
 */
async function uploadFile(fileBuffer, fileName, fileType) {
  const key = `${UPLOAD_FOLDER}/${Date.now()}-${fileName}`;
  
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: fileType
  };

  try {
    await s3.putObject(params).promise();
    return {
      success: true,
      fileKey: key,
      fileUrl: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete file from S3
 */
async function deleteFile(fileKey) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileKey
  };

  try {
    await s3.deleteObject(params).promise();
    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if file exists
 */
async function fileExists(fileKey) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileKey
  };

  try {
    await s3.headObject(params).promise();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validate file type
 */
function validateFileType(fileName) {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || '.pdf,.zip,.docx,.doc,.jpg,.jpeg,.png,.jfif,.webp,.gif,.bmp,.svg,.mp4,.mov,.avi,.mkv')
    .split(',')
    .map(type => type.trim().toLowerCase());
  
  const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  
  console.log('Validating file:', fileName);
  console.log('File extension:', fileExtension);
  console.log('Allowed types:', allowedTypes);
  console.log('Is valid:', allowedTypes.includes(fileExtension));
  
  return allowedTypes.includes(fileExtension);
}

/**
 * Validate file size
 */
function validateFileSize(fileSize) {
  const maxSize = parseInt(process.env.MAX_FILE_SIZE || '26214400'); // 25MB default
  return fileSize <= maxSize;
}

module.exports = {
  generatePresignedUploadUrl,
  generatePresignedDownloadUrl,
  uploadFile,
  deleteFile,
  fileExists,
  validateFileType,
  validateFileSize
};
