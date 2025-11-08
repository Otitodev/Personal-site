import { useState, useRef, type DragEvent } from 'react';

interface ImageUploadProps {
  onUpload: (file: File) => Promise<string>;
  onInsert: (url: string, alt?: string) => void;
}

export default function ImageUpload({ onUpload, onInsert }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      await uploadFile(imageFile);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const url = await onUpload(file);
      setImageUrl(url);
      setAltText(file.name.replace(/\.[^/.]+$/, ''));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInsert = () => {
    if (imageUrl) {
      onInsert(imageUrl, altText);
      setImageUrl('');
      setAltText('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag and Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-grey-300 bg-grey-50 hover:border-grey-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isUploading ? (
          <div className="space-y-2">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-grey-600">Uploading...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-4xl">📷</div>
            <div>
              <p className="text-sm font-medium text-grey-700">
                Drag and drop an image here
              </p>
              <p className="text-xs text-grey-500 mt-1">or</p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Browse Files
            </button>
          </div>
        )}
      </div>

      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{uploadError}</p>
        </div>
      )}

      {/* Image Preview and Insert */}
      {imageUrl && (
        <div className="space-y-3 p-4 bg-white border border-grey-200 rounded-lg">
          <img
            src={imageUrl}
            alt={altText}
            className="max-h-48 mx-auto rounded"
          />
          <div>
            <label className="block text-sm font-medium text-grey-700 mb-1">
              Alt Text
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the image"
            />
          </div>
          <button
            type="button"
            onClick={handleInsert}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Insert Image
          </button>
        </div>
      )}

      {/* Manual URL Input */}
      <div className="pt-4 border-t border-grey-200">
        <p className="text-sm font-medium text-grey-700 mb-3">
          Or insert image by URL
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="flex-1 px-3 py-2 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/image.jpg"
          />
          <button
            type="button"
            onClick={handleInsert}
            disabled={!imageUrl}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
}
