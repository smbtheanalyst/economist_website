'use client';

import React, { useState, useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
}

export function RichTextEditor({
  value,
  onChange,
  label = 'Content (Visual Editor)',
  placeholder = 'Write content here. Use toolbar buttons for formatting...',
  rows = 12,
}: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormatting = (prefix: string, suffix: string, defaultText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || defaultText;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 10);
  };

  const handleHeading2 = () => insertFormatting('<h2>', '</h2>', 'Section Heading');
  const handleHeading3 = () => insertFormatting('<h3>', '</h3>', 'Subsection Heading');
  const handleParagraph = () => insertFormatting('<p>', '</p>', 'Paragraph text');
  const handleBold = () => insertFormatting('<strong>', '</strong>', 'bold text');
  const handleItalic = () => insertFormatting('<em>', '</em>', 'italic text');
  const handleBulletList = () => {
    insertFormatting(
      '<ul>\n  <li>',
      '</li>\n  <li>Second item</li>\n</ul>',
      'First item'
    );
  };
  const handleNumberedList = () => {
    insertFormatting(
      '<ol>\n  <li>',
      '</li>\n  <li>Second item</li>\n</ol>',
      'First item'
    );
  };
  const handleQuote = () => insertFormatting('<blockquote><p>', '</p></blockquote>', 'Quoted institutional statement');
  const handleLink = () => {
    const url = prompt('Enter link URL (e.g. https://tefpc.or.tz/research or /about):', 'https://');
    if (!url) return;
    insertFormatting(`<a href="${url}" target="_blank" rel="noopener noreferrer">`, '</a>', 'Link label');
  };
  const handleImage = () => {
    const src = prompt('Enter image URL (e.g. /uploads/... or https://...):', '/uploads/');
    if (!src) return;
    const alt = prompt('Enter image alt text (required for accessibility):', 'Institutional photograph') || '';
    const imgTag = `<img src="${src}" alt="${alt}" class="my-4 rounded border border-[#D9DCD2] max-w-full h-auto" />`;
    insertFormatting('', imgTag, '');
  };
  const handleRule = () => insertFormatting('', '<hr class="my-6 border-[#D9DCD2]" />\n', '');

  return (
    <div className="border border-[#D9DCD2] rounded-md overflow-hidden bg-white">
      {/* Editor Header / Toolbar */}
      <div className="bg-[#E9EDE4] border-b border-[#D9DCD2] px-3 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-xs font-semibold text-[#192B2A] mr-2 uppercase tracking-wide">
            {label}
          </span>
          <button
            type="button"
            onClick={handleHeading2}
            title="Heading 2"
            className="px-2 py-1 text-xs font-bold rounded bg-white hover:bg-[#F7F5EF] text-[#285748] border border-[#D9DCD2]"
          >
            H2
          </button>
          <button
            type="button"
            onClick={handleHeading3}
            title="Heading 3"
            className="px-2 py-1 text-xs font-bold rounded bg-white hover:bg-[#F7F5EF] text-[#285748] border border-[#D9DCD2]"
          >
            H3
          </button>
          <button
            type="button"
            onClick={handleParagraph}
            title="Paragraph"
            className="px-2 py-1 text-xs font-medium rounded bg-white hover:bg-[#F7F5EF] text-[#192B2A] border border-[#D9DCD2]"
          >
            P
          </button>
          <div className="h-4 w-px bg-[#D9DCD2] mx-1" />
          <button
            type="button"
            onClick={handleBold}
            title="Bold"
            className="px-2 py-1 text-xs font-bold rounded bg-white hover:bg-[#F7F5EF] text-[#192B2A] border border-[#D9DCD2]"
          >
            B
          </button>
          <button
            type="button"
            onClick={handleItalic}
            title="Italic"
            className="px-2 py-1 text-xs italic rounded bg-white hover:bg-[#F7F5EF] text-[#192B2A] border border-[#D9DCD2]"
          >
            I
          </button>
          <div className="h-4 w-px bg-[#D9DCD2] mx-1" />
          <button
            type="button"
            onClick={handleBulletList}
            title="Bullet List"
            className="px-2 py-1 text-xs rounded bg-white hover:bg-[#F7F5EF] text-[#192B2A] border border-[#D9DCD2]"
          >
            • List
          </button>
          <button
            type="button"
            onClick={handleNumberedList}
            title="Numbered List"
            className="px-2 py-1 text-xs rounded bg-white hover:bg-[#F7F5EF] text-[#192B2A] border border-[#D9DCD2]"
          >
            1. List
          </button>
          <button
            type="button"
            onClick={handleQuote}
            title="Blockquote"
            className="px-2 py-1 text-xs rounded bg-white hover:bg-[#F7F5EF] text-[#192B2A] border border-[#D9DCD2]"
          >
            “ Quote
          </button>
          <div className="h-4 w-px bg-[#D9DCD2] mx-1" />
          <button
            type="button"
            onClick={handleLink}
            title="Insert Link"
            className="px-2 py-1 text-xs font-medium rounded bg-white hover:bg-[#F7F5EF] text-[#285748] border border-[#D9DCD2]"
          >
            🔗 Link
          </button>
          <button
            type="button"
            onClick={handleImage}
            title="Insert Image with Alt Text"
            className="px-2 py-1 text-xs font-medium rounded bg-white hover:bg-[#F7F5EF] text-[#285748] border border-[#D9DCD2]"
          >
            🖼️ Image
          </button>
          <button
            type="button"
            onClick={handleRule}
            title="Horizontal Divider"
            className="px-2 py-1 text-xs rounded bg-white hover:bg-[#F7F5EF] text-[#192B2A] border border-[#D9DCD2]"
          >
            — Divider
          </button>
        </div>

        {/* Edit / Preview Tabs */}
        <div className="flex items-center gap-1 bg-[#D9DCD2] p-0.5 rounded text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              activeTab === 'edit'
                ? 'bg-white text-[#285748] shadow-sm font-semibold'
                : 'text-[#192B2A] hover:text-[#285748]'
            }`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              activeTab === 'preview'
                ? 'bg-white text-[#285748] shadow-sm font-semibold'
                : 'text-[#192B2A] hover:text-[#285748]'
            }`}
          >
            Live Preview
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {activeTab === 'edit' ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full p-4 font-mono text-sm text-[#192B2A] focus:outline-none focus:ring-1 focus:ring-[#285748] resize-y"
        />
      ) : (
        <div className="p-4 min-h-[240px] max-h-[500px] overflow-y-auto bg-[#F7F5EF]">
          {value.trim() ? (
            <div
              className="prose prose-sm max-w-none text-[#192B2A]"
              dangerouslySetInnerHTML={{ __html: value }}
            />
          ) : (
            <p className="text-sm text-gray-400 italic">No content to preview yet.</p>
          )}
        </div>
      )}

      {/* Helper Footer */}
      <div className="bg-[#F7F5EF] border-t border-[#D9DCD2] px-3 py-1.5 flex items-center justify-between text-xs text-gray-500">
        <span>Visual Rich Text formatting ready. Raw HTML not required.</span>
        <span>{value ? `${value.length} characters` : 'Empty'}</span>
      </div>
    </div>
  );
}
