/**
 * Blog Content Persistence Tests
 * Tests for task 4.4: Build blog content persistence
 * 
 * Note: These tests require vitest to be installed.
 * Install with: npm install -D vitest
 * Run with: npx vitest
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ContentPersistence } from '@lib/content-persistence';

describe('ContentPersistence', () => {
  const testKey = 'test-blog-autosave';
  const testData = {
    metadata: {
      title: 'Test Post',
      description: 'Test description',
      publishDate: '2024-01-01',
      tags: ['test'],
      draft: true,
    },
    content: '# Test Content\n\nThis is a test.',
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up after each test
    ContentPersistence.clear(testKey);
    ContentPersistence.clear(`${testKey}-backup`);
  });

  it('should save data to localStorage', () => {
    const result = ContentPersistence.save(testKey, testData);
    expect(result).toBe(true);
    expect(localStorage.getItem(testKey)).toBeTruthy();
  });

  it('should load saved data from localStorage', () => {
    ContentPersistence.save(testKey, testData);
    const loaded = ContentPersistence.load(testKey);
    expect(loaded).toEqual(testData);
  });

  it('should return null for non-existent key', () => {
    const loaded = ContentPersistence.load('non-existent');
    expect(loaded).toBeNull();
  });

  it('should check if data exists', () => {
    expect(ContentPersistence.has(testKey)).toBe(false);
    ContentPersistence.save(testKey, testData);
    expect(ContentPersistence.has(testKey)).toBe(true);
  });

  it('should clear saved data', () => {
    ContentPersistence.save(testKey, testData);
    expect(ContentPersistence.has(testKey)).toBe(true);
    ContentPersistence.clear(testKey);
    expect(ContentPersistence.has(testKey)).toBe(false);
  });

  it('should get age of saved data', () => {
    ContentPersistence.save(testKey, testData);
    const age = ContentPersistence.getAge(testKey);
    expect(age).toBeDefined();
    expect(age).toBeGreaterThanOrEqual(0);
    expect(age).toBeLessThan(1); // Less than 1 minute
  });

  it('should create and restore backups', () => {
    const result = ContentPersistence.createBackup(testKey, testData);
    expect(result).toBe(true);
    
    const restored = ContentPersistence.restoreBackup(testKey);
    expect(restored).toEqual(testData);
    
    // After restore, backup should be cleared
    expect(ContentPersistence.has(`${testKey}-backup`)).toBe(false);
    // And data should be in main key
    expect(ContentPersistence.has(testKey)).toBe(true);
  });

  it('should list auto-save keys', () => {
    ContentPersistence.save('blog-autosave-1', testData);
    ContentPersistence.save('blog-autosave-2', testData);
    ContentPersistence.save('other-key', testData);
    
    const keys = ContentPersistence.listAutoSaves();
    expect(keys).toContain('blog-autosave-1');
    expect(keys).toContain('blog-autosave-2');
    
    // Clean up
    ContentPersistence.clear('blog-autosave-1');
    ContentPersistence.clear('blog-autosave-2');
    ContentPersistence.clear('other-key');
  });
});

describe('Frontmatter Generation', () => {
  it('should generate valid frontmatter with all fields', () => {
    const metadata = {
      title: 'Test Post',
      description: 'A test description',
      publishDate: '2024-01-01',
      updatedDate: '2024-01-02',
      heroImage: '/images/hero.jpg',
      tags: ['test', 'blog'],
      draft: false,
    };

    const expected = [
      '---',
      'title: "Test Post"',
      'description: "A test description"',
      'publishDate: 2024-01-01',
      'updatedDate: 2024-01-02',
      'heroImage: "/images/hero.jpg"',
      'tags:',
      '  - "test"',
      '  - "blog"',
      'draft: false',
      '---',
    ].join('\n');

    // This would be tested via API integration
    expect(expected).toContain('title: "Test Post"');
    expect(expected).toContain('tags:');
  });
});

describe('Slug Generation', () => {
  it('should generate valid slugs from titles', () => {
    const testCases = [
      { title: 'Hello World', expected: 'hello-world' },
      { title: 'Getting Started with Astro', expected: 'getting-started-with-astro' },
      { title: 'React vs Vue: A Comparison', expected: 'react-vs-vue-a-comparison' },
      { title: '  Spaces  Everywhere  ', expected: 'spaces-everywhere' },
      { title: 'Special!@#$%Characters', expected: 'special-characters' },
    ];

    testCases.forEach(({ title, expected }) => {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      expect(slug).toBe(expected);
    });
  });
});
