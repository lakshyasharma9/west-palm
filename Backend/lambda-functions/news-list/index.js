require('dotenv').config({ path: '../../.env' });
const AWS = require('aws-sdk');
const {
  successResponse,
  errorResponse,
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

    const limit = parseInt(event.queryStringParameters?.limit) || 20;
    const status = event.queryStringParameters?.status || 'published';

    const params = {
      TableName: process.env.DYNAMODB_NEWS_TABLE,
      IndexName: 'status-publishDate-index',
      KeyConditionExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': status
      },
      ScanIndexForward: false,
      Limit: limit
    };

    const result = await dynamodb.query(params).promise();

    return successResponse({
      news: result.Items || [],
      count: result.Items?.length || 0
    });
  } catch (error) {
    logError('News List Handler', error);
    return errorResponse('An error occurred while fetching news', 500);
  }
};
