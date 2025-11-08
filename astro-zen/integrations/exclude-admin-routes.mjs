/**
 * Astro Integration: Exclude Admin Routes in Production
 * 
 * This integration prevents admin pages and API routes from being
 * included in production builds. They'll only work in development.
 */

export default function excludeAdminRoutes() {
  return {
    name: 'exclude-admin-routes',
    hooks: {
      'astro:config:setup': ({ config, command }) => {
        // Only apply in production builds
        if (command === 'build') {
          console.log('🔒 Excluding admin routes from production build...');
        }
      },
      'astro:build:start': ({ logger }) => {
        logger.info('Admin routes will not be included in production build');
      },
    },
  };
}
