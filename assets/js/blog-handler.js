// Blog Handler - React-like patterns for blog functionality
class BlogHandler {
  constructor() {
    // Wait for CONFIG and apiService to be available
    if (typeof CONFIG === 'undefined') {
      console.error('CONFIG not loaded. Please include config.js before blog-handler.js');
      return;
    }
    if (typeof apiService === 'undefined') {
      console.error('ApiService not loaded. Please include api-service.js before blog-handler.js');
      return;
    }
    
    this.api = apiService;
    this.isRendering = false;
    this.relatedBlogsLoaded = false;
    this.state = {
      blogs: [],
      currentBlog: null,
      loading: false,
      error: null,
      pagination: {
        current: 1,
        pages: 1,
        total: 0,
        limit: CONFIG.APP.BLOG_PAGINATION_LIMIT
      },
      filters: {
        category: '',
        search: ''
      }
    };
    this.searchDebounced = Utils.debounce(this.performSearch.bind(this), CONFIG.APP.SEARCH_DEBOUNCE_TIME);
    this.init();
  }

  // Initialize the handler
  init() {
    this.bindEvents();
    this.loadInitialData();
  }

  // Bind event listeners
  bindEvents() {
    // Load more button
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => this.loadMoreBlogs());
    }

    // Blog form submission
    const blogForm = document.getElementById('blogSubmissionForm');
    if (blogForm) {
      blogForm.addEventListener('submit', (e) => this.handleBlogSubmission(e));
    }

    // Search functionality
    const searchInput = document.querySelector('.blog-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }

    // Category filters
    const categoryFilters = document.querySelectorAll('.category-filter');
    categoryFilters.forEach(filter => {
      filter.addEventListener('click', (e) => this.handleCategoryFilter(e.target.dataset.category));
    });
  }

  // Load initial data based on page
  loadInitialData() {
    const currentPage = this.getCurrentPage();
    
    // Show fallback content immediately for better UX
    if (currentPage === 'blog') {
      // Show featured blog fallback after 2 seconds if no data
      setTimeout(() => {
        const placeholder = document.getElementById('featuredBlogPlaceholder');
        const fallback = document.getElementById('featuredBlogFallback');
        if (placeholder && placeholder.style.display !== 'none' && fallback) {
          placeholder.style.display = 'none';
          fallback.classList.remove('hidden');
        }
      }, 2000);
    }
    
    switch (currentPage) {
      case 'blog':
        this.loadBlogs();
        // Also immediately try to render featured blog with any existing data
        if (this.state.blogs.length > 0) {
          this.renderFeaturedBlog(this.state.blogs);
        }
        break;
      case 'blog-details':
        this.loadBlogDetails();
        break;
      case 'index':
        this.loadRecentBlogs();
        break;
    }
  }

  // Get current page type
  getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('blog-details.html')) return 'blog-details';
    if (path.includes('blog.html')) return 'blog';
    return 'index';
  }

  // API call wrapper with loading state management
  async apiCall(apiMethod, ...args) {
    try {
      this.setState({ loading: true, error: null }, false); // Don't trigger render during loading
      const result = await apiMethod.apply(this.api, args);
      
      if (!result.success) {
        this.setState({ loading: false, error: result.error });
        Utils.showNotification(result.error || CONFIG.MESSAGES.ERRORS.NETWORK, 'error');
      }
      
      return result;
    } catch (error) {
      console.error('API call failed:', error);
      this.setState({ loading: false, error: error.message });
      Utils.showNotification(CONFIG.MESSAGES.ERRORS.NETWORK, 'error');
      return { success: false, error: error.message };
    }
  }

  // State management (React-like)
  setState(newState, shouldRender = true) {
    this.state = { ...this.state, ...newState };
    if (shouldRender && !this.isRendering) {
      this.render();
    }
  }

  // Load blogs for blog page
  async loadBlogs(page = 1, category = '', search = '', append = false) {
    const params = {
      page: page.toString(),
      limit: this.state.pagination.limit.toString(),
      status: 'published',
      sortBy: 'publishedAt',
      sortOrder: 'desc'
    };

    if (category) params.category = category;
    if (search) params.search = search;

    const result = await this.apiCall(this.api.getBlogs, params);
    
    if (result && result.success) {
      const newBlogs = append ? [...this.state.blogs, ...result.data.blogs] : result.data.blogs;
      this.setState({
        blogs: newBlogs,
        pagination: result.pagination,
        filters: { category, search }
      });
      
      // Load featured blog if this is the first page and not appending
      if (page === 1 && !append) {
        console.log('Rendering featured blog with', newBlogs.length, 'blogs');
        this.renderFeaturedBlog(newBlogs);
      }
      
      // Update URL parameters
      Utils.updateUrl('page', page > 1 ? page : null);
      Utils.updateUrl('category', category || null);
      Utils.updateUrl('search', search || null);
    } else {
      // If API call fails, still try to render featured blog with empty array (will show fallback)
      if (page === 1 && !append) {
        console.log('API call failed, showing featured blog fallback');
        this.renderFeaturedBlog([]);
      }
    }
  }

  // Load recent blogs for homepage
  async loadRecentBlogs() {
    try {
      const result = await this.apiCall(this.api.getRecentBlogs, CONFIG.APP.RECENT_BLOGS_LIMIT);
      
      if (result && result.success) {
        this.setState({ blogs: result.data.blogs });
        this.renderRecentBlogs();
      } else {
        // Handle error case - hide loading and show error message
        const loadingSpinner = document.getElementById('recentBlogsLoading');
        if (loadingSpinner) {
          loadingSpinner.style.display = 'none';
        }
        this.renderRecentBlogs(); // This will show "No recent blogs available"
      }
    } catch (error) {
      console.error('Error loading recent blogs:', error);
      const loadingSpinner = document.getElementById('recentBlogsLoading');
      if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
      }
      // Show fallback content
      const container = document.querySelector('#blogs .grid');
      if (container) {
        container.innerHTML = '<p class="text-center text-gray-500 col-span-full">Unable to load recent blogs. Please try again later.</p>';
      }
    }
  }

  // Load blog details
  async loadBlogDetails() {
    const blogId = this.getBlogIdFromUrl();
    if (!blogId) {
      Utils.showNotification(CONFIG.MESSAGES.ERRORS.BLOG_NOT_FOUND, 'error');
      return;
    }

    // Reset related blogs loaded flag
    this.relatedBlogsLoaded = false;
    
    const result = await this.apiCall(this.api.getBlogById, blogId);
    
    if (result && result.success) {
      // Ensure loading is false when blog is loaded
      this.setState({ currentBlog: result.data.blog, loading: false });
    } else {
      Utils.showNotification(CONFIG.MESSAGES.ERRORS.BLOG_NOT_FOUND, 'error');
      // Hide loading spinner on error
      this.setState({ loading: false });
    }
  }

  // Get blog ID from URL
  getBlogIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || urlParams.get('slug');
  }

  // Handle blog form submission
  async handleBlogSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    // Validate required fields
    const requiredFields = ['authorName', 'authorEmail', 'blogTitle', 'blogCategory', 'readTime', 'blogSummary', 'blogContent'];
    const missingFields = requiredFields.filter(field => !formData.get(field));
    
    if (missingFields.length > 0) {
      Utils.showNotification(CONFIG.MESSAGES.ERRORS.VALIDATION_FAILED, 'error');
      return;
    }
    
    // Validate email
    if (!Utils.isValidEmail(formData.get('authorEmail'))) {
      Utils.showNotification('Please enter a valid email address.', 'error');
      return;
    }
    
    const blogData = {
      title: formData.get('blogTitle'),
      content: formData.get('blogContent'),
      excerpt: formData.get('blogSummary'),
      category: formData.get('blogCategory'),
      tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : [],
      authorName: formData.get('authorName'),
      authorEmail: formData.get('authorEmail'),
      authorBio: formData.get('authorBio') || '',
      readTime: formData.get('readTime'),
      status: 'draft' // Submissions start as drafts
    };

    // Handle image upload if present
    const imageFile = formData.get('blogImage');
    if (imageFile && imageFile.size > 0) {
      const uploadResult = await this.apiCall(this.api.uploadImage, imageFile);
      if (uploadResult && uploadResult.success) {
        blogData.featuredImage = uploadResult.url;
      }
    }

    const result = await this.apiCall(this.api.createSubmission, blogData);

    if (result && result.success) {
      this.showSuccessMessage(CONFIG.MESSAGES.SUCCESS.BLOG_SUBMITTED);
      e.target.reset();
      // Reset Quill editor if available
      if (typeof quill !== 'undefined' && quill) {
        quill.setContents([]);
      }
    } else {
      this.showErrorMessage(CONFIG.MESSAGES.ERRORS.SUBMISSION_FAILED);
    }
  }

  // This method is now handled by the API service

  // Handle search
  handleSearch(query) {
    this.searchDebounced(query);
  }

  // Perform search (debounced)
  async performSearch(query) {
    await this.loadBlogs(1, this.state.filters.category, query);
  }

  // Handle category filter
  async handleCategoryFilter(category) {
    // Update active filter button
    this.updateCategoryButtons(category);
    await this.loadBlogs(1, category, this.state.filters.search);
  }

  // Update category filter buttons
  updateCategoryButtons(activeCategory) {
    const buttons = document.querySelectorAll('.category-filter');
    buttons.forEach(button => {
      const category = button.dataset.category;
      if (category === activeCategory) {
        button.className = 'category-filter bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-secondary transition-colors';
      } else {
        button.className = 'category-filter bg-white text-primary border border-primary px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary hover:text-white transition-colors';
      }
    });
  }

  // Load more blogs
  async loadMoreBlogs() {
    const nextPage = this.state.pagination.current + 1;
    if (nextPage <= this.state.pagination.pages) {
      await this.loadBlogs(nextPage, this.state.filters.category, this.state.filters.search, true);
    }
  }

  // Render methods
  render() {
    if (this.isRendering) return; // Prevent infinite loops
    
    this.isRendering = true;
    const currentPage = this.getCurrentPage();
    
    try {
      switch (currentPage) {
        case 'blog':
          this.renderBlogGrid();
          break;
        case 'blog-details':
          this.renderBlogDetails();
          break;
        case 'index':
          this.renderRecentBlogs();
          break;
      }

      this.renderLoadingState();
    } finally {
      this.isRendering = false;
    }
  }

  // Render blog grid for blog page
  renderBlogGrid() {
    const container = document.querySelector('.blog-grid-container');
    if (!container) return;

    if (this.state.blogs.length === 0 && !this.state.loading) {
      container.innerHTML = '<p class="text-center text-gray-500 col-span-full">No blogs found.</p>';
      return;
    }

    const blogsHtml = this.state.blogs.map(blog => this.createBlogCard(blog)).join('');
    container.innerHTML = blogsHtml;

    // Update load more button
    this.updateLoadMoreButton();
  }

  // Render recent blogs for homepage
  renderRecentBlogs() {
    const container = document.querySelector('#blogs .grid');
    const loadingSpinner = document.getElementById('recentBlogsLoading');
    
    // Hide loading spinner
    if (loadingSpinner) {
      loadingSpinner.style.display = 'none';
    }
    
    if (!container) return;
    
    if (this.state.blogs.length === 0) {
      container.innerHTML = '<p class="text-center text-gray-500 col-span-full">No recent blogs available.</p>';
      return;
    }

    const blogsHtml = this.state.blogs.slice(0, 3).map(blog => this.createBlogCard(blog, true)).join('');
    container.innerHTML = blogsHtml;
  }

  // Render blog details
  renderBlogDetails() {
    if (!this.state.currentBlog) return;

    const blog = this.state.currentBlog;

    // Update page title
    document.title = `${blog.title} - We The People of Patna`;

    // Update header
    this.updateElement('#blogTitle', blog.title);
    this.updateElement('#blogDate', this.formatDate(blog.publishedAt || blog.createdAt));
    this.updateElement('#blogAuthor', blog.authorName);
    this.updateElement('#readTime', blog.readTime);

    // Update featured image
    const featuredImage = document.getElementById('featuredImage');
    const imagePlaceholder = document.getElementById('imagePlaceholder');
    if (featuredImage) {
      const imageUrl = blog.featuredImage ? Utils.getImageUrl(blog.featuredImage) : CONFIG.DEFAULTS.BLOG_IMAGE;
      featuredImage.src = imageUrl;
      featuredImage.alt = blog.title;
      
      // Hide placeholder and show image
      if (imagePlaceholder) {
        imagePlaceholder.style.display = 'none';
      }
      featuredImage.classList.remove('hidden');
      
      // Add fallback for failed image loads
      featuredImage.onerror = function() {
        this.src = CONFIG.DEFAULTS.BLOG_IMAGE;
        this.onerror = null; // Prevent infinite loop
      };
    }

    // Update content
    this.updateElement('#actualContent', blog.content, true);

    // Update author info
    this.updateElement('#authorName', blog.authorName);
    this.updateElement('#authorBio', blog.authorBio);
    
    const authorImage = document.getElementById('authorImage');
    if (authorImage) {
      // Check if author is "Admin User" and use specific image
      if (blog.authorName === 'Admin User') {
        authorImage.src = Utils.getImageUrl('../assets/images/neta g.jpg');
      } else {
        authorImage.src = Utils.getImageUrl(blog.author?.avatar || CONFIG.DEFAULTS.AUTHOR_IMAGE);
      }
    }

    // Update tags
    this.renderTags(blog.tags);

    // Load related blogs (but don't trigger re-render)
    if (!this.relatedBlogsLoaded) {
      this.relatedBlogsLoaded = true;
      this.loadRelatedBlogs(blog.category, blog._id);
    }

    // Show content and hide placeholders
    this.showContent();
    
    // Force hide loading spinner after content is rendered
    setTimeout(() => {
      const spinner = document.getElementById('loadingSpinner');
      if (spinner) spinner.style.display = 'none';
    }, 100);
  }

  // Create blog card HTML
  createBlogCard(blog, isHomepage = false) {
    const categoryClass = this.getCategoryClass(blog.category);
    const linkUrl = isHomepage ? `pages/blog-details.html?id=${blog._id}` : `blog-details.html?id=${blog._id}`;
    
    return `
      <article class="bg-accent border border-light rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
        <div class="relative overflow-hidden">
          <img src="${Utils.getImageUrl(blog.featuredImage || CONFIG.DEFAULTS.BLOG_IMAGE)}" alt="${blog.title}" 
               onerror="this.src='${CONFIG.DEFAULTS.BLOG_IMAGE}'" 
               class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300">
          <div class="absolute top-4 left-4">
            <span class="${categoryClass} text-white px-3 py-1 rounded-full text-sm font-semibold">${blog.category}</span>
          </div>
        </div>
        <div class="p-6">
          <div class="flex items-center gap-3 mb-3 text-sm text-primary/70">
            <i class="fa-solid fa-calendar-days"></i>
            <span>${this.formatDate(blog.publishedAt || blog.createdAt)}</span>
            <span>•</span>
            <span>${blog.readTime}</span>
          </div>
          <h3 class="text-xl font-semibold text-secondary mb-3 group-hover:text-primary transition-colors">
            ${blog.title}
          </h3>
          <p class="text-primary leading-relaxed mb-4">
            ${blog.excerpt}
          </p>
          <div class="flex items-center justify-between pt-4 border-t border-light">
            <div class="flex items-center gap-2">
              <img src="${blog.authorName === 'Admin User' ? Utils.getImageUrl('../assets/images/neta g.jpg') : Utils.getImageUrl(blog.author?.avatar || CONFIG.DEFAULTS.AUTHOR_IMAGE)}" alt="${blog.authorName}"
                   class="w-8 h-8 rounded-full object-cover" />
              <span class="text-primary/70 text-sm">${blog.authorName}</span>
            </div>
            <a href="${linkUrl}" 
               class="text-primary font-semibold hover:text-secondary transition-colors text-sm">
              Read More <i class="fa-solid fa-arrow-right ml-1"></i>
            </a>
          </div>
        </div>
      </article>
    `;
  }

  // Get category CSS class
  getCategoryClass(category) {
    return CONFIG.CATEGORIES[category]?.class || CONFIG.CATEGORIES['Other'].class;
  }

  // Render tags
  renderTags(tags) {
    const tagsList = document.getElementById('tagsList');
    if (!tagsList || !tags || tags.length === 0) return;

    const tagsHtml = tags.map(tag => 
      `<span class="bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold hover:bg-secondary transition-colors cursor-pointer">${tag}</span>`
    ).join('');
    
    tagsList.innerHTML = tagsHtml;
  }

  // Load related blogs
  async loadRelatedBlogs(category, excludeId) {
    try {
      // Don't use apiCall here to avoid setState loop
      this.setState({ loading: true }, false); // Don't trigger render
      const result = await this.api.getRelatedBlogs(category, excludeId, 3);
      this.setState({ loading: false }, false); // Don't trigger render
      
      if (result && result.success) {
        this.renderRelatedBlogs(result.data.blogs);
      } else {
        // Handle error case
        this.renderRelatedBlogs([]);
      }
    } catch (error) {
      console.error('Error loading related blogs:', error);
      this.setState({ loading: false }, false);
      this.renderRelatedBlogs([]);
    }
  }

  // Render related blogs
  renderRelatedBlogs(blogs) {
    const container = document.getElementById('relatedBlogsContainer');
    if (!container) return;

    if (blogs.length === 0) {
      container.innerHTML = '<p class="text-center text-gray-500 col-span-full">No related blogs available.</p>';
      return;
    }

    const blogsHtml = blogs.map(blog => this.createBlogCard(blog)).join('');
    container.innerHTML = blogsHtml;
  }

  // Render featured blog section
  renderFeaturedBlog(blogs) {
    console.log('renderFeaturedBlog called with:', blogs);
    const placeholder = document.getElementById('featuredBlogPlaceholder');
    const content = document.getElementById('featuredBlogContent');
    const fallback = document.getElementById('featuredBlogFallback');

    if (!placeholder || !content || !fallback) {
      console.log('Featured blog elements not found');
      return;
    }

    // Hide placeholder immediately
    placeholder.style.display = 'none';

    if (blogs && blogs.length > 0) {
      const featuredBlog = blogs[0]; // Use the most recent blog as featured
      console.log('Rendering featured blog:', featuredBlog.title);
      
      // Batch DOM updates for better performance
      const elements = {
        title: document.getElementById('featuredBlogTitle'),
        excerpt: document.getElementById('featuredBlogExcerpt'),
        date: document.getElementById('featuredBlogDate'),
        readTime: document.getElementById('featuredBlogReadTime'),
        category: document.getElementById('featuredBlogCategory'),
        authorName: document.getElementById('featuredBlogAuthorName'),
        authorBio: document.getElementById('featuredBlogAuthorBio'),
        image: document.getElementById('featuredBlogImage'),
        authorImage: document.getElementById('featuredBlogAuthorImage'),
        link: document.getElementById('featuredBlogLink')
      };

      // Update text content
      if (elements.title) elements.title.textContent = featuredBlog.title;
      if (elements.excerpt) elements.excerpt.textContent = featuredBlog.excerpt;
      if (elements.date) elements.date.textContent = this.formatDate(featuredBlog.publishedAt || featuredBlog.createdAt);
      if (elements.readTime) elements.readTime.textContent = featuredBlog.readTime;
      if (elements.category) elements.category.textContent = featuredBlog.category;
      if (elements.authorName) elements.authorName.textContent = featuredBlog.authorName;
      if (elements.authorBio) elements.authorBio.textContent = featuredBlog.authorBio || 'Movement Leader';

      // Update images
      if (elements.image) {
        const imageUrl = featuredBlog.featuredImage ? Utils.getImageUrl(featuredBlog.featuredImage) : CONFIG.DEFAULTS.BLOG_IMAGE;
        elements.image.src = imageUrl;
        elements.image.alt = featuredBlog.title;
        elements.image.onerror = function() {
          this.src = CONFIG.DEFAULTS.BLOG_IMAGE;
          this.onerror = null;
        };
      }

      // Update author image with conditional logic for Admin User
      if (elements.authorImage) {
        if (featuredBlog.authorName === 'Admin User') {
          elements.authorImage.src = Utils.getImageUrl('../assets/images/neta g.jpg');
        } else {
          elements.authorImage.src = Utils.getImageUrl(featuredBlog.author?.avatar || CONFIG.DEFAULTS.AUTHOR_IMAGE);
        }
        elements.authorImage.alt = featuredBlog.authorName;
      }

      // Update category styling
      if (elements.category) {
        const categoryClass = this.getCategoryClass(featuredBlog.category);
        elements.category.className = `${categoryClass} text-white px-4 py-2 rounded-full text-sm font-semibold`;
      }

      // Update read more link
      if (elements.link) {
        elements.link.href = `blog-details.html?id=${featuredBlog._id}`;
      }

      // Show featured content
      content.classList.remove('hidden');
      fallback.classList.add('hidden');
    } else {
      // Show fallback content
      content.classList.add('hidden');
      fallback.classList.remove('hidden');
    }
  }

  // Utility methods
  updateElement(selector, content, isHtml = false) {
    const element = document.querySelector(selector);
    if (element) {
      if (isHtml) {
        element.innerHTML = content;
      } else {
        element.textContent = content;
      }
    }
  }

  formatDate(dateString) {
    return Utils.formatDate(dateString);
  }

  updateLoadMoreButton() {
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (!loadMoreBtn) return;

    if (this.state.pagination.current >= this.state.pagination.pages) {
      loadMoreBtn.style.display = 'none';
    } else {
      loadMoreBtn.style.display = 'block';
      loadMoreBtn.textContent = this.state.loading ? 'Loading...' : 'Load More Articles';
    }
  }

  showContent() {
    // Explicitly hide all loading spinners
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.style.display = 'none';
    
    const recentBlogsSpinner = document.getElementById('recentBlogsLoading');
    if (recentBlogsSpinner) recentBlogsSpinner.style.display = 'none';
    
    const blogLoadingSpinner = document.getElementById('blogLoadingSpinner');
    if (blogLoadingSpinner) blogLoadingSpinner.style.display = 'none';

    // Hide placeholders and show content
    const placeholders = document.querySelectorAll('[id$="Placeholder"]');
    placeholders.forEach(placeholder => placeholder.classList.add('hidden'));

    const content = document.querySelectorAll('[id$="Content"]');
    content.forEach(contentEl => contentEl.classList.remove('hidden'));
  }

  renderLoadingState() {
    const currentPage = this.getCurrentPage();
    
    // Only show loading spinner if we're actually loading and content isn't already rendered
    const shouldShowLoading = this.state.loading && !this.state.currentBlog;
    
    // Main loading spinner (for blog details page)
    const spinner = document.getElementById('loadingSpinner');
    if (spinner && currentPage === 'blog-details') {
      spinner.style.display = shouldShowLoading ? 'flex' : 'none';
    }
    
    // Recent blogs loading spinner (for homepage)
    const recentBlogsSpinner = document.getElementById('recentBlogsLoading');
    if (recentBlogsSpinner && currentPage === 'index') {
      recentBlogsSpinner.style.display = (this.state.loading && this.state.blogs.length === 0) ? 'flex' : 'none';
    }
    
    // Blog grid loading spinner (for blog page)
    const blogLoadingSpinner = document.getElementById('blogLoadingSpinner');
    if (blogLoadingSpinner && currentPage === 'blog') {
      blogLoadingSpinner.style.display = (this.state.loading && this.state.blogs.length === 0) ? 'flex' : 'none';
    }
  }

  showSuccessMessage(message) {
    Utils.showNotification(message, 'success');
  }

  showErrorMessage(message) {
    Utils.showNotification(message, 'error');
  }
}

// Initialize blog handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing BlogHandler...');
  
  // Check if required dependencies are loaded
  if (typeof CONFIG === 'undefined') {
    console.error('CONFIG not loaded');
    return;
  }
  
  if (typeof apiService === 'undefined') {
    console.error('apiService not loaded');
    return;
  }
  
  try {
    window.blogHandler = new BlogHandler();
    console.log('BlogHandler initialized successfully');
  } catch (error) {
    console.error('Failed to initialize BlogHandler:', error);
  }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BlogHandler;
}
