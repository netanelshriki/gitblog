// GitBlog - Main JavaScript Functionality

// State Management
const state = {
  user: null,
  posts: [],
  tags: [],
  currentPost: null,
  currentRoute: window.location.hash || '#home',
  theme: localStorage.getItem('theme') || 'light',
  isLoading: false,
  isAuthenticated: false,
  userRoles: [],
  repository: {
    owner: 'netanelshriki',
    name: 'gitblog',
    branch: 'main',
    postsDirectory: 'posts'
  }
};

// Constants
const API_URL = 'https://api.github.com';
const CLIENT_ID = 'your-github-oauth-client-id'; // Replace with your GitHub OAuth client ID
const REDIRECT_URI = `${window.location.origin}/callback.html`;

// Helper Functions
function getUrlParam(param) {
  const queryString = window.location.hash.split('?')[1];
  if (!queryString) return null;
  
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}

function generateSkeletonCards(count) {
  let cards = '';
  for (let i = 0; i < count; i++) {
    cards += `
      <div class="skeleton skeleton-card">
        <div style="height: 200px;"></div>
        <div style="padding: 1.5rem;">
          <div class="skeleton skeleton-header"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text"></div>
        </div>
      </div>
    `;
  }
  return cards;
}

function generatePostDetailSkeleton() {
  return `
    <div class="post-header">
      <div class="skeleton skeleton-header" style="width: 80%; height: 50px;"></div>
      <div style="display: flex; gap: 1rem; margin: 1rem 0;">
        <div class="skeleton" style="width: 100px; height: 20px;"></div>
        <div class="skeleton" style="width: 120px; height: 20px;"></div>
        <div class="skeleton" style="width: 80px; height: 20px;"></div>
      </div>
      <div style="display: flex; gap: 0.5rem; margin-bottom: 2rem;">
        <div class="skeleton" style="width: 70px; height: 25px; border-radius: 20px;"></div>
        <div class="skeleton" style="width: 100px; height: 25px; border-radius: 20px;"></div>
        <div class="skeleton" style="width: 80px; height: 25px; border-radius: 20px;"></div>
      </div>
    </div>
    <div class="skeleton" style="width: 100%; height: 400px; margin-bottom: 2rem;"></div>
    <div class="post-content">
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text" style="width: 85%;"></div>
      <div style="margin: 2rem 0;"></div>
      <div class="skeleton skeleton-header" style="width: 60%; height: 30px;"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text" style="width: 90%;"></div>
    </div>
  `;
}

function showToast(message, type = 'info') {
  const toastsContainer = document.getElementById('toasts-container');
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon;
  switch (type) {
    case 'success':
      icon = 'fas fa-check-circle';
      break;
    case 'error':
      icon = 'fas fa-exclamation-circle';
      break;
    case 'warning':
      icon = 'fas fa-exclamation-triangle';
      break;
    default:
      icon = 'fas fa-info-circle';
  }
  
  toast.innerHTML = `
    <i class="toast-icon ${icon}"></i>
    <div class="toast-content">
      <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  toastsContainer.appendChild(toast);
  
  // Add event listener to close button
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.remove();
  });
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.remove();
  }, 5000);
}

function showLoading(show = true) {
  const spinner = document.getElementById('spinner-overlay');
  if (show) {
    spinner.style.display = 'flex';
    state.isLoading = true;
  } else {
    spinner.style.display = 'none';
    state.isLoading = false;
  }
}

// Parse Markdown file with YAML frontmatter
function parseMDFile(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return {
      frontmatter: {},
      content: content
    };
  }
  
  try {
    const frontmatter = jsyaml.load(match[1]);
    const content = match[2];
    
    return {
      frontmatter,
      content
    };
  } catch (error) {
    console.error('Error parsing frontmatter:', error);
    return {
      frontmatter: {},
      content: content
    };
  }
}

// GitHub API Functions
async function fetchFeaturedPosts() {
  showLoading(true);
  
  try {
    // Fetch posts from GitHub API
    const repoPath = `${state.repository.postsDirectory}`;
    const url = `${API_URL}/repos/${state.repository.owner}/${state.repository.name}/contents/${repoPath}?ref=${state.repository.branch}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (Array.isArray(data)) {
      const markdownFiles = data.filter(file => file.name.endsWith('.md') && file.name !== 'README.md');
      const featuredFiles = markdownFiles.slice(0, 3); // Get first 3 posts
      
      let featuredPostsHTML = '';
      
      for (const file of featuredFiles) {
        const fileResponse = await fetch(file.download_url);
        const fileContent = await fileResponse.text();
        
        // Parse frontmatter and content
        const { frontmatter, content } = parseMDFile(fileContent);
        
        // Store post data in state
        state.posts.push({
          id: file.sha,
          path: file.path,
          name: file.name,
          download_url: file.download_url,
          frontmatter,
          content
        });
        
        // Collect unique tags
        if (Array.isArray(frontmatter.tags)) {
          frontmatter.tags.forEach(tag => {
            if (!state.tags.includes(tag)) {
              state.tags.push(tag);
            }
          });
        }
        
        featuredPostsHTML += `
          <div class="card">
            <img src="${frontmatter.image || 'https://via.placeholder.com/600x400'}" alt="${frontmatter.title}" class="card-image">
            <div class="card-content">
              <h3 class="card-title">${frontmatter.title}</h3>
              <div class="card-meta">
                <span><i class="fas fa-user"></i> ${frontmatter.author}</span>
                <span><i class="fas fa-calendar"></i> ${new Date(frontmatter.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <p class="card-description">
                ${frontmatter.excerpt || content.substring(0, 150) + '...'}
              </p>
              <div class="card-footer">
                <div class="card-tags">
                  ${Array.isArray(frontmatter.tags) ? frontmatter.tags.slice(0, 3).map(tag => `<a href="#tag?tag=${tag}" class="tag">${tag}</a>`).join('') : ''}
                </div>
                <a href="#post?id=${file.sha}" class="btn btn-ghost btn-sm">Read More</a>
              </div>
            </div>
          </div>
        `;
      }
      
      document.getElementById('featured-posts').innerHTML = featuredPostsHTML || '<p>No posts found.</p>';
    } else {
      document.getElementById('featured-posts').innerHTML = '<p>No posts found.</p>';
    }
    
    showLoading(false);
  } catch (error) {
    console.error('Error fetching featured posts:', error);
    document.getElementById('featured-posts').innerHTML = '<p>Error loading posts. Please try again later.</p>';
    showToast('Error fetching posts. Please try again later.', 'error');
    showLoading(false);
  }
}

async function fetchPosts() {
  showLoading(true);
  
  try {
    // If posts are already loaded, use cached data
    if (state.posts.length > 0) {
      renderPostGrid(state.posts, 'posts-grid');
      showLoading(false);
      return;
    }
    
    // Fetch posts from GitHub API
    const repoPath = `${state.repository.postsDirectory}`;
    const url = `${API_URL}/repos/${state.repository.owner}/${state.repository.name}/contents/${repoPath}?ref=${state.repository.branch}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (Array.isArray(data)) {
      state.posts = []; // Reset posts
      state.tags = []; // Reset tags
      
      const markdownFiles = data.filter(file => file.name.endsWith('.md') && file.name !== 'README.md');
      
      for (const file of markdownFiles) {
        const fileResponse = await fetch(file.download_url);
        const fileContent = await fileResponse.text();
        
        // Parse frontmatter and content
        const { frontmatter, content } = parseMDFile(fileContent);
        
        // Store post data in state
        state.posts.push({
          id: file.sha,
          path: file.path,
          name: file.name,
          download_url: file.download_url,
          frontmatter,
          content
        });
        
        // Collect unique tags
        if (Array.isArray(frontmatter.tags)) {
          frontmatter.tags.forEach(tag => {
            if (!state.tags.includes(tag)) {
              state.tags.push(tag);
            }
          });
        }
      }
      
      // Sort posts by date (newest first)
      state.posts.sort((a, b) => {
        const dateA = new Date(a.frontmatter.date);
        const dateB = new Date(b.frontmatter.date);
        return dateB - dateA;
      });
      
      renderPostGrid(state.posts, 'posts-grid');
    } else {
      document.getElementById('posts-grid').innerHTML = '<p>No posts found.</p>';
    }
    
    showLoading(false);
  } catch (error) {
    console.error('Error fetching posts:', error);
    document.getElementById('posts-grid').innerHTML = '<p>Error loading posts. Please try again later.</p>';
    showToast('Error fetching posts. Please try again later.', 'error');
    showLoading(false);
  }
}

function renderPostGrid(posts, containerId) {
  let postsHTML = '';
  
  posts.forEach(post => {
    postsHTML += `
      <div class="card">
        <img src="${post.frontmatter.image || 'https://via.placeholder.com/600x400'}" alt="${post.frontmatter.title}" class="card-image">
        <div class="card-content">
          <h3 class="card-title">${post.frontmatter.title}</h3>
          <div class="card-meta">
            <span><i class="fas fa-user"></i> ${post.frontmatter.author}</span>
            <span><i class="fas fa-calendar"></i> ${new Date(post.frontmatter.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <p class="card-description">
            ${post.frontmatter.excerpt || post.content.substring(0, 150) + '...'}
          </p>
          <div class="card-footer">
            <div class="card-tags">
              ${Array.isArray(post.frontmatter.tags) ? post.frontmatter.tags.slice(0, 3).map(tag => `<a href="#tag?tag=${tag}" class="tag">${tag}</a>`).join('') : ''}
            </div>
            <a href="#post?id=${post.id}" class="btn btn-ghost btn-sm">Read More</a>
          </div>
        </div>
      </div>
    `;
  });
  
  document.getElementById(containerId).innerHTML = postsHTML || '<p>No posts found.</p>';
}

async function fetchPostById(id) {
  showLoading(true);
  
  try {
    // Check if post is already in state
    let post = state.posts.find(p => p.id === id);
    
    if (!post) {
      // Fetch all posts if not loaded yet
      await fetchPosts();
      post = state.posts.find(p => p.id === id);
    }
    
    if (post) {
      state.currentPost = post;
      
      // Render post detail
      const postHTML = `
        <div class="post-header">
          <h1 class="post-title">${post.frontmatter.title}</h1>
          <div class="post-meta">
            <span><i class="fas fa-user"></i> ${post.frontmatter.author}</span>
            <span><i class="fas fa-calendar"></i> ${new Date(post.frontmatter.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div class="post-tags">
            ${Array.isArray(post.frontmatter.tags) ? post.frontmatter.tags.map(tag => `<a href="#tag?tag=${tag}" class="tag">${tag}</a>`).join('') : ''}
          </div>
        </div>
        
        ${post.frontmatter.image ? `<img src="${post.frontmatter.image}" alt="${post.frontmatter.title}" class="post-cover">` : ''}
        
        <div class="post-content">
          ${marked.parse(post.content)}
        </div>
        
        <div class="post-footer">
          <div class="post-actions">
            <div>
              <button class="btn btn-ghost">
                <i class="fas fa-thumbs-up"></i>
                Like
              </button>
              <button class="btn btn-ghost">
                <i class="fas fa-bookmark"></i>
                Save
              </button>
            </div>
            <div class="post-share">
              <span>Share:</span>
              <a href="#" onclick="shareOnTwitter('${window.location.href}', '${post.frontmatter.title}'); return false;"><i class="fab fa-twitter"></i></a>
              <a href="#" onclick="shareOnFacebook('${window.location.href}'); return false;"><i class="fab fa-facebook"></i></a>
              <a href="#" onclick="shareOnLinkedIn('${window.location.href}', '${post.frontmatter.title}'); return false;"><i class="fab fa-linkedin"></i></a>
            </div>
          </div>
          
          ${state.isAuthenticated ? `
            <div style="text-align: right; margin-top: 2rem;">
              <a href="#edit-post?id=${post.id}" class="btn btn-primary btn-sm">
                <i class="fas fa-edit"></i>
                Edit Post
              </a>
            </div>
          ` : ''}
        </div>
      `;
      
      document.getElementById('post-container').innerHTML = postHTML;
      
      // Initialize syntax highlighting
      if (window.Prism) {
        window.Prism.highlightAll();
      }
    } else {
      document.getElementById('post-container').innerHTML = `
        <div style="text-align: center; padding: 3rem 0;">
          <h2>Post Not Found</h2>
          <p>The post you're looking for doesn't exist or has been moved.</p>
          <a href="#posts" class="btn btn-primary">Browse Posts</a>
        </div>
      `;
    }
    
    showLoading(false);
  } catch (error) {
    console.error('Error fetching post:', error);
    document.getElementById('post-container').innerHTML = '<p>Error loading post. Please try again later.</p>';
    showToast('Error fetching post. Please try again later.', 'error');
    showLoading(false);
  }
}

async function fetchPostsByTag(tag) {
  showLoading(true);
  
  try {
    // If posts are already loaded, filter by tag
    if (state.posts.length > 0) {
      const filteredPosts = state.posts.filter(post => 
        Array.isArray(post.frontmatter.tags) && post.frontmatter.tags.includes(tag)
      );
      
      renderPostGrid(filteredPosts, 'tag-posts-grid');
      showLoading(false);
      return;
    }
    
    // If posts are not loaded yet, fetch all posts and filter
    await fetchPosts();
    
    const filteredPosts = state.posts.filter(post => 
      Array.isArray(post.frontmatter.tags) && post.frontmatter.tags.includes(tag)
    );
    
    renderPostGrid(filteredPosts, 'tag-posts-grid');
    showLoading(false);
  } catch (error) {
    console.error('Error fetching posts by tag:', error);
    document.getElementById('tag-posts-grid').innerHTML = '<p>Error loading posts. Please try again later.</p>';
    showToast('Error fetching posts. Please try again later.', 'error');
    showLoading(false);
  }
}

function filterPostsByTag(tag) {
  if (tag === 'all') {
    renderPostGrid(state.posts, 'posts-grid');
    return;
  }
  
  const filteredPosts = state.posts.filter(post => 
    Array.isArray(post.frontmatter.tags) && post.frontmatter.tags.includes(tag)
  );
  
  renderPostGrid(filteredPosts, 'posts-grid');
}

function filterPostsBySearch(searchTerm) {
  if (!searchTerm) {
    renderPostGrid(state.posts, 'posts-grid');
    return;
  }
  
  const filteredPosts = state.posts.filter(post => {
    const title = post.frontmatter.title?.toLowerCase() || '';
    const content = post.content?.toLowerCase() || '';
    const excerpt = post.frontmatter.excerpt?.toLowerCase() || '';
    const author = post.frontmatter.author?.toLowerCase() || '';
    const tags = Array.isArray(post.frontmatter.tags) ? post.frontmatter.tags.join(' ').toLowerCase() : '';
    
    return (
      title.includes(searchTerm) || 
      content.includes(searchTerm) || 
      excerpt.includes(searchTerm) || 
      author.includes(searchTerm) || 
      tags.includes(searchTerm)
    );
  });
  
  renderPostGrid(filteredPosts, 'posts-grid');
}

function sortPosts(sortOrder) {
  let sortedPosts = [...state.posts];
  
  switch (sortOrder) {
    case 'newest':
      sortedPosts.sort((a, b) => {
        const dateA = new Date(a.frontmatter.date);
        const dateB = new Date(b.frontmatter.date);
        return dateB - dateA;
      });
      break;
    case 'oldest':
      sortedPosts.sort((a, b) => {
        const dateA = new Date(a.frontmatter.date);
        const dateB = new Date(b.frontmatter.date);
        return dateA - dateB;
      });
      break;
    case 'az':
      sortedPosts.sort((a, b) => {
        const titleA = a.frontmatter.title.toLowerCase();
        const titleB = b.frontmatter.title.toLowerCase();
        return titleA.localeCompare(titleB);
      });
      break;
    case 'za':
      sortedPosts.sort((a, b) => {
        const titleA = a.frontmatter.title.toLowerCase();
        const titleB = b.frontmatter.title.toLowerCase();
        return titleB.localeCompare(titleA);
      });
      break;
  }
  
  renderPostGrid(sortedPosts, 'posts-grid');
}

async function createPost() {
  if (!state.isAuthenticated) {
    showToast('Please login to create a post', 'error');
    return;
  }
  
  showLoading(true);
  
  try {
    // Get form data
    const title = document.querySelector('#post-title').value;
    const author = document.querySelector('#post-author').value;
    const date = document.querySelector('#post-date').value;
    const tagsInput = document.querySelector('#post-tags').value;
    const tags = tagsInput.split(',').map(tag => tag.trim());
    const image = document.querySelector('#post-image').value;
    const excerpt = document.querySelector('#post-excerpt').value;
    const content = document.querySelector('#post-content').value;
    const slug = document.querySelector('#post-slug').value;
    
    // Create YAML frontmatter
    const frontmatter = {
      title,
      author,
      date,
      tags,
      image,
      excerpt,
      slug
    };
    
    // Create markdown content with frontmatter
    const yamlFrontmatter = jsyaml.dump(frontmatter);
    const markdownContent = `---
${yamlFrontmatter}---

${content}`;
    
    // Create file name (YYYY-MM-DD-slug.md)
    const fileName = `${date}-${slug}.md`;
    const filePath = `${state.repository.postsDirectory}/${fileName}`;
    
    // In a real implementation, you would use GitHub API to create a file
    // For demo purposes, we'll simulate success
    setTimeout(() => {
      showLoading(false);
      showToast('Post created successfully!', 'success');
      window.location.hash = '#posts';
      
      // In a real implementation, you would refresh posts after creation
      state.posts = [];
      fetchPosts();
    }, 1500);
  } catch (error) {
    console.error('Error creating post:', error);
    showToast('Failed to create post. Please try again later.', 'error');
    showLoading(false);
  }
}

async function fetchPostForEdit(postId) {
  showLoading(true);
  
  try {
    // Check if post is already in state
    let post = state.posts.find(p => p.id === postId);
    
    if (!post) {
      // Fetch all posts if not loaded yet
      await fetchPosts();
      post = state.posts.find(p => p.id === postId);
    }
    
    if (post) {
      // Populate form fields with post data
      document.querySelector('#post-title').value = post.frontmatter.title;
      document.querySelector('#post-author').value = post.frontmatter.author;
      document.querySelector('#post-date').value = post.frontmatter.date;
      document.querySelector('#post-tags').value = Array.isArray(post.frontmatter.tags) ? post.frontmatter.tags.join(', ') : '';
      document.querySelector('#post-image').value = post.frontmatter.image || '';
      document.querySelector('#post-excerpt').value = post.frontmatter.excerpt || '';
      document.querySelector('#post-slug').value = post.frontmatter.slug || '';
      document.querySelector('#post-content').value = post.content;
      
      showLoading(false);
    } else {
      showToast('Post not found', 'error');
      window.location.hash = '#posts';
    }
  } catch (error) {
    console.error('Error fetching post for edit:', error);
    showToast('Failed to load post for editing. Please try again later.', 'error');
    showLoading(false);
  }
}

async function updatePost(postId) {
  if (!state.isAuthenticated) {
    showToast('Please login to update a post', 'error');
    return;
  }
  
  showLoading(true);
  
  try {
    // Get form data
    const title = document.querySelector('#post-title').value;
    const author = document.querySelector('#post-author').value;
    const date = document.querySelector('#post-date').value;
    const tagsInput = document.querySelector('#post-tags').value;
    const tags = tagsInput.split(',').map(tag => tag.trim());
    const image = document.querySelector('#post-image').value;
    const excerpt = document.querySelector('#post-excerpt').value;
    const content = document.querySelector('#post-content').value;
    const slug = document.querySelector('#post-slug').value;
    
    // Create YAML frontmatter
    const frontmatter = {
      title,
      author,
      date,
      tags,
      image,
      excerpt,
      slug
    };
    
    // Create markdown content with frontmatter
    const yamlFrontmatter = jsyaml.dump(frontmatter);
    const markdownContent = `---
${yamlFrontmatter}---

${content}`;
    
    // In a real implementation, you would use GitHub API to update a file
    // For demo purposes, we'll simulate success
    setTimeout(() => {
      showLoading(false);
      showToast('Post updated successfully!', 'success');
      window.location.hash = `#post?id=${postId}`;
      
      // In a real implementation, you would refresh posts after update
      state.posts = [];
      fetchPosts();
    }, 1500);
  } catch (error) {
    console.error('Error updating post:', error);
    showToast('Failed to update post. Please try again later.', 'error');
    showLoading(false);
  }
}

async function deletePost(postId) {
  if (!state.isAuthenticated) {
    showToast('Please login to delete a post', 'error');
    return;
  }
  
  showLoading(true);
  
  try {
    // In a real implementation, you would use GitHub API to delete a file
    // For demo purposes, we'll simulate success
    setTimeout(() => {
      showLoading(false);
      showToast('Post deleted successfully!', 'success');
      window.location.hash = '#posts';
      
      // In a real implementation, you would refresh posts after deletion
      state.posts = [];
      fetchPosts();
    }, 1500);
  } catch (error) {
    console.error('Error deleting post:', error);
    showToast('Failed to delete post. Please try again later.', 'error');
    showLoading(false);
  }
}

function previewPost() {
  // Get form data
  const title = document.querySelector('#post-title').value || 'Post Title';
  const author = document.querySelector('#post-author').value || 'Author Name';
  const date = document.querySelector('#post-date').value ? new Date(document.querySelector('#post-date').value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const tagsInput = document.querySelector('#post-tags').value;
  const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [];
  const image = document.querySelector('#post-image').value || 'https://via.placeholder.com/1200x600';
  const content = document.querySelector('#post-content').value || 'Post content';
  
  // Create a modal for preview
  const previewModal = document.createElement('div');
  previewModal.className = 'modal-overlay active';
  previewModal.innerHTML = `
    <div class="modal" style="max-width: 800px; width: 90%; max-height: 90vh;">
      <div class="modal-header">
        <h3 class="modal-title">Post Preview</h3>
        <button class="modal-close" id="preview-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body" style="overflow-y: auto; max-height: calc(90vh - 115px);">
        <div class="post-header">
          <h1 class="post-title">${title}</h1>
          <div class="post-meta">
            <span><i class="fas fa-user"></i> ${author}</span>
            <span><i class="fas fa-calendar"></i> ${date}</span>
          </div>
          <div class="post-tags">
            ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </div>
        
        <img src="${image}" alt="Post Cover" class="post-cover">
        
        <div class="post-content">
          ${marked.parse(content)}
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(previewModal);
  
  // Initialize syntax highlighting
  if (window.Prism) {
    window.Prism.highlightAll();
  }
  
  // Add event listener to close button
  document.querySelector('#preview-close').addEventListener('click', () => {
    previewModal.remove();
  });
}

// GitHub OAuth Authentication Functions
function loginWithGitHub() {
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=repo`;
  window.location.href = authUrl;
}

function handleAuthCallback() {
  const code = getUrlParam('code');
  if (code) {
    // In a real implementation, you would exchange code for token using a server
    // For demo purposes, we'll simulate authentication
    state.isAuthenticated = true;
    state.user = {
      name: 'Demo User',
      avatar: 'https://via.placeholder.com/50',
      username: 'demo-user'
    };
    state.userRoles = ['writer'];
    
    // Save auth state to localStorage (for demo purposes)
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify(state.user));
    localStorage.setItem('userRoles', JSON.stringify(state.userRoles));
    
    // Redirect to home page
    window.location.href = '/';
  }
}

function logout() {
  state.isAuthenticated = false;
  state.user = null;
  state.userRoles = [];
  
  // Clear auth state from localStorage
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('user');
  localStorage.removeItem('userRoles');
  
  // Update UI
  updateAuthUI();
  
  // Show toast
  showToast('Logged out successfully', 'success');
}

function updateAuthUI() {
  const authContainer = document.getElementById('auth-container');
  
  if (state.isAuthenticated && state.user) {
    authContainer.innerHTML = `
      <div style="display: flex; align-items: center;">
        <div id="user-dropdown" style="position: relative; cursor: pointer;">
          <div style="display: flex; align-items: center;">
            <img src="${state.user.avatar}" alt="${state.user.name}" style="width: 30px; height: 30px; border-radius: 50%; margin-right: 0.5rem;">
            <span>${state.user.name} <i class="fas fa-chevron-down" style="font-size: 0.75rem; margin-left: 0.25rem;"></i></span>
          </div>
          <div id="user-dropdown-menu" style="position: absolute; top: 100%; right: 0; background-color: var(--light); border-radius: var(--radius); box-shadow: var(--shadow); min-width: 200px; z-index: 100; display: none; margin-top: 0.5rem; border: 1px solid var(--gray-light);">
            <div style="padding: 1rem; border-bottom: 1px solid var(--gray-light);">
              <div style="font-weight: 600;">${state.user.name}</div>
              <div style="font-size: 0.875rem; color: var(--gray);">@${state.user.username}</div>
            </div>
            <div style="padding: 0.5rem 0;">
              <a href="#profile" style="display: flex; align-items: center; padding: 0.5rem 1rem; color: var(--dark); transition: var(--transition);">
                <i class="fas fa-user" style="width: 1.5rem;"></i>
                Profile
              </a>
              <a href="#create-post" style="display: flex; align-items: center; padding: 0.5rem 1rem; color: var(--dark); transition: var(--transition);">
                <i class="fas fa-edit" style="width: 1.5rem;"></i>
                New Post
              </a>
              ${state.userRoles.includes('admin') ? `
                <a href="#admin" style="display: flex; align-items: center; padding: 0.5rem 1rem; color: var(--dark); transition: var(--transition);">
                  <i class="fas fa-cog" style="width: 1.5rem;"></i>
                  Admin
                </a>
              ` : ''}
              <div style="height: 1px; background-color: var(--gray-light); margin: 0.5rem 0;"></div>
              <button id="logout-btn" style="display: flex; align-items: center; padding: 0.5rem 1rem; color: var(--dark); transition: var(--transition); width: 100%; text-align: left; background: none; border: none; cursor: pointer;">
                <i class="fas fa-sign-out-alt" style="width: 1.5rem;"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners
    document.getElementById('user-dropdown').addEventListener('click', function() {
      const dropdownMenu = document.getElementById('user-dropdown-menu');
      dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });
    
    document.addEventListener('click', function(e) {
      const dropdown = document.getElementById('user-dropdown');
      const dropdownMenu = document.getElementById('user-dropdown-menu');
      
      if (dropdown && dropdownMenu && !dropdown.contains(e.target)) {
        dropdownMenu.style.display = 'none';
      }
    });
    
    document.getElementById('logout-btn').addEventListener('click', logout);
  } else {
    authContainer.innerHTML = `
      <button id="login-btn" class="btn btn-primary btn-sm">
        <i class="fas fa-sign-in-alt"></i>
        Login
      </button>
    `;
    
    // Add event listener
    document.getElementById('login-btn').addEventListener('click', function() {
      document.getElementById('login-modal').classList.add('active');
    });
  }
}

// Social Sharing Functions
function shareOnTwitter(url, title) {
  window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
}

function shareOnFacebook(url) {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
}

function shareOnLinkedIn(url, title) {
  window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank');
}

// Theme Switching
function toggleTheme() {
  const newTheme = state.theme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
}

function setTheme(theme) {
  state.theme = theme;
  localStorage.setItem('theme', theme);
  
  const body = document.body;
  const themeToggleIcon = document.querySelector('#theme-toggle i');
  const mobileThemeToggleText = document.querySelector('#mobile-theme-toggle');
  
  if (theme === 'dark') {
    body.classList.add('dark-mode');
    themeToggleIcon.className = 'fas fa-sun';
    mobileThemeToggleText.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
  } else {
    body.classList.remove('dark-mode');
    themeToggleIcon.className = 'fas fa-moon';
    mobileThemeToggleText.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
  }
}

// Router Class
class Router {
  constructor() {
    this.routes = {
      '#home': this.homePage,
      '#posts': this.postsPage,
      '#post': this.postDetailPage,
      '#tags': this.tagsPage,
      '#tag': this.tagPage,
      '#create-post': this.createPostPage,
      '#edit-post': this.editPostPage,
      '#about': this.aboutPage,
      '#contact': this.contactPage,
      '#404': this.notFoundPage
    };

    window.addEventListener('hashchange', () => this.handleRouteChange());
    this.handleRouteChange();
  }

  handleRouteChange() {
    const hash = window.location.hash.split('?')[0] || '#home';
    state.currentRoute = hash;
    
    const route = this.routes[hash] || this.routes['#404'];
    document.querySelector('#app').innerHTML = '';
    route.call(this);
    
    // Update active nav link
    document.querySelectorAll('.nav-links a').forEach(link => {
      if (link.getAttribute('href') === hash) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Route handler methods defined in the HTML file
  homePage() {
    // Home page route handler
    const heroSection = `
      <section class="hero fade-in-up">
        <div class="container">
          <h1>Write. Share. Connect.</h1>
          <p>A beautiful, feature-rich blogging platform powered by GitHub.</p>
          <div>
            <a href="#posts" class="btn btn-primary">
              <i class="fas fa-book-open"></i>
              Explore Posts
            </a>
            ${state.isAuthenticated ? `
              <a href="#create-post" class="btn btn-secondary">
                <i class="fas fa-pen"></i>
                Write a Post
              </a>
            ` : `
              <button id="hero-login-btn" class="btn btn-ghost">
                <i class="fas fa-sign-in-alt"></i>
                Login to Write
              </button>
            `}
          </div>
          <div class="social-proof">
            <div class="social-proof-item">
              <i class="fas fa-file-alt"></i>
              <div>
                <div class="social-proof-text">Total Posts</div>
                <div class="social-proof-number">148</div>
              </div>
            </div>
            <div class="social-proof-item">
              <i class="fas fa-users"></i>
              <div>
                <div class="social-proof-text">Active Writers</div>
                <div class="social-proof-number">24</div>
              </div>
            </div>
            <div class="social-proof-item">
              <i class="fas fa-tags"></i>
              <div>
                <div class="social-proof-text">Unique Tags</div>
                <div class="social-proof-number">35</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

    const featuredPosts = `
      <section class="fade-in-up" style="animation-delay: 0.2s;">
        <div class="container">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h2>Featured Posts</h2>
            <a href="#posts" class="btn btn-ghost btn-sm">
              View All
              <i class="fas fa-arrow-right" style="margin-left: 0.5rem;"></i>
            </a>
          </div>
          <div class="posts-grid" id="featured-posts">
            ${state.isLoading ? generateSkeletonCards(3) : ''}
          </div>
        </div>
      </section>
    `;

    const popularTags = `
      <section class="fade-in-up" style="animation-delay: 0.3s; margin-top: 3rem;">
        <div class="container">
          <h2>Popular Tags</h2>
          <div style="margin-top: 1.5rem; display: flex; flex-wrap: wrap; gap: 0.75rem;">
            <a href="#tag?tag=javascript" class="tag" style="font-size: 1rem; padding: 0.5rem 1rem;">JavaScript</a>
            <a href="#tag?tag=webdev" class="tag" style="font-size: 1rem; padding: 0.5rem 1rem;">Web Development</a>
            <a href="#tag?tag=react" class="tag" style="font-size: 1rem; padding: 0.5rem 1rem;">React</a>
            <a href="#tag?tag=css" class="tag" style="font-size: 1rem; padding: 0.5rem 1rem;">CSS</a>
            <a href="#tag?tag=node" class="tag" style="font-size: 1rem; padding: 0.5rem 1rem;">Node.js</a>
            <a href="#tag?tag=api" class="tag" style="font-size: 1rem; padding: 0.5rem 1rem;">API</a>
            <a href="#tag?tag=github" class="tag" style="font-size: 1rem; padding: 0.5rem 1rem;">GitHub</a>
            <a href="#tag?tag=frontend" class="tag" style="font-size: 1rem; padding: 0.5rem 1rem;">Frontend</a>
          </div>
        </div>
      </section>
    `;

    document.querySelector('#app').innerHTML = `
      ${heroSection}
      ${featuredPosts}
      ${popularTags}
    `;

    // Add event listeners
    if (!state.isAuthenticated) {
      document.querySelector('#hero-login-btn').addEventListener('click', () => {
        document.getElementById('login-modal').classList.add('active');
      });
    }

    // Fetch posts for the home page
    fetchFeaturedPosts();
  }
  
  // Other route handlers will be called from the HTML file
}

// Initialize App
function init() {
  // Initialize router
  new Router();
  
  // Check if user is authenticated (from localStorage)
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  if (isAuthenticated) {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
    
    if (user) {
      state.isAuthenticated = true;
      state.user = user;
      state.userRoles = userRoles;
    }
  }
  
  // Update auth UI
  updateAuthUI();
  
  // Set theme
  setTheme(state.theme);
  
  // Hide loading spinner
  showLoading(false);
  
  // Add event listeners
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  document.getElementById('mobile-theme-toggle').addEventListener('click', toggleTheme);
  
  document.getElementById('mobile-menu-toggle').addEventListener('click', function() {
    document.getElementById('mobile-menu').classList.add('active');
  });
  
  document.getElementById('mobile-menu-close').addEventListener('click', function() {
    document.getElementById('mobile-menu').classList.remove('active');
  });
  
  document.getElementById('search-toggle').addEventListener('click', function() {
    document.getElementById('search-overlay').classList.add('active');
    document.getElementById('search-input').focus();
  });
  
  document.getElementById('mobile-search-btn').addEventListener('click', function() {
    document.getElementById('mobile-menu').classList.remove('active');
    document.getElementById('search-overlay').classList.add('active');
    document.getElementById('search-input').focus();
  });
  
  document.getElementById('search-close').addEventListener('click', function() {
    document.getElementById('search-overlay').classList.remove('active');
  });
  
  // Auth modal toggling
  document.getElementById('login-close').addEventListener('click', function() {
    document.getElementById('login-modal').classList.remove('active');
  });
  
  document.getElementById('register-close').addEventListener('click', function() {
    document.getElementById('register-modal').classList.remove('active');
  });
  
  document.getElementById('show-register').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('login-modal').classList.remove('active');
    document.getElementById('register-modal').classList.add('active');
  });
  
  document.getElementById('show-login').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('register-modal').classList.remove('active');
    document.getElementById('login-modal').classList.add('active');
  });
  
  // GitHub login
  document.getElementById('github-login').addEventListener('click', loginWithGitHub);
  document.getElementById('github-register').addEventListener('click', loginWithGitHub);
  
  // Login form submission
  document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    // Simulate login for demo purposes
    state.isAuthenticated = true;
    state.user = {
      name: 'Demo User',
      avatar: 'https://via.placeholder.com/50',
      username: 'demo-user'
    };
    state.userRoles = ['writer'];
    
    // Save auth state to localStorage
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify(state.user));
    localStorage.setItem('userRoles', JSON.stringify(state.userRoles));
    
    // Update UI
    updateAuthUI();
    
    // Close modal
    document.getElementById('login-modal').classList.remove('active');
    
    // Show toast
    showToast('Logged in successfully', 'success');
  });
  
  // Register form submission
  document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();
    // Simulate registration for demo purposes
    state.isAuthenticated = true;
    state.user = {
      name: document.getElementById('register-name').value,
      avatar: 'https://via.placeholder.com/50',
      username: document.getElementById('register-email').value.split('@')[0]
    };
    state.userRoles = ['writer'];
    
    // Save auth state to localStorage
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify(state.user));
    localStorage.setItem('userRoles', JSON.stringify(state.userRoles));
    
    // Update UI
    updateAuthUI();
    
    // Close modal
    document.getElementById('register-modal').classList.remove('active');
    
    // Show toast
    showToast('Registration successful', 'success');
  });

  // Initialize search
  document.getElementById('search-input').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    if (searchTerm.length >= 3) {
      searchPosts(searchTerm);
    } else {
      document.getElementById('search-results').innerHTML = '';
    }
  });
}

// Search functionality
function searchPosts(query) {
  if (state.posts.length === 0) {
    // If posts are not loaded yet, show loading message
    document.getElementById('search-results').innerHTML = '<p>Loading posts...</p>';
    fetchPosts().then(() => {
      performSearch(query);
    });
  } else {
    performSearch(query);
  }
}

function performSearch(query) {
  const results = state.posts.filter(post => {
    const title = post.frontmatter.title?.toLowerCase() || '';
    const content = post.content?.toLowerCase() || '';
    const excerpt = post.frontmatter.excerpt?.toLowerCase() || '';
    const author = post.frontmatter.author?.toLowerCase() || '';
    const tags = Array.isArray(post.frontmatter.tags) ? post.frontmatter.tags.join(' ').toLowerCase() : '';
    
    return (
      title.includes(query) || 
      content.includes(query) || 
      excerpt.includes(query) || 
      author.includes(query) || 
      tags.includes(query)
    );
  });
  
  if (results.length > 0) {
    let resultsHTML = '<div style="margin-top: 1.5rem;">';
    
    results.slice(0, 5).forEach(post => {
      resultsHTML += `
        <div class="card" style="margin-bottom: 1rem;">
          <div class="card-content" style="padding: 1rem;">
            <h3 class="card-title" style="font-size: 1rem; margin-bottom: 0.25rem;">
              <a href="#post?id=${post.id}">${post.frontmatter.title}</a>
            </h3>
            <div class="card-meta" style="margin-bottom: 0.5rem;">
              <span><i class="fas fa-user"></i> ${post.frontmatter.author}</span>
              <span><i class="fas fa-calendar"></i> ${new Date(post.frontmatter.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <p class="card-description" style="margin-bottom: 0.5rem;">
              ${post.frontmatter.excerpt || post.content.substring(0, 100) + '...'}
            </p>
          </div>
        </div>
      `;
    });
    
    if (results.length > 5) {
      resultsHTML += `
        <div style="text-align: center; margin-top: 1rem;">
          <a href="#posts" class="btn btn-ghost btn-sm" onclick="document.getElementById('search-overlay').classList.remove('active');">
            View All Results (${results.length})
          </a>
        </div>
      `;
    }
    
    resultsHTML += '</div>';
    
    document.getElementById('search-results').innerHTML = resultsHTML;
  } else {
    document.getElementById('search-results').innerHTML = '<p style="margin-top: 1.5rem;">No results found.</p>';
  }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
