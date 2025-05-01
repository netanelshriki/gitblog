---
title: Getting Started with GitBlog
author: Admin
date: 2025-05-01
tags: [gitblog, github, markdown, tutorial]
image: https://via.placeholder.com/1200x600
excerpt: Learn how to set up and customize your GitBlog instance for an optimal blogging experience on GitHub Pages.
slug: getting-started-with-gitblog
---

# Getting Started with GitBlog

Welcome to GitBlog! This post will guide you through the basics of setting up and using your new GitHub-based blogging platform.

## What is GitBlog?

GitBlog is a modern blogging platform that uses GitHub as its database. All your posts are stored as Markdown files in your repository, making version control and collaboration a breeze.

## Key Features

- **Beautiful UI with animations**: Clean, modern design with smooth transitions
- **Dark/Light mode**: Toggle between themes for comfortable reading
- **GitHub-powered backend**: All posts are stored as markdown files in your GitHub repository
- **Code highlighting**: Beautiful syntax highlighting for code blocks

## Writing Your First Post

Creating a new post is simple. Just create a new Markdown file in the `posts` directory with the following format:

```markdown
---
title: Your Post Title
author: Your Name
date: YYYY-MM-DD
tags: [tag1, tag2, tag3]
image: https://example.com/image.jpg
excerpt: Brief summary of your post.
slug: your-post-title
---

# Your Post Title

Content goes here...
```

## Using Markdown

GitBlog supports standard Markdown syntax, including:

### Headers

```
# H1
## H2
### H3
```

### Emphasis

```
*italic* or _italic_
**bold** or __bold__
```

### Lists

```
- Item 1
- Item 2
  - Subitem 2.1
  - Subitem 2.2

1. First item
2. Second item
```

### Code Blocks

```javascript
function greeting(name) {
  return `Hello, ${name}!`;
}

console.log(greeting('World'));
```

## Customizing Your Blog

You can customize your blog by editing the CSS variables in the `:root` selector:

```css
:root {
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --secondary: #ec4899;
  --dark: #1e293b;
  --light: #f8fafc;
  /* other variables */
}
```

## Conclusion

GitBlog provides a modern, feature-rich blogging experience while leveraging the power of GitHub for content management. We hope you enjoy using it!

Happy blogging!
