require('dotenv').config({ path: '../../.env' });
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
const { verifyAuth } = require('../../shared/auth-helper');
const {
  successResponse,
  errorResponse,
  unauthorizedResponse,
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
    const methodCheck = checkMethod(event, ['POST']);
    if (methodCheck.isOptions) return handleCorsPreFlight();
    if (!methodCheck.allowed) return errorResponse('Method not allowed', 405);

    const authResult = verifyAuth(event);
    if (!authResult.authenticated) return unauthorizedResponse(authResult.error);

    const body = parseBody(event);
    if (!body) return errorResponse('Invalid request body');

    const { title, excerpt, content, type, coverImage, publishDate, priority, eventDate, eventLocation, eventLink, status } = body;

    if (!title || !excerpt || !content) {
      return errorResponse('Title, excerpt, and content are required', 400);
    }

    const newsItem = {
      id: uuidv4(),
      type: type || 'news',
      title,
      excerpt,
      content,
      coverImage: coverImage || '',
      publishDate: publishDate || getCurrentTimestamp(),
      status: status || 'draft',
      priority: priority || 3,
      views: 0,
      clicks: 0,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };

    // Add event-specific fields if type is event
    if (type === 'event') {
      newsItem.eventDate = eventDate || '';
      newsItem.eventLocation = eventLocation || '';
      newsItem.eventLink = eventLink || '';
    }

    const params = {
      TableName: process.env.DYNAMODB_NEWS_TABLE,
      Item: newsItem
    };

    await dynamodb.put(params).promise();

    return successResponse(newsItem, 'News item created successfully', 201);
  } catch (error) {
    logError('News Create Handler', error);
    return errorResponse('An error occurred while creating news', 500);
  }
};
