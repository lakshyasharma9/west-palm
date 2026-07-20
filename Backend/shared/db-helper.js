const AWS = require('aws-sdk');
const NodeCache = require('node-cache');

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION || 'eu-north-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Initialize cache instances
// Projects cache: 5 minutes TTL
const projectsCache = new NodeCache({ 
  stdTTL: 300, // 5 minutes
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false // Better performance, we don't mutate cached data
});

// Queries cache: 1 minute TTL (admin needs fresher data)
const queriesCache = new NodeCache({ 
  stdTTL: 60, // 1 minute
  checkperiod: 30,
  useClones: false
});

// Newsletters cache: 10 minutes TTL
const newslettersCache = new NodeCache({ 
  stdTTL: 600, // 10 minutes
  checkperiod: 120,
  useClones: false
});

// Customers cache: 5 minutes TTL
const customersCache = new NodeCache({ 
  stdTTL: 300, // 5 minutes
  checkperiod: 60,
  useClones: false
});

const QUERIES_TABLE = process.env.DYNAMODB_QUERIES_TABLE || 'wpcs-queries';
const ADMIN_TABLE = process.env.DYNAMODB_ADMIN_TABLE || 'wpcs-admin-users';
const PROJECTS_TABLE = process.env.DYNAMODB_PROJECTS_TABLE || 'wpcs-projects';
const NEWSLETTERS_TABLE = process.env.DYNAMODB_NEWSLETTERS_TABLE || 'wpcs-newsletters';
const CUSTOMERS_TABLE = process.env.DYNAMODB_CUSTOMERS_TABLE || 'wpcs-customer-users';

/**
 * Create a new query in DynamoDB
 */
async function createQuery(queryData) {
  const params = {
    TableName: QUERIES_TABLE,
    Item: queryData
  };

  try {
    await dynamoDB.put(params).promise();
    return { success: true, data: queryData };
  } catch (error) {
    console.error('Error creating query:', error);
    throw error;
  }
}

/**
 * Get all queries with optional status filter
 */
async function getAllQueries(status = null) {
  try {
    // Create cache key based on status filter
    const cacheKey = status ? `queries_status_${status}` : 'queries_all';
    
    // Check cache first
    const cached = queriesCache.get(cacheKey);
    if (cached) {
      console.log(`✅ Cache HIT: ${cacheKey}`);
      return { success: true, data: cached };
    }
    
    console.log(`❌ Cache MISS: ${cacheKey} - Fetching from DynamoDB`);
    
    let params;

    if (status) {
      // Use GSI for filtering by status (OPTIMIZED ✅)
      params = {
        TableName: QUERIES_TABLE,
        IndexName: 'status-date-index',
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeNames: {
          '#status': 'status'
        },
        ExpressionAttributeValues: {
          ':status': status
        },
        ScanIndexForward: false // Sort by date descending
      };
      const result = await dynamoDB.query(params).promise();
      
      // Cache the result
      queriesCache.set(cacheKey, result.Items);
      console.log(`💾 Cached ${result.Items.length} queries with status=${status}`);
      
      return { success: true, data: result.Items };
    } else {
      // For small tables (<100 items), scan is acceptable with cache
      // For larger tables, consider dual-query approach
      params = {
        TableName: QUERIES_TABLE
      };
      const result = await dynamoDB.scan(params).promise();
      
      // Sort by date descending
      const sortedItems = result.Items.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      
      // Cache the result
      queriesCache.set(cacheKey, sortedItems);
      console.log(`💾 Cached ${sortedItems.length} queries (all statuses)`);
      
      return { success: true, data: sortedItems };
    }
  } catch (error) {
    console.error('Error getting queries:', error);
    throw error;
  }
}

/**
 * Get a single query by ID
 */
async function getQueryById(id) {
  const params = {
    TableName: QUERIES_TABLE,
    Key: { id }
  };

  try {
    const result = await dynamoDB.get(params).promise();
    if (!result.Item) {
      return { success: false, error: 'Query not found' };
    }
    return { success: true, data: result.Item };
  } catch (error) {
    console.error('Error getting query:', error);
    throw error;
  }
}

/**
 * Update query status
 */
async function updateQueryStatus(id, status) {
  const params = {
    TableName: QUERIES_TABLE,
    Key: { id },
    UpdateExpression: 'SET #status = :status',
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':status': status
    },
    ReturnValues: 'ALL_NEW'
  };

  try {
    const result = await dynamoDB.update(params).promise();
    
    // Invalidate queries cache
    queriesCache.flushAll();
    console.log('🗑️  Queries cache cleared after update');
    
    return { success: true, data: result.Attributes };
  } catch (error) {
    console.error('Error updating query:', error);
    throw error;
  }
}

/**
 * Delete a query
 */
async function deleteQuery(id) {
  const params = {
    TableName: QUERIES_TABLE,
    Key: { id }
  };

  try {
    await dynamoDB.delete(params).promise();
    
    // Invalidate queries cache
    queriesCache.flushAll();
    console.log('🗑️  Queries cache cleared after delete');
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting query:', error);
    throw error;
  }
}

/**
 * Get admin user by email
 */
async function getAdminByEmail(email) {
  const params = {
    TableName: ADMIN_TABLE,
    Key: { email }
  };

  try {
    const result = await dynamoDB.get(params).promise();
    return result.Item || null;
  } catch (error) {
    console.error('Error getting admin:', error);
    throw error;
  }
}

/**
 * Update admin credentials
 */
async function updateAdminCredentials(email, newEmail, hashedPassword) {
  try {
    // If email is changing, delete old and create new
    if (email !== newEmail) {
      // Get old admin data
      const oldAdmin = await getAdminByEmail(email);
      if (!oldAdmin) {
        return { success: false, error: 'Admin not found' };
      }

      // Delete old admin
      await dynamoDB.delete({
        TableName: ADMIN_TABLE,
        Key: { email }
      }).promise();

      // Create new admin with new email
      await dynamoDB.put({
        TableName: ADMIN_TABLE,
        Item: {
          email: newEmail,
          password: hashedPassword,
          createdAt: oldAdmin.createdAt,
          lastLogin: new Date().toISOString()
        }
      }).promise();

      return { success: true, email: newEmail };
    } else {
      // Just update password
      const params = {
        TableName: ADMIN_TABLE,
        Key: { email },
        UpdateExpression: 'SET password = :password, lastLogin = :lastLogin',
        ExpressionAttributeValues: {
          ':password': hashedPassword,
          ':lastLogin': new Date().toISOString()
        },
        ReturnValues: 'ALL_NEW'
      };

      const result = await dynamoDB.update(params).promise();
      return { success: true, data: result.Attributes };
    }
  } catch (error) {
    console.error('Error updating admin credentials:', error);
    throw error;
  }
}

/**
 * Update admin last login
 */
async function updateAdminLastLogin(email) {
  const params = {
    TableName: ADMIN_TABLE,
    Key: { email },
    UpdateExpression: 'SET lastLogin = :lastLogin',
    ExpressionAttributeValues: {
      ':lastLogin': new Date().toISOString()
    }
  };

  try {
    await dynamoDB.update(params).promise();
  } catch (error) {
    console.error('Error updating last login:', error);
  }
}

/**
 * Create admin user
 */
async function createAdminUser(email, hashedPassword) {
  const params = {
    TableName: ADMIN_TABLE,
    Item: {
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }
  };

  try {
    await dynamoDB.put(params).promise();
    return { success: true };
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error;
  }
}

module.exports = {
  createQuery,
  getAllQueries,
  getQueryById,
  updateQueryStatus,
  deleteQuery,
  getAdminByEmail,
  updateAdminCredentials,
  updateAdminLastLogin,
  createAdminUser,
  // Projects
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  // Newsletters
  createNewsletter,
  getAllNewsletters,
  getAllNewslettersAdmin,
  getNewsletterById,
  getNewsletterBySlug,
  updateNewsletter,
  deleteNewsletter,
  getLatestNewsletter,
  incrementNewsletterViews,
  // Customers
  getCustomerByUsername,
  createCustomerUser,
  updateCustomerUser,
  deleteCustomerUser,
  getAllCustomers,
  getCustomerProjects,
  updateCustomerLastLogin,
  getCustomerById
};

// ============================================
// PROJECTS FUNCTIONS
// ============================================

/**
 * Create a new project
 */
async function createProject(projectData) {
  const params = {
    TableName: PROJECTS_TABLE,
    Item: projectData
  };

  try {
    await dynamoDB.put(params).promise();
    
    // Invalidate projects cache
    projectsCache.flushAll();
    console.log('🗑️  Projects cache cleared after create');
    
    return { success: true, data: projectData };
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

/**
 * Get all projects
 */
async function getAllProjects() {
  const cacheKey = 'all_projects';
  
  // Check cache first
  const cached = projectsCache.get(cacheKey);
  if (cached) {
    console.log('✅ Cache HIT: all_projects');
    return { success: true, data: cached };
  }
  
  console.log('❌ Cache MISS: all_projects - Fetching from DynamoDB');
  
  const params = {
    TableName: PROJECTS_TABLE,
    // Optimize: Fetch all fields for small table (30 projects)
    // For larger tables, use ProjectionExpression to fetch only needed fields
  };

  try {
    const result = await dynamoDB.scan(params).promise();
    
    // Sort by createdAt descending (newest first)
    const sortedItems = result.Items.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    // Cache the result
    projectsCache.set(cacheKey, sortedItems);
    console.log(`💾 Cached ${sortedItems.length} projects (Scan took ${result.ConsumedCapacity?.CapacityUnits || 'N/A'} RCUs)`);
    
    return { success: true, data: sortedItems };
  } catch (error) {
    console.error('Error getting projects:', error);
    throw error;
  }
}

/**
 * Get a single project by ID
 */
async function getProjectById(id) {
  const cacheKey = `project_${id}`;
  
  // Check cache first
  const cached = projectsCache.get(cacheKey);
  if (cached) {
    console.log(`✅ Cache HIT: project_${id}`);
    return { success: true, data: cached };
  }
  
  console.log(`❌ Cache MISS: project_${id} - Fetching from DynamoDB`);
  
  const params = {
    TableName: PROJECTS_TABLE,
    Key: { id }
  };

  try {
    const result = await dynamoDB.get(params).promise();
    if (!result.Item) {
      return { success: false, error: 'Project not found' };
    }
    
    // Cache the result
    projectsCache.set(cacheKey, result.Item);
    console.log(`💾 Cached project: ${id}`);
    
    return { success: true, data: result.Item };
  } catch (error) {
    console.error('Error getting project:', error);
    throw error;
  }
}

/**
 * Update project
 */
async function updateProject(id, projectData) {
  try {
    // First get the current project
    const currentResult = await getProjectById(id);
    if (!currentResult.success) {
      return { success: false, error: 'Project not found' };
    }

    // Merge with existing data
    const mergedData = {
      ...currentResult.data,
      ...projectData,
      updatedAt: new Date().toISOString()
    };

    // Put the entire updated item
    const params = {
      TableName: PROJECTS_TABLE,
      Item: mergedData
    };

    await dynamoDB.put(params).promise();
    
    // Invalidate projects cache
    projectsCache.flushAll();
    console.log('🗑️  Projects cache cleared after update');
    
    return { success: true, data: mergedData };
  } catch (error) {
    console.error('Error updating project:', error);
    console.error('Project data:', JSON.stringify(projectData, null, 2));
    throw error;
  }
}

/**
 * Delete a project
 */
async function deleteProject(id) {
  const params = {
    TableName: PROJECTS_TABLE,
    Key: { id }
  };

  try {
    await dynamoDB.delete(params).promise();
    
    // Invalidate projects cache
    projectsCache.flushAll();
    console.log('🗑️  Projects cache cleared after delete');
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}

// ============================================
// NEWSLETTERS FUNCTIONS
// ============================================

/**
 * Create a new newsletter
 */
async function createNewsletter(newsletterData) {
  const params = {
    TableName: NEWSLETTERS_TABLE,
    Item: newsletterData
  };

  try {
    await dynamoDB.put(params).promise();
    newslettersCache.flushAll();
    console.log('🗑️  Newsletters cache cleared after create');
    return { success: true, data: newsletterData };
  } catch (error) {
    console.error('Error creating newsletter:', error);
    throw error;
  }
}

/**
 * Get all newsletters
 */
async function getAllNewsletters() {
  const cacheKey = 'all_newsletters';
  const cached = newslettersCache.get(cacheKey);
  if (cached) {
    console.log('✅ Cache HIT: all_newsletters');
    return { success: true, data: cached };
  }
  
  console.log('❌ Cache MISS: all_newsletters - Fetching from DynamoDB');
  
  const params = { TableName: NEWSLETTERS_TABLE };

  try {
    const result = await dynamoDB.scan(params).promise();
    // Filter only published newsletters for public
    const publishedItems = result.Items.filter(item => item.status === 'published');
    const sortedItems = publishedItems.sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return b.month - a.month;
    });
    
    newslettersCache.set(cacheKey, sortedItems);
    console.log(`💾 Cached ${sortedItems.length} newsletters`);
    return { success: true, data: sortedItems };
  } catch (error) {
    console.error('Error getting newsletters:', error);
    throw error;
  }
}

/**
 * Get all newsletters including drafts (Admin only)
 */
async function getAllNewslettersAdmin() {
  const cacheKey = 'all_newsletters_admin';
  const cached = newslettersCache.get(cacheKey);
  if (cached) {
    console.log('✅ Cache HIT: all_newsletters_admin');
    return { success: true, data: cached };
  }
  
  const params = { TableName: NEWSLETTERS_TABLE };

  try {
    const result = await dynamoDB.scan(params).promise();
    const sortedItems = result.Items.sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return b.month - a.month;
    });
    
    newslettersCache.set(cacheKey, sortedItems);
    return { success: true, data: sortedItems };
  } catch (error) {
    console.error('Error getting newsletters:', error);
    throw error;
  }
}

/**
 * Get newsletter by slug
 */
async function getNewsletterBySlug(slug) {
  const cacheKey = `newsletter_slug_${slug}`;
  const cached = newslettersCache.get(cacheKey);
  if (cached) {
    console.log(`✅ Cache HIT: newsletter_slug_${slug}`);
    return { success: true, data: cached };
  }
  
  const params = {
    TableName: NEWSLETTERS_TABLE,
    FilterExpression: 'slug = :slug',
    ExpressionAttributeValues: {
      ':slug': slug
    }
  };

  try {
    const result = await dynamoDB.scan(params).promise();
    if (!result.Items || result.Items.length === 0) {
      return { success: false, error: 'Newsletter not found' };
    }
    
    const newsletter = result.Items[0];
    newslettersCache.set(cacheKey, newsletter);
    return { success: true, data: newsletter };
  } catch (error) {
    console.error('Error getting newsletter by slug:', error);
    throw error;
  }
}

/**
 * Increment newsletter views
 */
async function incrementNewsletterViews(id) {
  const params = {
    TableName: NEWSLETTERS_TABLE,
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

  try {
    await dynamoDB.update(params).promise();
    newslettersCache.del(`newsletter_${id}`);
    return { success: true };
  } catch (error) {
    console.error('Error incrementing views:', error);
    return { success: false };
  }
}

/**
 * Get latest newsletter
 */
async function getLatestNewsletter() {
  const cacheKey = 'latest_newsletter';
  const cached = newslettersCache.get(cacheKey);
  if (cached) {
    console.log('✅ Cache HIT: latest_newsletter');
    return { success: true, data: cached };
  }
  
  try {
    const result = await getAllNewsletters();
    if (!result.success || result.data.length === 0) {
      return { success: false, error: 'No newsletters found' };
    }
    
    const latest = result.data[0];
    newslettersCache.set(cacheKey, latest);
    return { success: true, data: latest };
  } catch (error) {
    console.error('Error getting latest newsletter:', error);
    throw error;
  }
}

/**
 * Get newsletter by ID
 */
async function getNewsletterById(id) {
  const cacheKey = `newsletter_${id}`;
  const cached = newslettersCache.get(cacheKey);
  if (cached) {
    console.log(`✅ Cache HIT: newsletter_${id}`);
    return { success: true, data: cached };
  }
  
  const params = {
    TableName: NEWSLETTERS_TABLE,
    Key: { id }
  };

  try {
    const result = await dynamoDB.get(params).promise();
    if (!result.Item) return { success: false, error: 'Newsletter not found' };
    
    newslettersCache.set(cacheKey, result.Item);
    return { success: true, data: result.Item };
  } catch (error) {
    console.error('Error getting newsletter:', error);
    throw error;
  }
}

/**
 * Update newsletter
 */
async function updateNewsletter(id, newsletterData) {
  try {
    const currentResult = await getNewsletterById(id);
    if (!currentResult.success) return { success: false, error: 'Newsletter not found' };

    const mergedData = {
      ...currentResult.data,
      ...newsletterData
    };

    const params = {
      TableName: NEWSLETTERS_TABLE,
      Item: mergedData
    };

    await dynamoDB.put(params).promise();
    newslettersCache.flushAll();
    console.log('🗑️  Newsletters cache cleared after update');
    return { success: true, data: mergedData };
  } catch (error) {
    console.error('Error updating newsletter:', error);
    throw error;
  }
}

/**
 * Delete newsletter
 */
async function deleteNewsletter(id) {
  const params = {
    TableName: NEWSLETTERS_TABLE,
    Key: { id }
  };

  try {
    await dynamoDB.delete(params).promise();
    newslettersCache.flushAll();
    console.log('🗑️  Newsletters cache cleared after delete');
    return { success: true };
  } catch (error) {
    console.error('Error deleting newsletter:', error);
    throw error;
  }
}

// ============================================
// CUSTOMER USERS FUNCTIONS
// ============================================

/**
 * Get customer by username
 */
async function getCustomerByUsername(username) {
  const params = {
    TableName: CUSTOMERS_TABLE,
    FilterExpression: 'username = :username',
    ExpressionAttributeValues: {
      ':username': username
    }
  };

  try {
    const result = await dynamoDB.scan(params).promise();
    return result.Items && result.Items.length > 0 ? result.Items[0] : null;
  } catch (error) {
    console.error('Error getting customer:', error);
    throw error;
  }
}

/**
 * Get customer by ID
 */
async function getCustomerById(customerId) {
  const cacheKey = `customer_${customerId}`;
  const cached = customersCache.get(cacheKey);
  if (cached) {
    console.log(`✅ Cache HIT: customer_${customerId}`);
    return { success: true, data: cached };
  }

  const params = {
    TableName: CUSTOMERS_TABLE,
    Key: { customerId }
  };

  try {
    const result = await dynamoDB.get(params).promise();
    if (!result.Item) {
      return { success: false, error: 'Customer not found' };
    }
    customersCache.set(cacheKey, result.Item);
    return { success: true, data: result.Item };
  } catch (error) {
    console.error('Error getting customer by ID:', error);
    throw error;
  }
}

/**
 * Create customer user
 */
async function createCustomerUser(customerData) {
  const params = {
    TableName: CUSTOMERS_TABLE,
    Item: customerData
  };

  try {
    await dynamoDB.put(params).promise();
    customersCache.flushAll();
    console.log('🗑️  Customers cache cleared after create');
    return { success: true, data: customerData };
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
}

/**
 * Update customer user
 */
async function updateCustomerUser(customerId, customerData) {
  try {
    const currentResult = await getCustomerById(customerId);
    if (!currentResult.success) {
      return { success: false, error: 'Customer not found' };
    }

    const mergedData = {
      ...currentResult.data,
      ...customerData,
      updatedAt: new Date().toISOString()
    };

    const params = {
      TableName: CUSTOMERS_TABLE,
      Item: mergedData
    };

    await dynamoDB.put(params).promise();
    customersCache.flushAll();
    console.log('🗑️  Customers cache cleared after update');
    return { success: true, data: mergedData };
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
}

/**
 * Delete customer user
 */
async function deleteCustomerUser(customerId) {
  const params = {
    TableName: CUSTOMERS_TABLE,
    Key: { customerId }
  };

  try {
    await dynamoDB.delete(params).promise();
    customersCache.flushAll();
    console.log('🗑️  Customers cache cleared after delete');
    return { success: true };
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
}

/**
 * Get all customers
 */
async function getAllCustomers() {
  const cacheKey = 'all_customers';
  const cached = customersCache.get(cacheKey);
  if (cached) {
    console.log('✅ Cache HIT: all_customers');
    return { success: true, data: cached };
  }

  const params = {
    TableName: CUSTOMERS_TABLE
  };

  try {
    const result = await dynamoDB.scan(params).promise();
    const sortedItems = result.Items.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    customersCache.set(cacheKey, sortedItems);
    console.log(`💾 Cached ${sortedItems.length} customers`);
    return { success: true, data: sortedItems };
  } catch (error) {
    console.error('Error getting customers:', error);
    throw error;
  }
}

/**
 * Get projects for a specific customer
 */
async function getCustomerProjects(customerId) {
  const cacheKey = `customer_projects_${customerId}`;
  const cached = projectsCache.get(cacheKey);
  if (cached) {
    console.log(`✅ Cache HIT: customer_projects_${customerId}`);
    return { success: true, data: cached };
  }

  try {
    // First get customer to get their projectIds
    const customerResult = await getCustomerById(customerId);
    if (!customerResult.success) {
      return { success: false, error: 'Customer not found' };
    }

    const projectIds = customerResult.data.projectIds || [];
    
    if (projectIds.length === 0) {
      return { success: true, data: [] };
    }

    // Fetch all projects for this customer
    const projectPromises = projectIds.map(projectId => 
      dynamoDB.get({
        TableName: PROJECTS_TABLE,
        Key: { id: projectId }
      }).promise()
    );

    const results = await Promise.all(projectPromises);
    const projects = results
      .filter(r => r.Item)
      .map(r => r.Item)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    projectsCache.set(cacheKey, projects);
    console.log(`💾 Cached ${projects.length} projects for customer ${customerId}`);
    return { success: true, data: projects };
  } catch (error) {
    console.error('Error getting customer projects:', error);
    throw error;
  }
}

/**
 * Update customer last login
 */
async function updateCustomerLastLogin(customerId) {
  const params = {
    TableName: CUSTOMERS_TABLE,
    Key: { customerId },
    UpdateExpression: 'SET lastLogin = :lastLogin',
    ExpressionAttributeValues: {
      ':lastLogin': new Date().toISOString()
    }
  };

  try {
    await dynamoDB.update(params).promise();
    customersCache.del(`customer_${customerId}`);
  } catch (error) {
    console.error('Error updating customer last login:', error);
  }
}
