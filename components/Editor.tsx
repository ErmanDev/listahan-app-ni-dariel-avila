'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { useState, useEffect } from 'react';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  onExpandChange?: (isExpanded: boolean) => void;
}

const Editor = ({ content, onChange, onExpandChange }: EditorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    onExpandChange?.(isExpanded);
  }, [isExpanded, onExpandChange]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Placeholder.configure({
        placeholder: 'Type here...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[200px]',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`relative transition-all duration-300 ease-in-out ${
      isExpanded ? 'fixed inset-0 z-50 bg-zinc-900' : 'relative'
    }`}>
      {/* Toolbar */}
      <div className={`flex flex-wrap items-center gap-1 md:gap-2 mb-4 p-2 bg-zinc-800 rounded-lg sticky top-0 z-10 ${
        isExpanded ? 'px-8 py-4' : ''
      }`}>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 md:p-2 rounded hover:bg-zinc-700 transition-colors ${
            editor.isActive('bold') ? 'bg-zinc-700' : 'bg-zinc-800'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M8 11h4.5a2.5 2.5 0 1 0 0-5H8v5Zm10 4.5a4.5 4.5 0 0 1-4.5 4.5H6V4h6.5a4.5 4.5 0 0 1 3.256 7.606A4.498 4.498 0 0 1 18 15.5ZM8 13v5h5.5a2.5 2.5 0 1 0 0-5H8Z"/>
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 md:p-2 rounded hover:bg-zinc-700 transition-colors ${
            editor.isActive('italic') ? 'bg-zinc-700' : 'bg-zinc-800'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M15 20H7v-2h2.927l2.116-12H9V4h8v2h-2.927l-2.116 12H15v2Z"/>
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 md:p-2 rounded hover:bg-zinc-700 transition-colors ${
            editor.isActive('underline') ? 'bg-zinc-700' : 'bg-zinc-800'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M8 3v9a4 4 0 1 0 8 0V3h2v9a6 6 0 1 1-12 0V3h2ZM4 20h16v2H4v-2Z"/>
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 md:p-2 rounded hover:bg-zinc-700 transition-colors ${
            editor.isActive('heading', { level: 1 }) ? 'bg-zinc-700' : 'bg-zinc-800'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M13 20h-2v-7H4v7H2V4h2v7h7V4h2v16Zm8-12v12h-2v-9.796l-2 .536V8.67L19.5 8H21Z"/>
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 md:p-2 rounded hover:bg-zinc-700 transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-zinc-700' : 'bg-zinc-800'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M4 4v7h7V4h2v16h-2v-7H4v7H2V4h2Zm14.5 4c2.074 0 3.49 1.326 3.5 3.5 0 1.654-.706 2.374-2.081 3.17l-.193.107L17.1 16H22v2h-7v-1.75l4.222-2.775c.839-.555 1.278-.944 1.278-1.975 0-1.084-.874-1.75-2-1.75-.84 0-1.653.654-1.94 1.75h-2.127C14.686 9.172 16.26 8 18.5 8Z"/>
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 md:p-2 rounded hover:bg-zinc-700 transition-colors ${
            editor.isActive('bulletList') ? 'bg-zinc-700' : 'bg-zinc-800'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M8 4h13v2H8V4ZM4.5 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm0 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm0 6.9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3ZM8 11h13v2H8v-2Zm0 7h13v2H8v-2Z"/>
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 md:p-2 rounded hover:bg-zinc-700 transition-colors ${
            editor.isActive('orderedList') ? 'bg-zinc-700' : 'bg-zinc-800'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M8 4h13v2H8V4ZM5 3v3h1v1H3V6h1V4H3V3h2Zm-2 7h3.25v1.5H5v1h1.5v1.5H3v-1h2v-1H3V10Zm2 7v3H3v-1h1v-1H3v-1h2Zm3-2h13v2H8v-2Zm0-7h13v2H8v-2Z"/>
          </svg>
        </button>
        <div className="flex-1"></div>
        <button
          onClick={toggleExpanded}
          className="p-1.5 md:p-2 rounded hover:bg-zinc-700 transition-colors"
          title={isExpanded ? "Exit Full Screen" : "Full Screen"}
        >
          {isExpanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M18 7h4v2h-6V3h2v4ZM8 9H2V7h4V3h2v6Zm10 8v4h-2v-6h6v2h-4ZM8 15v6H6v-4H2v-2h6Z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M16 3h6v6h-2V5h-4V3ZM2 3h6v2H4v4H2V3Zm18 16v-4h2v6h-6v-2h4ZM4 19h4v2H2v-6h2v4Z"/>
            </svg>
          )}
        </button>
      </div>

      {/* Editor Content */}
      <div className={`relative ${
        isExpanded 
          ? 'px-4 md:px-8 py-4 h-[calc(100vh-80px)] overflow-y-auto'
          : 'min-h-[300px] max-h-[500px] overflow-y-auto'
      }`}>
        <EditorContent editor={editor} className="prose-p:my-3 [&_.is-editor-empty]:before:text-zinc-500 [&_.is-editor-empty]:before:content-[attr(data-placeholder)] [&_.is-editor-empty]:before:float-left [&_.is-editor-empty]:before:pointer-events-none pl-8 md:pl-0" />
      </div>
    </div>
  );
};

export default Editor;
