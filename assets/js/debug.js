// Debug script to help identify loading issues
console.log('Debug script loaded');

// Test image URL encoding
if (typeof Utils !== 'undefined') {
  console.log('Testing image URL encoding:');
  console.log('Original:', 'assets/images/neta g.jpg');
  console.log('Encoded:', Utils.getImageUrl('assets/images/neta g.jpg'));
  console.log('Original:', 'assets/images/generated-image (1).png');
  console.log('Encoded:', Utils.getImageUrl('assets/images/generated-image (1).png'));
}

// Check if all required scripts are loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded');
  
  // Check dependencies
  console.log('CONFIG available:', typeof CONFIG !== 'undefined');
  console.log('apiService available:', typeof apiService !== 'undefined');
  console.log('Utils available:', typeof Utils !== 'undefined');
  console.log('BlogHandler available:', typeof BlogHandler !== 'undefined');
  
  // Check if blogHandler instance was created
  setTimeout(() => {
    console.log('blogHandler instance:', typeof window.blogHandler !== 'undefined');
    
    if (window.blogHandler) {
      console.log('BlogHandler state:', window.blogHandler.state);
    }
    
    // Check current page
    const path = window.location.pathname;
    console.log('Current page path:', path);
    
    // Check for loading elements
    const recentBlogsLoading = document.getElementById('recentBlogsLoading');
    const relatedBlogsContainer = document.getElementById('relatedBlogsContainer');
    const blogGrid = document.querySelector('#blogs .grid');
    
    console.log('Recent blogs loading element:', !!recentBlogsLoading);
    console.log('Related blogs container:', !!relatedBlogsContainer);
    console.log('Blog grid container:', !!blogGrid);
    
    if (recentBlogsLoading) {
      console.log('Recent blogs loading display:', recentBlogsLoading.style.display);
    }
    
    if (blogGrid) {
      console.log('Blog grid content:', blogGrid.innerHTML.length > 0 ? 'Has content' : 'Empty');
    }
  }, 2000);
});

// Test API connection
setTimeout(() => {
  if (typeof apiService !== 'undefined') {
    console.log('Testing API connection...');
    apiService.getRecentBlogs(1).then(result => {
      console.log('API test result:', result);
    }).catch(error => {
      console.error('API test error:', error);
    });
  }
}, 3000);
