import { useState, useEffect, useRef } from 'react';
import MarkdownEditor from './MarkdownEditor';
import { ContentPersistence } from '@lib/content-persistence';

export interface BlogMetadata {
  title: string;
  description: string;
  publishDate: string;
  updatedDate?: string;
  heroImage?: string;
  tags: string[];
  draft: boolean;
}

export interface BlogContent {
  metadata: BlogMetadata;
  content: string;
}

interface BlogEditorProps {
  initialData?: BlogContent;
  onSave: (data: BlogContent) => Promise<void>;
  onCancel?: () => void;
  onImageUpload?: (file: File) => Promise<string>;
}

export default function BlogEditor({ initialData, onSave, onCancel, onImageUpload }: BlogEditorProps) {
  const [metadata, setMetadata] = useState<BlogMetadata>(
    initialData?.metadata || {
      title: '',
      description: '',
      publishDate: new Date().toISOString().split('T')[0],
      tags: [],
      draft: true,
    }
  );

  const [content, setContent] = useState(initialData?.content || '');
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save to localStorage with status tracking
  useEffect(() => {
    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Mark as unsaved when content changes
    setAutoSaveStatus('unsaved');

    // Set new timer for auto-save
    autoSaveTimerRef.current = setTimeout(() => {
      setAutoSaveStatus('saving');
      const dataToSave: BlogContent = { metadata, content };
      
      const success = ContentPersistence.save('blog-editor-autosave', dataToSave);
      if (success) {
        setAutoSaveStatus('saved');
        setLastSaved(new Date());
      } else {
        setAutoSaveStatus('unsaved');
      }
    }, 2000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [metadata, content]);

  // Load from localStorage on mount
  useEffect(() => {
    if (!initialData) {
      const saved = ContentPersistence.load<BlogContent>('blog-editor-autosave');
      if (saved) {
        const age = ContentPersistence.getAge('blog-editor-autosave');
        const ageMinutes = age ? Math.round(age) : 0;
        
        if (confirm(`Found unsaved changes from ${ageMinutes} minutes ago. Would you like to restore them?`)) {
          setMetadata(saved.metadata);
          setContent(saved.content);
          setLastSaved(new Date(Date.now() - ageMinutes * 60 * 1000));
        } else {
          ContentPersistence.clear('blog-editor-autosave');
        }
      }
    }

    // Listen for blog data loaded event (for edit mode)
    const handleDataLoaded = (event: CustomEvent) => {
      const data = event.detail;
      setMetadata(data.metadata);
      setContent(data.content);
      setAutoSaveStatus('saved');
      setLastSaved(new Date());
    };

    window.addEventListener('blog-data-loaded', handleDataLoaded as EventListener);
    return () => {
      window.removeEventListener('blog-data-loaded', handleDataLoaded as EventListener);
    };
  }, [initialData]);

  const handleMetadataChange = (field: keyof BlogMetadata, value: any) => {
    setMetadata(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !metadata.tags.includes(tagInput.trim())) {
      setMetadata(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageUpload) return;

    setIsUploadingHero(true);
    try {
      const url = await onImageUpload(file);
      handleMetadataChange('heroImage', url);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to upload hero image');
    } finally {
      setIsUploadingHero(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!metadata.title.trim()) {
      setSaveError('Title is required');
      return;
    }
    if (!metadata.description.trim()) {
      setSaveError('Description is required');
      return;
    }
    if (!content.trim()) {
      setSaveError('Content is required');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      // Create backup before saving
      ContentPersistence.createBackup('blog-editor-autosave', { metadata, content });
      
      await onSave({ metadata, content });
      
      // Clear auto-save after successful save
      ContentPersistence.clear('blog-editor-autosave');
      ContentPersistence.clear('blog-editor-autosave-backup');
      
      setAutoSaveStatus('saved');
      setLastSaved(new Date());
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save');
      
      // Restore from backup if save failed
      const backup = ContentPersistence.restoreBackup<BlogContent>('blog-editor-autosave');
      if (backup) {
        console.log('Restored from backup after save failure');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const getAutoSaveStatusText = () => {
    if (autoSaveStatus === 'saving') return 'Saving draft...';
    if (autoSaveStatus === 'saved' && lastSaved) {
      const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
      if (seconds < 60) return `Draft saved ${seconds}s ago`;
      const minutes = Math.floor(seconds / 60);
      return `Draft saved ${minutes}m ago`;
    }
    if (autoSaveStatus === 'unsaved') return 'Unsaved changes';
    return 'Draft saved';
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-grey-200 bg-white">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-grey-900">
            {initialData ? 'Edit Blog Post' : 'New Blog Post'}
          </h1>
          <span className={`text-sm ${
            autoSaveStatus === 'saved' ? 'text-grey-500' : 
            autoSaveStatus === 'saving' ? 'text-blue-600' : 
            'text-orange-600'
          }`}>
            {getAutoSaveStatusText()}
          </span>
        </div>
        <div className="flex gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-grey-700 bg-white border border-grey-300 rounded-lg hover:bg-grey-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Post'}
          </button>
        </div>
      </div>

      {saveError && (
        <div className="px-6 py-3 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-800">{saveError}</p>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Metadata Sidebar */}
        <div className="w-80 border-r border-grey-200 overflow-y-auto bg-grey-50">
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-grey-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) => handleMetadataChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter post title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-grey-700 mb-2">
                Description *
              </label>
              <textarea
                value={metadata.description}
                onChange={(e) => handleMetadataChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Brief description of the post"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-grey-700 mb-2">
                Publish Date *
              </label>
              <input
                type="date"
                value={metadata.publishDate}
                onChange={(e) => handleMetadataChange('publishDate', e.target.value)}
                className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-grey-700 mb-2">
                Hero Image
              </label>
              
              {metadata.heroImage && (
                <div className="mb-3 relative">
                  <img
                    src={metadata.heroImage}
                    alt="Hero preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleMetadataChange('heroImage', '')}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    title="Remove image"
                  >
                    ✕
                  </button>
                </div>
              )}

              <input
                ref={heroImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleHeroImageUpload}
                className="hidden"
              />

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => heroImageInputRef.current?.click()}
                  disabled={isUploadingHero}
                  className="w-full px-3 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUploadingHero ? 'Uploading...' : 'Upload Hero Image'}
                </button>
                
                <input
                  type="text"
                  value={metadata.heroImage || ''}
                  onChange={(e) => handleMetadataChange('heroImage', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Or enter image URL"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-grey-700 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 px-3 py-2 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {metadata.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={metadata.draft}
                  onChange={(e) => handleMetadataChange('draft', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-grey-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-grey-700">
                  Save as draft
                </span>
              </label>
              <p className="mt-1 text-xs text-grey-500">
                Drafts won't appear on the published site
              </p>
            </div>
          </div>
        </div>

        {/* Content Editor */}
        <div className="flex-1 flex flex-col">
          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="Write your blog post content here..."
            onImageUpload={onImageUpload}
          />
        </div>
      </div>
    </div>
  );
}
