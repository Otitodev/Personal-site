# Project Structure

## Root Directory
```
astro-zen/
├── src/                    # Source code
├── public/                 # Static assets
├── dist/                   # Build output
├── .astro/                 # Astro generated files
├── astro.config.mjs        # Astro configuration
├── components.json         # Shadcn/ui configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

## Source Organization (`src/`)

### Core Directories
- **`components/`** - Reusable Astro components (About, Hero, Header, Footer, etc.)
- **`layouts/`** - Page layouts (Layout.astro, BlogLayout.astro, ProjectLayout.astro)
- **`pages/`** - File-based routing (index.astro, blog/, projects/)
- **`content/`** - Content collections (blog/, projects/, config.ts)
- **`styles/`** - Global CSS (global.css with TailwindCSS)

### Supporting Directories
- **`icons/`** - Custom icon components (Menu.astro, GithubIcon.astro, ExternalIcon.astro)
- **`lib/`** - Utility functions (utils.ts with cn() helper)
- **`types/`** - TypeScript type definitions
- **`config/`** - Site configuration and constants

## Content Collections Structure

### Blog Posts (`src/content/blog/`)
- Markdown files with frontmatter schema
- Required: title, description, publishDate
- Optional: updatedDate, heroImage, tags, draft

### Projects (`src/content/projects/`)
- Markdown files with project details
- Required: title, description, publishDate
- Optional: heroImage, technologies, liveUrl, githubUrl, featured, status

## Routing Patterns
- **Static pages**: `src/pages/index.astro` → `/`
- **Blog listing**: `src/pages/blog/index.astro` → `/blog`
- **Blog posts**: `src/pages/blog/[...slug].astro` → `/blog/{slug}`
- **Projects listing**: `src/pages/projects/index.astro` → `/projects`
- **Project pages**: `src/pages/projects/[...slug].astro` → `/projects/{slug}`

## Component Conventions
- Use `.astro` extension for Astro components
- Place reusable UI components in `src/components/`
- Store layout components in `src/layouts/`
- Keep icons as separate components in `src/icons/`
- Use TypeScript path aliases for imports (`@/`, `@components/`, etc.)

## Styling Approach
- TailwindCSS utility classes for styling
- Global styles in `src/styles/global.css`
- Component-scoped styles using Astro's `<style>` tags
- Responsive design with mobile-first approach