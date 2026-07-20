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

    const limit = parseInt(event.queryStringParameters?.limit) || 5;

    const params = {
      TableName: process.env.DYNAMODB_NEWS_TABLE,
      IndexName: 'status-publishDate-index',
      KeyConditionExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': 'published'
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
    logError('News Latest Handler', error);
    return errorResponse('An error occurred while fetching latest news', 500);
  }
};
