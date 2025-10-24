// API Service - Centralized API communication layer
class ApiService {
  constructor() {
    this.baseUrl = CONFIG.API.BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
  }

  // Generic API call method
  async call(endpoint, options = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const config = {
        headers: { ...this.defaultHeaders, ...options.headers },
        ...options
      };

      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data: data.data, pagination: data.pagination };
    } catch (error) {
      console.error('API call failed:', error);
      
      // Check if it's a network error (server not running)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return { success: false, error: 'Unable to connect to server. Please ensure the backend is running.' };
      }
      
      return { success: false, error: error.message };
    }
  }

  // Blog-specific API methods
  async getBlogs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `${CONFIG.API.ENDPOINTS.BLOGS}${queryString ? `?${queryString}` : ''}`;
    return this.call(endpoint);
  }

  async getBlogById(id) {
    return this.call(`${CONFIG.API.ENDPOINTS.BLOGS}/${id}`);
  }

  async getBlogBySlug(slug) {
    return this.call(`${CONFIG.API.ENDPOINTS.BLOGS}/${slug}`);
  }

  async createBlog(blogData) {
    return this.call(CONFIG.API.ENDPOINTS.BLOGS, {
      method: 'POST',
      body: JSON.stringify(blogData)
    });
  }

  async updateBlog(id, blogData) {
    return this.call(`${CONFIG.API.ENDPOINTS.BLOGS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(blogData)
    });
  }

  async deleteBlog(id) {
    return this.call(`${CONFIG.API.ENDPOINTS.BLOGS}/${id}`, {
      method: 'DELETE'
    });
  }

  async getBlogCategories() {
    return this.call(CONFIG.API.ENDPOINTS.BLOG_CATEGORIES);
  }

  async getBlogTags() {
    return this.call(CONFIG.API.ENDPOINTS.BLOG_TAGS);
  }

  // Upload methods
  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${this.baseUrl}${CONFIG.API.ENDPOINTS.UPLOAD}`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return { success: true, url: result.data.url };
    } catch (error) {
      console.error('Image upload failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Submission methods
  async createSubmission(submissionData) {
    return this.call(CONFIG.API.ENDPOINTS.SUBMISSIONS, {
      method: 'POST',
      body: JSON.stringify(submissionData)
    });
  }

  // Helper methods for common blog queries
  async getRecentBlogs(limit = 3) {
    const result = await this.getBlogs({
      limit,
      status: 'published',
      sortBy: 'publishedAt',
      sortOrder: 'desc'
    });
    
    // If API fails, return mock data for development
    if (!result.success) {
      console.warn('API failed, returning mock data for recent blogs');
      return {
        success: true,
        data: {
          blogs: this.getMockRecentBlogs(limit)
        }
      };
    }
    
    return result;
  }
  
  // Mock data for development when API is not available
  getMockRecentBlogs(limit = 3) {
    const mockBlogs = [
      {
        _id: 'mock1',
        title: 'Breaking the Challan Exploitation: A Citizen\'s Victory',
        excerpt: 'Our first major breakthrough in reforming Patna\'s traffic challan system shows how organized citizen action can challenge unfair practices.',
        category: 'Reform Victory',
        authorName: 'Vishal Singh',
        publishedAt: '2025-01-15T00:00:00Z',
        readTime: '5 min read',
        featuredImage: 'https://images.unsplash.com/photo-1668149941577-7473eb4ac060?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=600',
        author: { avatar: Utils.getImageUrl(CONFIG.DEFAULTS.AUTHOR_IMAGE) }
      },
      {
        _id: 'mock2',
        title: 'Youth for Bihar: The New Generation of Change-Makers',
        excerpt: 'How young professionals and students are becoming the backbone of our civic reform movement.',
        category: 'Youth Power',
        authorName: 'Vishal Singh',
        publishedAt: '2025-01-10T00:00:00Z',
        readTime: '4 min read',
        featuredImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=600',
        author: { avatar: Utils.getImageUrl(CONFIG.DEFAULTS.AUTHOR_IMAGE) }
      },
      {
        _id: 'mock3',
        title: 'Building Self-Governance: Ward-Level Democracy in Action',
        excerpt: 'Our pilot program for decentralized decision-making is showing promising results.',
        category: 'Governance',
        authorName: 'Vishal Singh',
        publishedAt: '2025-01-05T00:00:00Z',
        readTime: '6 min read',
        featuredImage: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=600',
        author: { avatar: Utils.getImageUrl(CONFIG.DEFAULTS.AUTHOR_IMAGE) }
      }
    ];
    
    return mockBlogs.slice(0, limit);
  }

  async getBlogsByCategory(category, limit = 10) {
    return this.getBlogs({
      category,
      limit,
      status: 'published',
      sortBy: 'publishedAt',
      sortOrder: 'desc'
    });
  }

  async searchBlogs(query, limit = 10) {
    return this.getBlogs({
      search: query,
      limit,
      status: 'published',
      sortBy: 'publishedAt',
      sortOrder: 'desc'
    });
  }

  async getRelatedBlogs(category, excludeId, limit = 3) {
    const result = await this.getBlogsByCategory(category, limit + 1);
    if (result.success && result.data.blogs) {
      result.data.blogs = result.data.blogs
        .filter(blog => blog._id !== excludeId)
        .slice(0, limit);
    }
    return result;
  }
}

// Create global instance
if (typeof window !== 'undefined') {
  window.apiService = new ApiService();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiService;
}
