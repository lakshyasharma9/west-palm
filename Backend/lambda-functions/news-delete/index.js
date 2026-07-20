require('dotenv').config({ path: '../../.env' });
const AWS = require('aws-sdk');
const { verifyAuth } = require('../../shared/auth-helper');
const {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  handleCorsPreFlight,
  logError,
  checkMethod
} = require('../../shared/utils');

AWS.config.update({ region: process.env.AWS_REGION });
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const methodCheck = checkMethod(event, ['DELETE']);
    if (methodCheck.isOptions) return handleCorsPreFlight();
    if (!methodCheck.allowed) return errorResponse('Method not allowed', 405);

    const authResult = verifyAuth(event);
    if (!authResult.authenticated) return unauthorizedResponse(authResult.error);

    const id = event.pathParameters?.id;
    if (!id) return errorResponse('News ID is required', 400);

    const params = {
      TableName: process.env.DYNAMODB_NEWS_TABLE,
      Key: { id }
    };

    await dynamodb.delete(params).promise();

    return successResponse(null, 'News item deleted successfully');
  } catch (error) {
    logError('News Delete Handler', error);
    return errorResponse('An error occurred while deleting news', 500);
  }
};
