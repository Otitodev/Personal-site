import { useState, useCallback, useRef, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import ImageUpload from './ImageUpload';
import CodeBlockInserter from './CodeBlockInserter';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onImageUpload?: (file: File) => Promise<string>;
}

export default function MarkdownEditor({ value, onChange, placeholder, onImageUpload }: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showCodeInserter, setShowCodeInserter] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const insertText = useCallback((before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [value, onChange]);

  const formatBold = () => insertText('**', '**');
  const formatItalic = () => insertText('*', '*');
  const formatCode = () => insertText('`', '`');
  const formatLink = () => insertText('[', '](url)');
  
  const insertHeading = (level: number) => {
    const prefix = '#'.repeat(level) + ' ';
    insertText(prefix);
  };

  const insertList = (ordered: boolean = false) => {
    const prefix = ordered ? '1. ' : '- ';
    insertText(prefix);
  };

  const insertCodeBlock = () => {
    insertText('\n```\n', '\n```\n');
  };

  const handleImageInsert = (url: string, alt: string = '') => {
    insertText(`![${alt}](${url})`);
    setShowImageUpload(false);
  };

  const handleCodeInsert = (code: string, language: string) => {
    insertText(`\n\`\`\`${language}\n${code}\n\`\`\`\n`);
    setShowCodeInserter(false);
  };

  const handleImageUploadWrapper = async (file: File): Promise<string> => {
    if (onImageUpload) {
      return await onImageUpload(file);
    }
    // Fallback: create a local object URL (not persisted)
    return URL.createObjectURL(file);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-3 bg-grey-50 border-b border-grey-200">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => insertHeading(1)}
            className="px-3 py-1.5 text-sm font-medium bg-white border border-grey-300 rounded hover:bg-grey-50 transition-colors"
            title="Heading 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => insertHeading(2)}
            className="px-3 py-1.5 text-sm font-medium bg-white border border-grey-300 rounded hover:bg-grey-50 transition-colors"
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => insertHeading(3)}
            className="px-3 py-1.5 text-sm font-medium bg-white border border-grey-300 rounded hover:bg-grey-50 transition-colors"
            title="Heading 3"
          >
            H3
          </button>
        </div>

        <div className="w-px bg-grey-300" />

        <div className="flex gap-1">
          <button
            type="button"
            onClick={formatBold}
            className="px-3 py-1.5 text-sm font-bold bg-white border border-grey-300 rounded hover:bg-grey-50 transition-colors"
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={formatItalic}
            className="px-3 py-1.5 text-sm italic bg-white border border-grey-300 rounded hover:bg-grey-50 transition-colors"
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={formatCode}
            className="px-3 py-1.5 text-sm font-mono bg-white border border-grey-300 rounded hover:bg-grey-50 transition-colors"
            title="Inline Code"
          >
            {'</>'}
          </button>
        </div>

        <div className="w-px bg-grey-300" />

        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => insertList(false)}
            className="px-3 py-1.5 text-sm bg-white border border-grey-300 rounded hover:bg-grey-50 transition-colors"
            title="Bullet List"
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => insertList(true)}
            className="px-3 py-1.5 text-sm bg-white border border-grey-300 rounded hover:bg-grey-50 transition-colors"
            title="Numbered List"
          >
            1. List
          </button>
        </div>

        <div className="w-px bg-grey-300" />

        <div className="flex gap-1">
          <button
            type="button"
            onClick={formatLink}
            className="px-3 py-1.5 text-sm bg-white border border-grey-300 rounded hover:bg-grey-50 transition-colors"
            title="Insert Link"
          >
            🔗 Link
          </button>
          <button
            type="button"
            onClick={() => setShowImageUpload(!showImageUpload)}
            className={`px-3 py-1.5 text-sm border rounded transition-colors ${
              showImageUpload
                ? 'bg-blue-100 border-blue-300'
                : 'bg-white border-grey-300 hover:bg-grey-50'
            }`}
            title="Insert Image"
          >
            🖼️ Image
          </button>
          <button
            type="button"
            onClick={() => setShowCodeInserter(!showCodeInserter)}
            className={`px-3 py-1.5 text-sm border rounded transition-colors ${
              showCodeInserter
                ? 'bg-blue-100 border-blue-300'
                : 'bg-white border-grey-300 hover:bg-grey-50'
            }`}
            title="Insert Code Block"
          >
            {'{ } Code'}
          </button>
        </div>

        <div className="ml-auto">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${
              showPreview
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-white border border-grey-300 hover:bg-grey-50'
            }`}
          >
            {showPreview ? 'Edit' : 'Preview'}
          </button>
        </div>
      </div>

      {/* Editor/Preview Area */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {showPreview ? (
            <MarkdownPreview content={value} />
          ) : (
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleChange}
              placeholder={placeholder || 'Write your content in Markdown...'}
              className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
            />
          )}
        </div>

        {/* Side Panel for Image Upload or Code Inserter */}
        {(showImageUpload || showCodeInserter) && (
          <div className="w-96 border-l border-grey-200 overflow-y-auto bg-grey-50 p-4">
            {showImageUpload && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-grey-900">Insert Image</h3>
                  <button
                    type="button"
                    onClick={() => setShowImageUpload(false)}
                    className="text-grey-500 hover:text-grey-700"
                  >
                    ✕
                  </button>
                </div>
                <ImageUpload
                  onUpload={handleImageUploadWrapper}
                  onInsert={handleImageInsert}
                />
              </div>
            )}
            {showCodeInserter && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-grey-900">Insert Code Block</h3>
                  <button
                    type="button"
                    onClick={() => setShowCodeInserter(false)}
                    className="text-grey-500 hover:text-grey-700"
                  >
                    ✕
                  </button>
                </div>
                <CodeBlockInserter onInsert={handleCodeInsert} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface MarkdownPreviewProps {
  content: string;
}

function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    // Simple markdown to HTML conversion
    // In production, you'd use a library like marked or remark
    const convertMarkdown = (md: string): string => {
      let result = md;

      // Headers
      result = result.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>');
      result = result.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>');
      result = result.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-10 mb-5">$1</h1>');

      // Bold
      result = result.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');

      // Italic
      result = result.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

      // Inline code
      result = result.replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 bg-grey-100 rounded text-sm font-mono">$1</code>');

      // Code blocks
      result = result.replace(/```([\s\S]*?)```/g, '<pre class="p-4 bg-grey-900 text-grey-100 rounded-lg overflow-x-auto my-4"><code class="font-mono text-sm">$1</code></pre>');

      // Links
      result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>');

      // Unordered lists
      result = result.replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>');
      result = result.replace(/(<li.*<\/li>)/s, '<ul class="list-disc my-4">$1</ul>');

      // Ordered lists
      result = result.replace(/^\d+\. (.*$)/gim, '<li class="ml-4">$1</li>');

      // Paragraphs
      result = result.split('\n\n').map(para => {
        if (para.trim() && !para.startsWith('<')) {
          return `<p class="my-4">${para}</p>`;
        }
        return para;
      }).join('\n');

      return result;
    };

    setHtml(convertMarkdown(content));
  }, [content]);

  return (
    <div 
      className="h-full overflow-y-auto p-6 prose prose-slate max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
