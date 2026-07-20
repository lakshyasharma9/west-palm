// API Base URL - uses VITE_API_URL env var in production, falls back to localhost for dev
const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) 
  ? import.meta.env.VITE_API_URL 
  : 'http://localhost:3001/api';

// Get token from localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('wpcs_admin_token');
  }
  return null;
};

// Set token in localStorage
const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('wpcs_admin_token', token);
  }
};

// Remove token from localStorage
const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('wpcs_admin_token');
  }
};

/**
 * Admin Login
 */
export async function login(email: string, password: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success && data.data.token) {
      setToken(data.data.token);
      return { success: true, data: data.data };
    } else {
      return { success: false, error: data.message || 'Login failed' };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

/**
 * Logout
 */
export function logout() {
  removeToken();
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  return !!getToken();
}

/**
 * Get all queries
 */
export async function getQueries(status?: 'pending' | 'resolved') {
  try {
    const url = status
      ? `${API_BASE_URL}/queries?status=${status}`
      : `${API_BASE_URL}/queries`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      return { success: true, queries: data.data.queries };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Get queries error:', error);
    return { success: false, error: 'Failed to fetch queries' };
  }
}

/**
 * Get single query by ID
 */
export async function getQueryById(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/queries/${id}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      return { success: true, query: data.data };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Get query error:', error);
    return { success: false, error: 'Failed to fetch query' };
  }
}

/**
 * Update query status
 */
export async function updateQueryStatus(id: string, status: 'pending' | 'resolved') {
  try {
    const response = await fetch(`${API_BASE_URL}/queries/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();

    if (data.success) {
      return { success: true, query: data.data };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Update query error:', error);
    return { success: false, error: 'Failed to update query' };
  }
}

/**
 * Delete query
 */
export async function deleteQuery(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/queries/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      return { success: true };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Delete query error:', error);
    return { success: false, error: 'Failed to delete query' };
  }
}

/**
 * Download attachment from query
 */
export async function downloadAttachment(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/queries/${id}/download`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      return { success: true, downloadUrl: data.data.downloadUrl, fileName: data.data.fileName };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Download attachment error:', error);
    return { success: false, error: 'Failed to get download URL' };
  }
}

// ============================================
// PROJECTS API
// ============================================

/**
 * Get all projects
 */
export async function getProjects() {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`);
    const data = await response.json();

    if (data.success) {
      return { success: true, projects: data.data.projects };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Get projects error:', error);
    return { success: false, error: 'Failed to fetch projects' };
  }
}

/**
 * Get single project by ID
 */
export async function getProjectById(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`);
    const data = await response.json();

    if (data.success) {
      return { success: true, project: data.data };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Get project error:', error);
    return { success: false, error: 'Failed to fetch project' };
  }
}

/**
 * Upload file to S3 using presigned URL
 * Includes automatic retry with exponential backoff for transient network errors.
 */
export async function uploadToS3(file: File, onProgress?: (progress: number) => void) {
  const MAX_RETRIES = 3;

  // Step 1: Get presigned URL (with retry)
  let urlData: any = null;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const urlResponse = await fetch(`${API_BASE_URL}/upload/url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });
      urlData = await urlResponse.json();
      console.log('Upload URL Response:', urlData);
      if (urlData.success) break;
      // Non-success response — don't retry auth/validation errors
      console.error('Upload URL Error:', urlData.message);
      return { success: false, error: urlData.message || 'Failed to get upload URL' };
    } catch (err) {
      console.warn(`Get presigned URL attempt ${attempt} failed:`, err);
      if (attempt === MAX_RETRIES) {
        return { success: false, error: 'Failed to get upload URL after retries' };
      }
      // Exponential backoff: 500ms, 1000ms, 2000ms
      await new Promise(r => setTimeout(r, 500 * attempt));
    }
  }

  if (!urlData?.success) {
    return { success: false, error: 'Failed to get upload URL' };
  }

  const { uploadUrl, fileKey, fileUrl } = urlData.data;

  // Step 2: Upload to S3 with retry
  // Use fetch() instead of XHR — more resilient to network changes
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Report progress as indeterminate during fetch (fetch doesn't support upload progress)
      if (onProgress) onProgress(attempt === 1 ? 10 : 50);

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (uploadResponse.ok || uploadResponse.status === 200) {
        if (onProgress) onProgress(100);
        return { success: true, fileKey, fileUrl };
      }

      console.warn(`S3 upload attempt ${attempt} returned status ${uploadResponse.status}`);
      if (attempt === MAX_RETRIES) {
        return { success: false, error: `Upload failed with status ${uploadResponse.status}` };
      }
    } catch (err: any) {
      console.warn(`S3 upload attempt ${attempt} failed:`, err?.message ?? err);
      if (attempt === MAX_RETRIES) {
        return { success: false, error: 'Upload failed after multiple retries. Please check your connection and try again.' };
      }
    }
    // Exponential backoff before retry
    await new Promise(r => setTimeout(r, 800 * attempt));
  }

  return { success: false, error: 'Upload failed' };
}

/**
 * Create project
 */
export async function createProject(projectData: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(projectData),
    });

    const data = await response.json();

    if (data.success) {
      return { success: true, project: data.data };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Create project error:', error);
    return { success: false, error: 'Failed to create project' };
  }
}

/**
 * Update project
 */
export async function updateProject(id: string, projectData: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(projectData),
    });

    const data = await response.json();

    if (data.success) {
      return { success: true, project: data.data };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Update project error:', error);
    return { success: false, error: 'Failed to update project' };
  }
}

/**
 * Upload multiple files to S3
 */
export async function uploadMultipleToS3(
  files: File[],
  onProgress?: (fileIndex: number, progress: number) => void
) {
  const results = [];
  
  for (let i = 0; i < files.length; i++) {
    const result = await uploadToS3(files[i], (progress) => {
      if (onProgress) onProgress(i, progress);
    });
    results.push(result);
    
    if (!result.success) {
      return { success: false, error: result.error, uploadedCount: i };
    }
  }
  
  return { success: true, results };
}

/**
 * Get all newsletters
 */
export async function getNewsletters() {
  try {
    const response = await fetch(`${API_BASE_URL}/newsletters`);
    const data = await response.json();

    if (data.success) {
      return { success: true, newsletters: data.data.newsletters };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Get newsletters error:', error);
    return { success: false, error: 'Failed to fetch newsletters' };
  }
}

/**
 * Get single newsletter by ID
 */
export async function getNewsletterById(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/newsletters/${id}`);
    const data = await response.json();

    if (data.success) {
      return { success: true, newsletter: data.data };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Get newsletter error:', error);
    return { success: false, error: 'Failed to fetch newsletter' };
  }
}

/**
 * Create newsletter
 */
export async function createNewsletter(newsletterData: any) {
  try {
    const token = getToken();
    if (!token) {
      if (typeof window !== 'undefined') window.location.href = '/login';
      throw new Error('Not authenticated. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/newsletters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(newsletterData),
    });

    const data = await response.json();

    if (response.status === 401 || response.status === 403) {
      removeToken();
      if (typeof window !== 'undefined') window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }

    if (data.success) {
      return { success: true, newsletter: data.data };
    } else {
      throw new Error(data.message || 'Failed to create newsletter');
    }
  } catch (error: any) {
    console.error('Create newsletter error:', error);
    throw error;
  }
}

/**
 * Update newsletter
 */
export async function updateNewsletter(id: string, newsletterData: any) {
  try {
    const token = getToken();
    if (!token) {
      // No token — redirect to login
      if (typeof window !== 'undefined') window.location.href = '/login';
      throw new Error('Not authenticated. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/newsletters/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(newsletterData),
    });

    const data = await response.json();

    if (response.status === 401 || response.status === 403) {
      // Token expired — clear it and redirect to login
      removeToken();
      if (typeof window !== 'undefined') window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }

    if (data.success) {
      return { success: true, newsletter: data.data };
    } else {
      throw new Error(data.message || 'Failed to update newsletter');
    }
  } catch (error: any) {
    console.error('Update newsletter error:', error);
    throw error;
  }
}

export async function getNewsletterBySlug(slug: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/newsletters/slug/${slug}`);
    const data = await response.json();

    if (data.success) {
      return { success: true, newsletter: data.data };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Get newsletter by slug error:', error);
    return { success: false, error: 'Failed to fetch newsletter' };
  }
}

/**
 * Delete newsletter
 */
export async function deleteNewsletter(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/newsletters/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      return { success: true };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Delete newsletter error:', error);
    return { success: false, error: 'Failed to delete newsletter' };
  }
}

// ============================================
// NEWS API
// ============================================

/**
 * Get all news
 */
export async function getNews(status?: string) {
  try {
    const url = status
      ? `${API_BASE_URL}/news?status=${status}`
      : `${API_BASE_URL}/news`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.success) {
      return { success: true, news: data.data.news };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Get news error:', error);
    return { success: false, error: 'Failed to fetch news' };
  }
}

/**
 * Get latest news
 */
export async function getLatestNews(limit: number = 5) {
  try {
    const response = await fetch(`${API_BASE_URL}/news/latest?limit=${limit}`);
    const data = await response.json();

    if (data.success) {
      return { success: true, news: data.data.news };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Get latest news error:', error);
    return { success: false, error: 'Failed to fetch latest news' };
  }
}

/**
 * Get single news by ID
 */
export async function getNewsById(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/news/${id}`);
    const data = await response.json();

    if (data.success) {
      return { success: true, news: data.data };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Get news error:', error);
    return { success: false, error: 'Failed to fetch news' };
  }
}

/**
 * Create news
 */
export async function createNews(newsData: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(newsData),
    });

    const data = await response.json();

    if (data.success) {
      return { success: true, news: data.data };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Create news error:', error);
    return { success: false, error: 'Failed to create news' };
  }
}

/**
 * Update news
 */
export async function updateNews(id: string, newsData: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/news/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(newsData),
    });

    const data = await response.json();

    if (data.success) {
      return { success: true, news: data.data };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Update news error:', error);
    return { success: false, error: 'Failed to update news' };
  }
}

/**
 * Delete news
 */
export async function deleteNews(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/news/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      return { success: true };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Delete news error:', error);
    return { success: false, error: 'Failed to delete news' };
  }
}

// ============================================
// CUSTOMER API
// ============================================

/**
 * Customer Login
 */
export async function customerLogin(username: string, password: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/customer/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (data.success && data.data.token) {
      setToken(data.data.token);
      return { success: true, data: data.data };
    } else {
      return { success: false, error: data.message || 'Login failed' };
    }
  } catch (error) {
    console.error('Customer login error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

/**
 * Get customer projects
 */
export async function getCustomerProjects() {
  try {
    const response = await fetch(`${API_BASE_URL}/customer/projects`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      return { 
        success: true, 
        projects: data.data.projects,
        customerInfo: data.data.customerInfo 
      };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Get customer projects error:', error);
    return { success: false, error: 'Failed to fetch projects' };
  }
}

// ============================================
// ADMIN - CUSTOMER MANAGEMENT API
// ============================================

/**
 * Create customer account (Admin only)
 */
export async function createCustomer(customerData: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(customerData),
    });

    const data = await response.json();

    if (data.success) {
      return { success: true, customer: data.data };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Create customer error:', error);
    return { success: false, error: 'Failed to create customer' };
  }
}

/**
 * Get all customers (Admin only)
 */
export async function getCustomers() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/customers`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      return { success: true, customers: data.data.customers };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Get customers error:', error);
    return { success: false, error: 'Failed to fetch customers' };
  }
}

/**
 * Update customer account (Admin only)
 */
export async function updateCustomer(id: string, customerData: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/customers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(customerData),
    });

    const data = await response.json();

    if (data.success) {
      return { success: true, customer: data.data };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Update customer error:', error);
    return { success: false, error: 'Failed to update customer' };
  }
}

/**
 * Delete customer account (Admin only)
 */
export async function deleteCustomer(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/customers/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      return { success: true };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Delete customer error:', error);
    return { success: false, error: 'Failed to delete customer' };
  }
}
