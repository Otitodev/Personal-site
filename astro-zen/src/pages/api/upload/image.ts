import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop();
  const baseName = originalName
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  return `${baseName}-${timestamp}.${extension}`;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return new Response(
        JSON.stringify({ message: 'No image file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return new Response(
        JSON.stringify({ message: 'File must be an image' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ message: 'Image size must be less than 5MB' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique filename
    const fileName = generateFileName(file.name);
    
    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });
    
    // Write file
    const filePath = join(uploadsDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
    
    // Return public URL
    const publicUrl = `/uploads/${fileName}`;
    
    return new Response(
      JSON.stringify({ 
        message: 'Image uploaded successfully',
        url: publicUrl,
        fileName
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error uploading image:', error);
    return new Response(
      JSON.stringify({ 
        message: 'Failed to upload image',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
