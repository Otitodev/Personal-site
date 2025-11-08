import { useState } from 'react';

interface CodeBlockInserterProps {
  onInsert: (code: string, language: string) => void;
}

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'bash', label: 'Bash' },
  { value: 'sql', label: 'SQL' },
  { value: 'plaintext', label: 'Plain Text' },
];

export default function CodeBlockInserter({ onInsert }: CodeBlockInserterProps) {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');

  const handleInsert = () => {
    if (code.trim()) {
      onInsert(code, language);
      setCode('');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-grey-700 mb-2">
          Language
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-grey-700 mb-2">
          Code
        </label>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={10}
          className="w-full px-3 py-2 font-mono text-sm border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Paste or type your code here..."
        />
      </div>

      <button
        type="button"
        onClick={handleInsert}
        disabled={!code.trim()}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Insert Code Block
      </button>
    </div>
  );
}
