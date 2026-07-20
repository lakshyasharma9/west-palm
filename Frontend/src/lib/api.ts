// Environment variable validation - relaxed for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const S3_BUCKET_URL = process.env.NEXT_PUBLIC_S3_BUCKET_URL || 'https://west-palm-files.s3.eu-north-1.amazonaws.com';

// Fetch with a hard timeout so the page never hangs indefinitely
// when the backend is down or slow to respond.
async function fetchWithTimeout(url: string, options: RequestInit & { next?: any } = {}, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

if (process.env.NODE_ENV === 'production') {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    console.error('⚠️ NEXT_PUBLIC_API_URL not set in production');
  }
  if (!process.env.NEXT_PUBLIC_S3_BUCKET_URL) {
    console.error('⚠️ NEXT_PUBLIC_S3_BUCKET_URL not set in production');
  }
}

export async function getProjects() {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/projects`, {
      next: { 
        revalidate: 30,
        tags: ['projects']
      }
    });
    const data = await response.json();
    
    if (data.success) {
      return data.data.projects;
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return [];
  }
}

export async function getNewsletters() {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/newsletters`, {
      next: { 
        revalidate: 300,
        tags: ['newsletters']
      }
    });
    const data = await response.json();
    
    if (data.success) {
      return data.data.newsletters;
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch newsletters:', error);
    return [];
  }
}

export async function getNewsletterById(id: string) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/newsletters/${id}`, {
      next: { 
        revalidate: 300,
        tags: ['newsletters', `newsletter-${id}`]
      }
    });
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch newsletter:', error);
    return null;
  }
}

export async function getNewsletterBySlug(slug: string) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/newsletters/slug/${slug}`, {
      next: { 
        revalidate: 300,
        tags: ['newsletters', `newsletter-slug-${slug}`]
      }
    });
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch newsletter by slug:', error);
    return null;
  }
}

export async function getProjectById(id: string) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/projects/${id}`, {
      next: { 
        revalidate: 60,
        tags: ['projects', `project-${id}`]
      }
    });
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch project:', error);
    return null;
  }
}

export function getS3ImageUrl(url: string) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  if (url.startsWith('data:')) return url;
  if (url.startsWith('projects/') || url.startsWith('attachments/')) {
    return `${S3_BUCKET_URL}/${url}`;
  }
  return url;
}

// ============================================
// NEWS API
// ============================================

export async function getLatestNews(limit: number = 5) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/news/latest?limit=${limit}`, {
      next: { 
        revalidate: 300,
        tags: ['news']
      }
    });
    const data = await response.json();
    
    if (data.success) {
      return data.data.news;
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch latest news:', error);
    return [];
  }
}

export async function getNews() {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/news`, {
      next: { 
        revalidate: 300,
        tags: ['news']
      }
    });
    const data = await response.json();
    
    if (data.success) {
      return data.data.news;
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch news:', error);
    return [];
  }
}

export async function getNewsById(id: string) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/news/${id}`, {
      next: { 
        revalidate: 300,
        tags: ['news', `news-${id}`]
      }
    });
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch news:', error);
    return null;
  }
}
