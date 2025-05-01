# GitBlog Setup Guide

This guide will walk you through the process of setting up your own GitBlog instance.

## Prerequisites

Before you begin, make sure you have:

1. A GitHub account
2. Basic knowledge of Git and GitHub
3. (Optional) A custom domain if you want to use your own domain instead of the default GitHub Pages URL

## Step 1: Fork the Repository

1. Go to [https://github.com/netanelshriki/gitblog](https://github.com/netanelshriki/gitblog)
2. Click the "Fork" button in the top-right corner of the page
3. Wait for the repository to be forked to your account

## Step 2: Enable GitHub Pages

1. Go to your forked repository on GitHub
2. Click on "Settings" in the top menu
3. Scroll down to the "GitHub Pages" section
4. Under "Source", select the "main" branch
5. Click "Save"
6. Your GitBlog is now published at `https://yourusername.github.io/gitblog/`

## Step 3: Configure Your GitBlog

Open the `index.html` file in your repository and update the following configuration:

```javascript
// Update these settings with your information
const state = {
  // ... other properties ...
  repository: {
    owner: 'your-github-username',  // Change this to your GitHub username
    name: 'gitblog',                // Your repository name
    branch: 'main',                 // Your default branch
    postsDirectory: 'posts'         // Directory where your posts are stored
  }
};
```

## Step 4: GitHub OAuth Setup (Optional for Admin Features)

If you want to enable the admin features that require authentication:

1. Go to your GitHub account settings
2. Select "Developer settings" from the sidebar
3. Click on "OAuth Apps" and then "New OAuth App"
4. Fill in the form:
   - Application name: `Your Blog Name`
   - Homepage URL: `https://yourusername.github.io/gitblog/`
   - Authorization callback URL: `https://yourusername.github.io/gitblog/callback.html`
5. Click "Register application"
6. On the next screen, you'll see your Client ID
7. Click "Generate a new client secret" to generate a Client Secret
8. Update your `index.html` file with the Client ID:

```javascript
// Near the top of the script
const CLIENT_ID = 'your-client-id-here';
```

## Step 5: Create Your First Post

1. Navigate to the `posts` directory in your repository
2. Click "Add file" > "Create new file"
3. Name your file with the format: `YYYY-MM-DD-title-of-your-post.md`
4. Add your content following this template:

```markdown
---
title: Your Post Title
author: Your Name
date: YYYY-MM-DD
tags: [tag1, tag2, tag3]
image: https://example.com/your-image.jpg
excerpt: A brief summary of your post.
slug: title-of-your-post
---

# Your Post Title

Your content goes here. You can use **Markdown** formatting.
```

5. Click "Commit new file"

## Step 6: Customize Your Blog (Optional)

To customize the appearance of your blog, edit the CSS variables in the `index.html` file:

```css
:root {
  --primary: #6366f1;      /* Primary color */
  --primary-dark: #4f46e5; /* Darker shade of primary color */
  --secondary: #ec4899;    /* Secondary color */
  --dark: #1e293b;         /* Dark color (for text) */
  --light: #f8fabc;        /* Light color (for background) */
  /* ... other variables ... */
}
```

## Using a Custom Domain (Optional)

1. Go to your repository settings
2. Scroll to the "GitHub Pages" section
3. Under "Custom domain", enter your domain name
4. Click "Save"
5. Follow GitHub's instructions to set up DNS records with your domain provider

## Troubleshooting

If you encounter any issues during setup:

1. Make sure your repository is public
2. Check that GitHub Pages is properly configured
3. Verify that your OAuth settings are correct (if using authentication)
4. Check the browser console for any JavaScript errors

For more help, open an issue on the GitHub repository.
