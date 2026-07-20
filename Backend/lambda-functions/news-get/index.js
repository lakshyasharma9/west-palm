require('dotenv').config({ path: '../../.env' });
const AWS = require('aws-sdk');
const {
  successResponse,
  errorResponse,
  notFoundResponse,
  handleCorsPreFlight,
  logError,
  checkMethod
} = require('../../shared/utils');

AWS.config.update({ region: process.env.AWS_REGION });
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const methodCheck = checkMethod(event, ['GET']);
    if (methodCheck.isOptions) return handleCorsPreFlight();
    if (!methodCheck.allowed) return errorResponse('Method not allowed', 405);

    const id = event.pathParameters?.id;
    if (!id) return errorResponse('News ID is required', 400);

    // Get news item
    const getParams = {
      TableName: process.env.DYNAMODB_NEWS_TABLE,
      Key: { id }
    };

    const result = await dynamodb.get(getParams).promise();

    if (!result.Item) {
      return notFoundResponse('News item not found');
    }

    // Increment view count
    const updateParams = {
      TableName: process.env.DYNAMODB_NEWS_TABLE,
      Key: { id },
      UpdateExpression: 'SET #views = if_not_exists(#views, :zero) + :inc',
      ExpressionAttributeNames: {
        '#views': 'views'
      },
      ExpressionAttributeValues: {
        ':zero': 0,
        ':inc': 1
      }
    };

    await dynamodb.update(updateParams).promise();

    return successResponse(result.Item);
  } catch (error) {
    logError('News Get Handler', error);
    return errorResponse('An error occurred while fetching news', 500);
  }
};
