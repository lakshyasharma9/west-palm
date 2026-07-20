require('dotenv').config({ path: '../../.env' });
const AWS = require('aws-sdk');
const { verifyAuth } = require('../../shared/auth-helper');
const {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
  parseBody,
  handleCorsPreFlight,
  logError,
  checkMethod,
  getCurrentTimestamp
} = require('../../shared/utils');

AWS.config.update({ region: process.env.AWS_REGION });
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const methodCheck = checkMethod(event, ['PUT']);
    if (methodCheck.isOptions) return handleCorsPreFlight();
    if (!methodCheck.allowed) return errorResponse('Method not allowed', 405);

    const authResult = verifyAuth(event);
    if (!authResult.authenticated) return unauthorizedResponse(authResult.error);

    const id = event.pathParameters?.id;
    if (!id) return errorResponse('News ID is required', 400);

    const body = parseBody(event);
    if (!body) return errorResponse('Invalid request body');

    // Get existing news item
    const getParams = {
      TableName: process.env.DYNAMODB_NEWS_TABLE,
      Key: { id }
    };

    const existingResult = await dynamodb.get(getParams).promise();
    if (!existingResult.Item) {
      return notFoundResponse('News item not found');
    }

    const updatedItem = {
      ...existingResult.Item,
      ...body,
      id, // Ensure ID doesn't change
      updatedAt: getCurrentTimestamp()
    };

    const putParams = {
      TableName: process.env.DYNAMODB_NEWS_TABLE,
      Item: updatedItem
    };

    await dynamodb.put(putParams).promise();

    return successResponse(updatedItem, 'News item updated successfully');
  } catch (error) {
    logError('News Update Handler', error);
    return errorResponse('An error occurred while updating news', 500);
  }
};
