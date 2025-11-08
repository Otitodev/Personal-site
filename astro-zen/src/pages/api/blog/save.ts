import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

interface BlogMetadata {
  title: string;
  description: string;
  publishDate: string;
  updatedDate?: string;
  heroImage?: string;
  tags: string[];
  draft: boolean;
}

interface BlogContent {
  metadata: BlogMetadata;
  content: string;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateFrontmatter(metadata: BlogMetadata): string {
  const lines = ['---'];
  
  lines.push(`title: "${metadata.title.replace(/"/g, '\\"')}"`);
  lines.push(`description: "${metadata.description.replace(/"/g, '\\"')}"`);
  lines.push(`publishDate: ${metadata.publishDate}`);
  
  if (metadata.updatedDate) {
    lines.push(`updatedDate: ${metadata.updatedDate}`);
  }
  
  if (metadata.heroImage) {
    lines.push(`heroImage: "${metadata.heroImage}"`);
  }
  
  if (metadata.tags.length > 0) {
    lines.push(`tags:`);
    metadata.tags.forEach(tag => {
      lines.push(`  - "${tag}"`);
    });
  }
  
  lines.push(`draft: ${metadata.draft}`);
  lines.push('---');
  
  return lines.join('\n');
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const data: BlogContent = await request.json();
    
    // Validate required fields
    if (!data.metadata.title || !data.metadata.description || !data.content) {
      return new Response(
        JSON.stringify({ message: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate slug from title
    const slug = generateSlug(data.metadata.title);
    
    // Set updatedDate if not provided
    if (!data.metadata.updatedDate) {
      data.metadata.updatedDate = new Date().toISOString().split('T')[0];
    }
    
    // Generate frontmatter
    const frontmatter = generateFrontmatter(data.metadata);
    
    // Combine frontmatter and content
    const fileContent = `${frontmatter}\n\n${data.content}`;
    
    // Ensure blog directory exists
    const blogDir = join(process.cwd(), 'src', 'content', 'blog');
    await mkdir(blogDir, { recursive: true });
    
    // Write file
    const filePath = join(blogDir, `${slug}.md`);
    await writeFile(filePath, fileContent, 'utf-8');
    
    return new Response(
      JSON.stringify({ 
        message: 'Blog post saved successfully',
        slug,
        filePath: `src/content/blog/${slug}.md`
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error saving blog post:', error);
    return new Response(
      JSON.stringify({ 
        message: 'Failed to save blog post',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
