# Creating Posts in GitBlog

This guide explains how to create and manage blog posts in your GitBlog instance.

## Post File Structure

GitBlog uses Markdown files with YAML frontmatter to store posts. Each post is a separate file in the `posts` directory with the following structure:

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

Your content goes here...
```

## File Naming Convention

Name your post files using the following format:

```
YYYY-MM-DD-title-of-your-post.md
```

For example:
```
2025-05-01-getting-started-with-gitblog.md
```

This helps maintain chronological order in file listings.

## Frontmatter Fields

The YAML frontmatter at the top of each post file (between the `---` markers) contains metadata about your post:

| Field | Description | Required |
|-------|-------------|----------|
| `title` | The title of your post | Yes |
| `author` | The author's name | Yes |
| `date` | Publication date in YYYY-MM-DD format | Yes |
| `tags` | Array of relevant tags | No, but recommended |
| `image` | URL to the cover image | No, but recommended |
| `excerpt` | Brief summary of the post | No, but recommended |
| `slug` | URL-friendly version of the title | Yes |

## Writing Content

After the frontmatter, write your post content using Markdown syntax. GitBlog supports standard Markdown features:

### Headers

```markdown
# H1 Header
## H2 Header
### H3 Header
```

### Emphasis

```markdown
*italic* or _italic_
**bold** or __bold__
***bold italic*** or ___bold italic___
```

### Lists

```markdown
- Unordered item 1
- Unordered item 2
  - Nested item 2.1
  - Nested item 2.2

1. Ordered item 1
2. Ordered item 2
```

### Links

```markdown
[Link text](https://example.com)
```

### Images

```markdown
![Alt text](https://example.com/image.jpg)
```

### Blockquotes

```markdown
> This is a blockquote
```

### Code

Inline code:
```markdown
`code`
```

Code blocks:
````markdown
```javascript
function greeting() {
  return 'Hello, world!';
}
```
````

## Code Syntax Highlighting

GitBlog supports syntax highlighting for many programming languages. Specify the language after the opening backticks:

````markdown
```javascript
// JavaScript code
function greeting() {
  return 'Hello, world!';
}
```

```python
# Python code
def greeting():
    return "Hello, world!"
```

```css
/* CSS code */
body {
  font-family: sans-serif;
  color: #333;
}
```
````

## Creating Posts in GitHub

1. Navigate to your repository on GitHub
2. Go to the `posts` directory
3. Click "Add file" > "Create new file"
4. Name your file with the format described above
5. Add your frontmatter and content
6. Click "Commit new file"

## Creating Posts Locally

If you prefer to work locally:

1. Clone your repository to your local machine
2. Create a new file in the `posts` directory
3. Add your frontmatter and content
4. Commit and push your changes to GitHub

## Updating Posts

To update an existing post:

1. Navigate to the post file in your repository
2. Click the edit button (pencil icon)
3. Make your changes
4. Commit the changes

## Deleting Posts

To remove a post:

1. Navigate to the post file in your repository
2. Click the delete button (trash icon)
3. Commit the deletion

## Adding Images

For post images, we recommend:

1. Hosting images on a reliable service (GitHub, Imgur, etc.)
2. Using relative links for images stored in your repository
3. Optimizing images for web usage (compressed, appropriate dimensions)

## Publishing Workflow

When you commit new post files to your repository, GitBlog automatically detects them and updates your blog. There's no need for a separate build or deploy process.
