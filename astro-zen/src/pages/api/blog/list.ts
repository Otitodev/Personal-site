import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  try {
    const blogPosts = await getCollection('blog');
    
    const posts = blogPosts.map(post => ({
      slug: post.slug,
      title: post.data.title,
      description: post.data.description,
      publishDate: post.data.publishDate.toISOString(),
      updatedDate: post.data.updatedDate?.toISOString(),
      heroImage: post.data.heroImage,
      tags: post.data.tags,
      draft: post.data.draft,
    }));

    // Sort by publish date, newest first
    posts.sort((a, b) => 
      new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );
    
    return new Response(
      JSON.stringify({ posts }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error listing blog posts:', error);
    return new Response(
      JSON.stringify({ 
        message: 'Failed to list blog posts',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
