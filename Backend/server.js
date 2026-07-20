require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { generatePresignedDownloadUrl } = require('./shared/s3-helper');
const { getQueryById } = require('./shared/db-helper');
const { verifyAuth } = require('./shared/auth-helper');
const {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
  handleCorsPreFlight,
  logError,
  checkMethod
} = require('./shared/utils');

// Import Lambda handlers
const contactFormHandler = require('./lambda-functions/contact-form/index');
const adminAuthHandler = require('./lambda-functions/admin-auth/index');
const queriesListHandler = require('./lambda-functions/queries-list/index');
const queriesGetHandler = require('./lambda-functions/queries-get/index');
const queriesUpdateHandler = require('./lambda-functions/queries-update/index');
const queriesDeleteHandler = require('./lambda-functions/queries-delete/index');
const projectsListHandler = require('./lambda-functions/projects-list/index');
const projectsGetHandler = require('./lambda-functions/projects-get/index');
const projectsCreateHandler = require('./lambda-functions/projects-create/index');
const projectsUpdateHandler = require('./lambda-functions/projects-update/index');
const projectsDeleteHandler = require('./lambda-functions/projects-delete/index');
const uploadUrlHandler = require('./lambda-functions/upload-url/index');
const newslettersListHandler = require('./lambda-functions/newsletters-list/index');
const newslettersGetHandler = require('./lambda-functions/newsletters-get/index');
const newslettersGetSlugHandler = require('./lambda-functions/newsletters-get-slug/index');
const newslettersCreateHandler = require('./lambda-functions/newsletters-create/index');
const newslettersUpdateHandler = require('./lambda-functions/newsletters-update/index');
const newslettersDeleteHandler = require('./lambda-functions/newsletters-delete/index');
const newsListHandler = require('./lambda-functions/news-list/index');
const newsLatestHandler = require('./lambda-functions/news-latest/index');
const newsGetHandler = require('./lambda-functions/news-get/index');
const newsCreateHandler = require('./lambda-functions/news-create/index');
const newsUpdateHandler = require('./lambda-functions/news-update/index');
const newsDeleteHandler = require('./lambda-functions/news-delete/index');
// Customer handlers
const customerAuthHandler = require('./lambda-functions/customer-auth/index');
const customerProjectsHandler = require('./lambda-functions/customer-projects/index');
const customerAccountCreateHandler = require('./lambda-functions/customer-account-create/index');
const customerAccountsListHandler = require('./lambda-functions/customer-accounts-list/index');
const customerAccountUpdateHandler = require('./lambda-functions/customer-account-update/index');
const customerAccountDeleteHandler = require('./lambda-functions/customer-account-delete/index');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.ADMIN_PANEL_URL || 'http://localhost:8080'
  ],
  credentials: true
}));
// Reduced payload limits - use presigned URLs for large files
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (minimal in production)
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n📨 ${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('Body:', JSON.stringify(req.body, null, 2));
    }
  } else {
    console.log(`${req.method} ${req.path}`);
  }
  next();
});

/**
 * Helper function to convert Express req/res to Lambda event/context
 */
function createLambdaEvent(req) {
  return {
    httpMethod: req.method,
    path: req.path,
    pathParameters: req.params,
    queryStringParameters: req.query,
    headers: req.headers,
    body: req.body ? JSON.stringify(req.body) : null,
    requestContext: {
      http: {
        method: req.method
      }
    }
  };
}

/**
 * Helper function to handle Lambda response
 */
function handleLambdaResponse(lambdaResponse, res) {
  const statusCode = lambdaResponse.statusCode || 200;
  const headers = lambdaResponse.headers || {};
  const body = lambdaResponse.body;

  // Set headers
  Object.keys(headers).forEach(key => {
    res.setHeader(key, headers[key]);
  });

  // Send response
  res.status(statusCode);
  
  try {
    const parsedBody = JSON.parse(body);
    res.json(parsedBody);
  } catch (e) {
    res.send(body);
  }
}

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * POST /api/contact - Submit contact form
 */
app.post('/api/contact', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await contactFormHandler.handler(event);
    handleLambdaResponse(response, res);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// ============================================
// AUTHENTICATION ROUTES
// ============================================

/**
 * POST /api/auth/login - Admin login
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await adminAuthHandler.handler(event);
    handleLambdaResponse(response, res);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// ============================================
// CUSTOMER AUTHENTICATION ROUTES
// ============================================

/**
 * POST /api/customer/login - Customer login
 */
app.post('/api/customer/login', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await customerAuthHandler.handler(event);
    handleLambdaResponse(response, res);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /api/customer/projects - Get customer projects (protected)
 */
app.get('/api/customer/projects', async (req, res) => {
  try {
    // Extract customer info from JWT token
    const authResult = verifyAuth({ headers: req.headers });
    if (!authResult.authenticated) {
      return res.status(401).json({ success: false, message: authResult.error });
    }

    // Create event with customer context
    const event = createLambdaEvent(req);
    event.requestContext.authorizer = {
      customerId: authResult.user.customerId,
      role: authResult.user.role
    };

    const response = await customerProjectsHandler.handler(event);
    handleLambdaResponse(response, res);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// ============================================
// ADMIN - CUSTOMER MANAGEMENT ROUTES
// ============================================

/**
 * POST /api/admin/customers - Create customer account (admin only)
 */
app.post('/api/admin/customers', async (req, res) => {
  try {
    const authResult = verifyAuth({ headers: req.headers });
    if (!authResult.authenticated) {
      return res.status(401).json({ success: false, message: authResult.error });
    }

    const event = createLambdaEvent(req);
    event.requestContext.authorizer = {
      email: authResult.user.email,
      role: authResult.user.role
    };

    const response = await customerAccountCreateHandler.handler(event);
    handleLambdaResponse(response, res);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/customers - Get all customers (admin only)
 */
app.get('/api/admin/customers', async (req, res) => {
  try {
    const authResult = verifyAuth({ headers: req.headers });
    if (!authResult.authenticated) {
      return res.status(401).json({ success: false, message: authResult.error });
    }

    const event = createLambdaEvent(req);
    event.requestContext.authorizer = {
      email: authResult.user.email,
      role: authResult.user.role
    };

    const response = await customerAccountsListHandler.handler(event);
    handleLambdaResponse(response, res);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * PUT /api/admin/customers/:id - Update customer account (admin only)
 */
app.put('/api/admin/customers/:id', async (req, res) => {
  try {
    const authResult = verifyAuth({ headers: req.headers });
    if (!authResult.authenticated) {
      return res.status(401).json({ success: false, message: authResult.error });
    }

    const event = createLambdaEvent(req);
    event.requestContext.authorizer = {
      email: authResult.user.email,
      role: authResult.user.role
    };

    const response = await customerAccountUpdateHandler.handler(event);
    handleLambdaResponse(response, res);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * DELETE /api/admin/customers/:id - Delete customer account (admin only)
 */
app.delete('/api/admin/customers/:id', async (req, res) => {
  try {
    const authResult = verifyAuth({ headers: req.headers });
    if (!authResult.authenticated) {
      return res.status(401).json({ success: false, message: authResult.error });
    }

    const event = createLambdaEvent(req);
    event.requestContext.authorizer = {
      email: authResult.user.email,
      role: authResult.user.role
    };

    const response = await customerAccountDeleteHandler.handler(event);
    handleLambdaResponse(response, res);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// ============================================
// QUERIES ROUTES (PROTECTED)
// ============================================

/**
 * GET /api/queries - Get all queries
 */
app.get('/api/queries', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await queriesListHandler.handler(event);
    handleLambdaResponse(response, res);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /api/queries/:id - Get single query
 */
app.get('/api/queries/:id', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await queriesGetHandler.handler(event);
    handleLambdaResponse(response, res);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * PATCH /api/queries/:id - Update query status
 */
app.patch('/api/queries/:id', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await queriesUpdateHandler.handler(event);
    handleLambdaResponse(response, res);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * DELETE /api/queries/:id - Delete query
 */
app.delete('/api/queries/:id', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await queriesDeleteHandler.handler(event);
    handleLambdaResponse(response, res);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /api/queries/:id/download - Get presigned download URL for attachment
 */
app.get('/api/queries/:id/download', async (req, res) => {
  try {
    const methodCheck = checkMethod({ httpMethod: req.method }, ['GET']);
    if (methodCheck.isOptions) {
      return res.status(200).json({ message: 'OK' });
    }
    if (!methodCheck.allowed) {
      return res.status(405).json(errorResponse('Method not allowed', 405));
    }

    const authResult = verifyAuth({ headers: req.headers });
    if (!authResult.authenticated) {
      return res.status(401).json({ success: false, message: authResult.error });
    }

    const queryId = req.params.id;
    if (!queryId) {
      return res.status(400).json({ success: false, message: 'Query ID is required' });
    }

    const result = await getQueryById(queryId);
    if (!result.success) {
      return res.status(404).json({ success: false, message: 'Query not found' });
    }

    const query = result.data;
    if (!query.attachment) {
      return res.status(400).json({ success: false, message: 'No attachment found' });
    }

    const downloadResult = generatePresignedDownloadUrl(query.attachment, 3600);
    if (!downloadResult.success) {
      return res.status(500).json({ success: false, message: 'Failed to generate download URL' });
    }

    res.json({
      success: true,
      data: {
        downloadUrl: downloadResult.downloadUrl,
        fileName: query.attachment.split('/').pop(),
        expiresIn: 3600
      }
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// ============================================
// UPLOAD ROUTES (PROTECTED)
// ============================================

/**
 * POST /api/upload/url - Generate presigned upload URL
 */
app.post('/api/upload/url', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await uploadUrlHandler.handler(event);
    handleLambdaResponse(response, res);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// ============================================
// PROJECTS ROUTES
// ============================================

/**
 * GET /api/projects - Get all projects (public)
 */
app.get('/api/projects', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await projectsListHandler.handler(event);
    handleLambdaResponse(response, res);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /api/projects/:id - Get single project (public)
 */
app.get('/api/projects/:id', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await projectsGetHandler.handler(event);
    handleLambdaResponse(response, res);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * POST /api/projects - Create project (protected)
 */
app.post('/api/projects', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await projectsCreateHandler.handler(event);
    handleLambdaResponse(response, res);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * PUT /api/projects/:id - Update project (protected)
 */
app.put('/api/projects/:id', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await projectsUpdateHandler.handler(event);
    handleLambdaResponse(response, res);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * DELETE /api/projects/:id - Delete project (protected)
 */
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await projectsDeleteHandler.handler(event);
    handleLambdaResponse(response, res);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// ============================================
// NEWSLETTERS ROUTES
// ============================================

/**
 * GET /api/newsletters - Get all newsletters (public)
 */
app.get('/api/newsletters', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await newslettersListHandler.handler(event);
    handleLambdaResponse(response, res);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /api/newsletters/:id - Get single newsletter (public)
 */
app.get('/api/newsletters/:id', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await newslettersGetHandler.handler(event);
    handleLambdaResponse(response, res);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /api/newsletters/slug/:slug - Get newsletter by slug (public)
 */
app.get('/api/newsletters/slug/:slug', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await newslettersGetSlugHandler.handler(event);
    handleLambdaResponse(response, res);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * POST /api/newsletters - Create newsletter (protected)
 */
app.post('/api/newsletters', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await newslettersCreateHandler.handler(event);
    handleLambdaResponse(response, res);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * PUT /api/newsletters/:id - Update newsletter (protected)
 */
app.put('/api/newsletters/:id', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await newslettersUpdateHandler.handler(event);
    handleLambdaResponse(response, res);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * DELETE /api/newsletters/:id - Delete newsletter (protected)
 */
app.delete('/api/newsletters/:id', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await newslettersDeleteHandler.handler(event);
    handleLambdaResponse(response, res);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// ============================================
// NEWS ROUTES
// ============================================

/**
 * GET /api/news - Get all news (public)
 */
app.get('/api/news', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await newsListHandler.handler(event);
    handleLambdaResponse(response, res);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /api/news/latest - Get latest news (public)
 */
app.get('/api/news/latest', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await newsLatestHandler.handler(event);
    handleLambdaResponse(response, res);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /api/news/:id - Get single news item (public)
 */
app.get('/api/news/:id', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await newsGetHandler.handler(event);
    handleLambdaResponse(response, res);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * POST /api/news - Create news (protected)
 */
app.post('/api/news', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await newsCreateHandler.handler(event);
    handleLambdaResponse(response, res);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * PUT /api/news/:id - Update news (protected)
 */
app.put('/api/news/:id', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await newsUpdateHandler.handler(event);
    handleLambdaResponse(response, res);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * DELETE /api/news/:id - Delete news (protected)
 */
app.delete('/api/news/:id', async (req, res) => {
  try {
    const event = createLambdaEvent(req);
    const response = await newsDeleteHandler.handler(event);
    handleLambdaResponse(response, res);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'WPCS Backend is running!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// ============================================
// ERROR HANDLER
// ============================================

app.use((error, req, res, next) => {
  console.error('❌ Unhandled Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 WPCS Backend Server Started!');
  console.log('='.repeat(60));
  console.log(`\n📍 Server running on: http://localhost:${PORT}`);
  console.log(`\n📋 Available Endpoints:`);
  console.log(`   GET    http://localhost:${PORT}/health`);
  console.log(`   POST   http://localhost:${PORT}/api/contact`);
  console.log(`   POST   http://localhost:${PORT}/api/auth/login`);
  console.log(`   POST   http://localhost:${PORT}/api/upload/url`);
  console.log(`   GET    http://localhost:${PORT}/api/queries`);
  console.log(`   GET    http://localhost:${PORT}/api/queries/:id`);
  console.log(`   PATCH  http://localhost:${PORT}/api/queries/:id`);
  console.log(`   DELETE http://localhost:${PORT}/api/queries/:id`);
  console.log(`   GET    http://localhost:${PORT}/api/projects`);
  console.log(`   GET    http://localhost:${PORT}/api/projects/:id`);
  console.log(`   POST   http://localhost:${PORT}/api/projects`);
  console.log(`   PUT    http://localhost:${PORT}/api/projects/:id`);
  console.log(`   DELETE http://localhost:${PORT}/api/projects/:id`);
  console.log(`   GET    http://localhost:${PORT}/api/newsletters`);
  console.log(`   GET    http://localhost:${PORT}/api/newsletters/:id`);
  console.log(`   GET    http://localhost:${PORT}/api/newsletters/slug/:slug`);
  console.log(`   POST   http://localhost:${PORT}/api/newsletters`);
  console.log(`   PUT    http://localhost:${PORT}/api/newsletters/:id`);
  console.log(`   DELETE http://localhost:${PORT}/api/newsletters/:id`);
  console.log(`\n🌐 CORS Enabled for:`);
  console.log(`   - ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`   - ${process.env.ADMIN_PANEL_URL || 'http://localhost:8080'}`);
  console.log(`\n🗄️  Database:`);
  console.log(`   Region: ${process.env.AWS_REGION}`);
  console.log(`   Queries Table: ${process.env.DYNAMODB_QUERIES_TABLE}`);
  console.log(`   Admin Table: ${process.env.DYNAMODB_ADMIN_TABLE}`);
  console.log(`   S3 Bucket: ${process.env.S3_BUCKET_NAME}`);
  console.log('\n' + '='.repeat(60));
  console.log('✅ Ready to accept requests!\n');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⏹️  SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⏹️  SIGINT received, shutting down gracefully...');
  process.exit(0);
});
