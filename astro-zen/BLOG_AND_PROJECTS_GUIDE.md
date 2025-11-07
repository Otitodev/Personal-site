# Blog & Projects Features Guide

This guide explains how to use the new blog and projects features added to AstroZen.

## 🚀 New Features Added

### 1. Blog System
- **Blog listing page**: `/blog`
- **Individual blog posts**: `/blog/[slug]`
- **Content collections** for managing blog posts
- **Markdown support** with frontmatter metadata

### 2. Projects Showcase
- **Projects listing page**: `/projects`
- **Individual project pages**: `/projects/[slug]`
- **Featured projects** highlighting
- **Technology tags** and project status

### 3. Navigation Updates
- Updated main navigation to include Blog and Projects links
- Breadcrumb navigation on individual pages

## 📁 Content Structure

### Blog Posts
Create new blog posts in `src/content/blog/` with this frontmatter:

```markdown
---
title: "Your Blog Post Title"
description: "A brief description of your post"
publishDate: 2024-01-15
updatedDate: 2024-01-20  # Optional
heroImage: "/blog/hero-image.jpg"  # Optional
tags: ["web-development", "astro", "javascript"]
draft: false  # Set to true to hide from production
---

# Your Blog Content

Write your blog content here using Markdown...
```

### Projects
Create new projects in `src/content/projects/` with this frontmatter:

```markdown
---
title: "Project Name"
description: "Project description"
publishDate: 2024-01-10
heroImage: "/project-image.png"
technologies: ["React", "TypeScript", "Node.js"]
liveUrl: "https://your-project.com"  # Optional
githubUrl: "https://github.com/user/repo"  # Optional
featured: true  # Shows in featured section
status: "completed"  # completed | in-progress | planned
---

# Project Details

Detailed project information in Markdown...
```

## 🎨 Styling & Components

### New Components
- `BlogCard.astro` - Blog post preview cards
- `ProjectCard.astro` - Project showcase cards
- `BlogLayout.astro` - Layout for individual blog posts
- `ProjectLayout.astro` - Layout for individual project pages

### Icons Added
- `ExternalIcon.astro` - For external links
- `GithubIcon.astro` - For GitHub repository links

### CSS Enhancements
- Added prose styling for blog content
- Responsive card layouts
- Hover effects and transitions

## 🔧 Configuration

### Navigation
The site navigation has been updated in `src/config/index.ts`:
- Projects link now goes to `/projects` instead of `#projects`
- Added Blog link to `/blog`

### Content Collections
Content collections are configured in `src/content/config.ts` with:
- Type safety for frontmatter fields
- Validation schemas using Zod
- Automatic date parsing

## 📝 Usage Examples

### Adding a New Blog Post
1. Create a new `.md` file in `src/content/blog/`
2. Add the required frontmatter
3. Write your content in Markdown
4. The post will automatically appear on `/blog`

### Adding a New Project
1. Create a new `.md` file in `src/content/projects/`
2. Add the required frontmatter
3. Write your project details in Markdown
4. The project will automatically appear on `/projects`

### Featured Projects
Set `featured: true` in the project frontmatter to highlight it in the featured section on the projects page.

## 🚀 Development

To start the development server and see your changes:

```bash
npm run dev
```

Visit:
- `http://localhost:4321/blog` - Blog listing
- `http://localhost:4321/projects` - Projects listing
- Individual posts/projects will be available at their respective URLs

## 📱 Responsive Design

All new pages and components are fully responsive:
- Mobile-first design approach
- Optimized layouts for tablets and desktops
- Touch-friendly navigation and interactions

## ♿ Accessibility

The new features maintain AstroZen's accessibility standards:
- Semantic HTML structure
- Proper heading hierarchy
- Keyboard navigation support
- Screen reader friendly content

## 🎯 SEO Optimization

Both blog posts and projects include:
- Meta descriptions from frontmatter
- Proper heading structure
- Social media sharing support
- Canonical URLs

Enjoy your new blog and projects features! 🎉