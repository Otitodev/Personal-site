import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { slug } = params;
    
    if (!slug) {
      return new Response(
        JSON.stringify({ message: 'Slug is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the blog post entry
    const post = await getEntry('blog', slug);
    
    if (!post) {
      return new Response(
        JSON.stringify({ message: 'Blog post not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Read the raw markdown file to get the content
    const filePath = join(process.cwd(), 'src', 'content', 'blog', `${slug}.md`);
    const rawContent = await readFile(filePath, 'utf-8');
    
    // Extract content (everything after the frontmatter)
    const contentMatch = rawContent.match(/---\n[\s\S]*?\n---\n\n([\s\S]*)/);
    const content = contentMatch ? contentMatch[1] : '';

    const response = {
      metadata: {
        title: post.data.title,
        description: post.data.description,
        publishDate: post.data.publishDate.toISOString().split('T')[0],
        updatedDate: post.data.updatedDate?.toISOString().split('T')[0],
        heroImage: post.data.heroImage,
        tags: post.data.tags,
        draft: post.data.draft,
      },
      content,
    };
    
    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error loading blog post:', error);
    return new Response(
      JSON.stringify({ 
        message: 'Failed to load blog post',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
