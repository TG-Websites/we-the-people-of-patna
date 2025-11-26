// Configuration file for API endpoints and app settings
const CONFIG = {
  // API Configuration
  API: {
    BASE_URL: 'http://localhost:5002/api',
    ENDPOINTS: {
      BLOGS: '/blogs',
      BLOG_BY_ID: '/blogs/:id',
      BLOG_CATEGORIES: '/blogs/meta/categories',
      BLOG_TAGS: '/blogs/meta/tags',
      UPLOAD: '/upload',
      SUBMISSIONS: '/submissions',
      ADMIN_SUBMIT_ANONYMOUS: '/admin/submit-anonymous',
      CONTRIBUTIONS: '/admin/web/contributions',
      CONTRIBUTION_CARDS: '/contributions/cards',
      CONTRIBUTION_DETAILS: '/contributions/:id/details',
      CONTRIBUTION_FEATURED: '/contributions/featured',
      CONTRIBUTION_CATEGORIES: '/contributions/categories',
      CONTRIBUTION_RELATED: '/contributions/:id/related',
      HEALTH: '/health'
    }
  },

  // App Settings
  APP: {
    BLOG_PAGINATION_LIMIT: 9,
    RECENT_BLOGS_LIMIT: 3,
    SEARCH_DEBOUNCE_TIME: 500,
    LOADING_DELAY: 1000
  },

  // Blog Categories with their styling
  CATEGORIES: {
    'Reform Victory': {
      class: 'bg-primary',
      color: '#195a9c'
    },
    'Youth Power': {
      class: 'bg-secondary',
      color: '#144A7F'
    },
    'Governance': {
      class: 'bg-gradient-to-r from-primary to-secondary',
      color: '#195a9c'
    },
    'Civic Action': {
      class: 'bg-primary',
      color: '#195a9c'
    },
    'Community': {
      class: 'bg-secondary',
      color: '#144A7F'
    },
    'Education': {
      class: 'bg-blue-600',
      color: '#2563eb'
    },
    'Environment': {
      class: 'bg-green-600',
      color: '#16a34a'
    },
    'Technology': {
      class: 'bg-purple-600',
      color: '#9333ea'
    },
    'Economy': {
      class: 'bg-yellow-600',
      color: '#ca8a04'
    },
    'Health': {
      class: 'bg-red-600',
      color: '#dc2626'
    },
    'Infrastructure': {
      class: 'bg-gray-600',
      color: '#4b5563'
    },
    'Other': {
      class: 'bg-gray-500',
      color: '#6b7280'
    }
  },

  // Default images
  DEFAULTS: {
    BLOG_IMAGE: 'https://imgs.search.brave.com/ZyIJRwx6nch-SewSp7ofPTBBj3cIvSrkt8v6i5Rm78Q/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi92aWV3/LXBhdG5hLXJhaWx3/YXktc3RhdGlvbi1i/aWhhci1pbmRpYS1j/YXBpdGFsLXdpbnRl/ci1kYXktcGFzc2Vu/Z2Vycy13YWl0aW5n/LXRyYWluLTM4ODY2/OTQyMy5qcGc',
    STORY_IMAGE: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
    AUTHOR_IMAGE: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
  },

  // Error messages
  MESSAGES: {
    ERRORS: {
      NETWORK: 'Network error. Please check your connection and try again.',
      BLOG_NOT_FOUND: 'Blog post not found.',
      SUBMISSION_FAILED: 'Failed to submit blog. Please try again.',
      UPLOAD_FAILED: 'Failed to upload image. Please try again.',
      VALIDATION_FAILED: 'Please fill in all required fields correctly.'
    },
    SUCCESS: {
      BLOG_SUBMITTED: 'Blog submitted successfully! It will be reviewed before publication.',
      SUBSCRIPTION: 'Thank you for subscribing! You will receive updates about our movement.'
    }
  }
};

// Utility functions
const Utils = {
  // Format date to readable string
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Truncate text to specified length
  truncateText(text, maxLength = 150) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength).trim() + '...';
  },

  // Debounce function for search
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Generate slug from title
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  },

  // Validate email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Strip HTML tags
  stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  },

  // Show notification
  showNotification(message, type = 'info', duration = 5000) {
    // Remove existing notification
    const existing = document.getElementById('notification');
    if (existing) {
      existing.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full`;

    // Set styling based on type
    switch (type) {
      case 'success':
        notification.className += ' bg-green-500 text-white';
        break;
      case 'error':
        notification.className += ' bg-red-500 text-white';
        break;
      case 'warning':
        notification.className += ' bg-yellow-500 text-white';
        break;
      default:
        notification.className += ' bg-blue-500 text-white';
    }

    notification.innerHTML = `
      <div class="flex items-center justify-between">
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);

    // Auto remove
    setTimeout(() => {
      if (notification.parentNode) {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 300);
      }
    }, duration);
  },

  // Loading state management
  setLoadingState(element, isLoading, loadingText = 'Loading...') {
    if (!element) return;

    if (isLoading) {
      element.dataset.originalText = element.innerHTML;
      element.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i>${loadingText}`;
      element.disabled = true;
    } else {
      element.innerHTML = element.dataset.originalText || element.innerHTML;
      element.disabled = false;
    }
  },

  // Get query parameter from URL
  getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  },

  // Update URL without page reload
  updateUrl(param, value) {
    const url = new URL(window.location);
    if (value) {
      url.searchParams.set(param, value);
    } else {
      url.searchParams.delete(param);
    }
    window.history.replaceState({}, '', url);
  },

  // Properly encode image URLs
  getImageUrl(imagePath) {
    if (!imagePath) return '';

    // If it's already a full URL (http/https), return as-is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // For local paths, split and encode only the filename part
    const parts = imagePath.split('/');
    const filename = parts.pop();
    const encodedFilename = encodeURIComponent(filename);
    return [...parts, encodedFilename].join('/');
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
  window.Utils = Utils;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, Utils };
}
