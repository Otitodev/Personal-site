# Security Configuration

## Admin Routes Protection

This site uses a **development-only admin interface** for content management. Admin routes and write APIs are blocked in production builds.

## How It Works

### Development Mode (`npm run dev`)
✅ **Full Access:**
- `/admin` - Admin dashboard
- `/admin/blog/new` - Create blog posts
- `/admin/blog/edit/[slug]` - Edit blog posts
- `POST /api/blog/save` - Save posts to files
- `POST /api/upload/image` - Upload images
- `GET /api/blog/[slug]` - Load post data for editing

### Production Mode (Live Site)
🔒 **Blocked:**
- `/admin/*` - Returns 404
- `POST /api/blog/save` - Returns 404
- `POST /api/upload/image` - Returns 404
- `GET /api/blog/[slug]` - Returns 404 (use static pages instead)

✅ **Allowed:**
- `/` - Homepage
- `/blog` - Blog listing
- `/blog/[slug]` - Individual blog posts (static HTML)
- `/projects` - Projects listing
- `/projects/[slug]` - Individual projects (static HTML)

## Implementation

### 1. Middleware (`src/middleware.ts`)
Blocks admin routes and write APIs in production:
```typescript
const adminRoutes = ['/admin', '/api/blog/save', '/api/upload'];
if (isAdminRoute && !isDevelopment) {
  return new Response('Not Found', { status: 404 });
}
```

### 2. Build Configuration (`astro.config.mjs`)
Excludes admin code from production bundle:
```javascript
rollupOptions: {
  external: (id) => {
    if (process.env.NODE_ENV === 'production') {
      return id.includes('/admin/') || 
             id.includes('/api/blog/save') ||
             id.includes('/api/upload/');
    }
  }
}
```

### 3. Admin Pages
All admin pages check environment and redirect in production:
```astro
const isDev = import.meta.env.DEV;
if (!isDev) {
  return Astro.redirect('/404', 404);
}
```

## Content Management Workflow

### Local Development
1. Run `npm run dev`
2. Navigate to `/admin`
3. Create/edit content
4. Files saved to `src/content/blog/` or `src/content/projects/`
5. Review changes in Git

### Deployment
1. Commit changes: `git add . && git commit -m "Add new blog post"`
2. Push to repository: `git push`
3. Build runs: `npm run build`
4. Admin routes excluded from build
5. Static HTML generated from markdown
6. Deploy to hosting platform

### Live Site
- Visitors see fast, static HTML pages
- No admin interface accessible
- No write APIs available
- Content is read-only
- Secure by design

## Why This Approach?

### ✅ Advantages
- **Simple:** No authentication system needed
- **Secure:** No write access in production
- **Fast:** Static HTML is blazing fast
- **Git-based:** Version control for all content
- **Free hosting:** Works with Netlify, Vercel, Cloudflare Pages, etc.

### ⚠️ Limitations
- Can't edit content directly on live site
- Need local development environment
- Must redeploy to publish changes

## Alternative: Add Authentication

If you need to edit content on the live site, you would need:
1. Authentication service (Auth0, Clerk, Supabase Auth)
2. Server-side rendering (SSR) mode
3. Database or CMS backend
4. Session management
5. Protected API routes

This is more complex and requires a server, not static hosting.

## Testing Security

### Test in Development
```bash
npm run dev
# Visit http://localhost:4321/admin - Should work ✅
```

### Test Production Build
```bash
npm run build
npm run preview
# Visit http://localhost:4321/admin - Should return 404 ✅
```

## Files Involved

- `src/middleware.ts` - Route blocking logic
- `astro.config.mjs` - Build exclusions
- `src/pages/admin/` - Admin pages (dev-only)
- `src/pages/api/` - API routes (some dev-only)
- `.gitignore` - Excludes `public/uploads/`

## Deployment Checklist

Before deploying:
- [ ] Test production build locally: `npm run build && npm run preview`
- [ ] Verify `/admin` returns 404
- [ ] Verify blog posts display correctly
- [ ] Verify projects display correctly
- [ ] Check that images load properly
- [ ] Commit all content changes to Git
- [ ] Push to repository

## Support

If you need help with:
- Setting up deployment
- Configuring hosting platform
- Adding authentication
- Troubleshooting builds

Refer to the Astro documentation: https://docs.astro.build/
