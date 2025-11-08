/**
 * Middleware: Block Admin Routes in Production
 * 
 * Prevents access to admin pages and API routes in production builds.
 * These routes are only available in development mode.
 */

import { defineMiddleware } from 'astro:middleware';

const isDevelopment = import.meta.env.DEV;

// Routes that should only be accessible in development
const adminRoutes = [
  '/admin',
  '/api/blog/save',
  '/api/upload',
];

// Routes that are safe in production (read-only)
const publicApiRoutes = [
  '/api/blog/list',
];

export const onRequest = defineMiddleware((context, next) => {
  const { url } = context;
  const pathname = url.pathname;

  // Check if this is an admin route
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  
  // Check if this is a public API route
  const isPublicApi = publicApiRoutes.some(route => pathname.startsWith(route));

  // Block admin routes in production
  if (isAdminRoute && !isDevelopment) {
    return new Response('Not Found', {
      status: 404,
      statusText: 'Not Found',
    });
  }

  // Block read API for individual posts in production (they should use static pages)
  if (pathname.match(/^\/api\/blog\/[^/]+$/) && !isDevelopment) {
    return new Response('Not Found', {
      status: 404,
      statusText: 'Not Found',
    });
  }

  return next();
});
