# GitBlog Customization Guide

This guide explains how to customize the appearance and behavior of your GitBlog instance.

## Theming

GitBlog uses CSS variables for theming, allowing you to easily change colors, fonts, and other visual aspects.

### Changing Colors

To change the color scheme, edit the CSS variables in the `:root` selector in the `index.html` file:

```css
:root {
  --primary: #6366f1;         /* Primary color (links, buttons) */
  --primary-dark: #4f46e5;    /* Darker shade of primary color */
  --secondary: #ec4899;       /* Secondary color (accents) */
  --dark: #1e293b;            /* Dark color (text) */
  --light: #f8fafc;           /* Light color (background) */
  --gray: #64748b;            /* Gray color (secondary text) */
  --gray-light: #cbd5e1;      /* Light gray (borders) */
  --success: #10b981;         /* Success color */
  --warning: #f59e0b;         /* Warning color */
  --danger: #ef4444;          /* Danger/error color */
  --transition: all 0.25s cubic-bezier(0.645, 0.045, 0.355, 1);  /* Transition timing */
  --radius: 0.5rem;           /* Border radius */
  --shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);  /* Box shadow */
}
```

### Dark Mode Customization

The dark mode uses modified versions of these variables. To customize the dark mode appearance, edit the `.dark-mode` class:

```css
body.dark-mode {
  --light: #0f172a;        /* Dark mode background */
  --dark: #f8fafc;         /* Dark mode text */
  --gray: #94a3b8;         /* Dark mode secondary text */
  --gray-light: #334155;   /* Dark mode borders */
}
```

### Typography

To change the typography, modify the font-family definitions:

```css
body {
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  /* other properties */
}

/* Code font */
.post-content code {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  /* other properties */
}
```

## Layout Customization

### Container Width

To change the maximum width of the content container, modify:

```css
.container {
  width: 100%;
  max-width: 1200px;  /* Change this value */
  margin: 0 auto;
  padding: 0 1.5rem;
}
```

### Post Grid

To change the number of columns in the post grid, modify:

```css
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));  /* Change minmax value */
  gap: 2rem;
  margin-bottom: 3rem;
}
```

## Adding Custom Pages

You can add custom pages by extending the router:

1. Open `index.html`
2. Find the `Router` class
3. Add a new route in the constructor:

```javascript
this.routes = {
  '#home': this.homePage,
  '#posts': this.postsPage,
  // ... other routes ...
  '#custom-page': this.customPageFunction  // Add your custom route
};
```

4. Create a corresponding route handler method:

```javascript
customPageFunction() {
  document.querySelector('#app').innerHTML = `
    <div class="fade-in-up">
      <h1>Your Custom Page</h1>
      <p>Custom content goes here...</p>
    </div>
  `;
  
  // Add any necessary event listeners or functionality
}
```

## Customizing Header and Footer

### Header

To customize the header, find the header section in the HTML:

```html
<header class="header">
  <div class="container">
    <nav>
      <!-- Modify this section -->
    </nav>
  </div>
</header>
```

### Footer

To customize the footer, find the footer section in the HTML:

```html
<footer class="footer">
  <div class="container">
    <!-- Modify this section -->
  </div>
</footer>
```

## Adding Custom JavaScript Functionality

To add custom JavaScript functionality:

1. Find the end of the `script` tag in `index.html`
2. Add your custom functions before the closing `</script>` tag

```javascript
// Add your custom functions here
function myCustomFunction() {
  // Your code here
}

// Initialization
document.addEventListener('DOMContentLoaded', function() {
  // Call your custom initialization code here
  myCustomFunction();
});
```

## Advanced Customization

### Customizing Post Templates

To change how posts are displayed, modify the post template in `fetchPostById()` function:

```javascript
async function fetchPostById(id) {
  // ... existing code ...
  
  // Modify this template
  const postHTML = `
    <div class="post-header">
      <!-- Customize post header -->
    </div>
    
    <img src="${post.image}" alt="Post Cover" class="post-cover">
    
    <div class="post-content">
      <!-- Customize post content -->
    </div>
  `;
  
  // ... existing code ...
}
```

### Adding Analytics

To add analytics tracking:

```javascript
// Add this near the end of your JavaScript
function initializeAnalytics() {
  // Google Analytics example
  if (typeof gtag === 'function') {
    // Track page views
    document.addEventListener('hashchange', function() {
      gtag('config', 'YOUR-GA-ID', {
        'page_path': location.pathname + location.hash
      });
    });
  }
}

// Call during initialization
initializeAnalytics();
```

### Custom Domain Setup

To use a custom domain with GitHub Pages:

1. Add a `CNAME` file to your repository with your domain name
2. Configure your domain's DNS settings:
   - For apex domains (example.com): Add A records pointing to GitHub's IP addresses
   - For subdomains (blog.example.com): Add a CNAME record pointing to `yourusername.github.io`
3. Enable HTTPS in your repository settings

## Sharing Your Customizations

If you create a custom theme or feature that others might find useful:

1. Fork the GitBlog repository
2. Make your customizations
3. Create a pull request with a description of your changes
4. Or, publish your customized version as a separate theme

## Getting Help

If you need help with customization:

1. Check the GitBlog documentation
2. Open an issue on the GitHub repository
3. Reach out to the community for assistance
