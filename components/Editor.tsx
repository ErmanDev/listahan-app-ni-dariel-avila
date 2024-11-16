'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { CircleLoader } from 'react-spinners';
import 'react-quill/dist/quill.snow.css';

// Custom styles for Quill editor
const customEditorStyles = `
.ql-snow .ql-picker-options .ql-picker-item:hover {
  color: #ffd700 !important;
}

.ql-snow .ql-picker.ql-expanded .ql-picker-options .ql-picker-item:hover {
  color: #ffd700 !important;
}

.ql-snow .ql-picker-options .ql-picker-item:hover,
.ql-snow .ql-picker.ql-expanded .ql-picker-label:hover,
.ql-snow .ql-picker.ql-expanded .ql-picker-options .ql-picker-item:hover {
  color: #ffd700 !important;
}

.ql-snow .ql-picker-label:hover::before {
  color: #ffd700 !important;
}

/* Mobile-specific styles */
@media (max-width: 768px) {
  .ql-editor .ql-checkbox {
    min-height: 24px;
    min-width: 24px;
    margin: 4px;
    cursor: pointer;
  }
  
  .ql-editor li[data-list="checked"],
  .ql-editor li[data-list="unchecked"] {
    pointer-events: auto !important;
  }
  
  .ql-editor li[data-list="checked"]::before,
  .ql-editor li[data-list="unchecked"]::before {
    min-width: 24px;
    min-height: 24px;
    margin: 4px;
  }
}
`;

// Dynamic import of ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full min-h-screen bg-zinc-900 flex items-center justify-center">
      <CircleLoader color="#C2FFC7" size={50} />
    </div>
  )
});

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
    [{ background: [] }],
    [{ align: [] }],
    ['clean']
  ],
  clipboard: {
    matchVisual: false
  },
  keyboard: {
    bindings: {
      'list autofill': {
        prefix: /^\s*\[\s?\]\s*$/,
        handler() {
          // Prevent default behavior
          return true;
        }
      }
    }
  }
};

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'align',
  'checked',
  'background'
];

export default function Editor({
  content,
  onChange,
  placeholder = 'Start writing...',
  className = ''
}: EditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Add touch event handling for checkboxes
    const handleCheckboxClick = (event: Event) => {
      const target = event.target as HTMLElement;
      const listItem = target.closest('li[data-list]');
      
      if (listItem) {
        const currentState = listItem.getAttribute('data-list');
        const newState = currentState === 'checked' ? 'unchecked' : 'checked';
        listItem.setAttribute('data-list', newState);
        
        // Trigger change event to save the state
        const changeEvent = new Event('change', { bubbles: true });
        listItem.dispatchEvent(changeEvent);
      }
    };

    const editor = document.querySelector('.ql-editor');
    if (editor) {
      editor.addEventListener('touchend', handleCheckboxClick);
      editor.addEventListener('click', handleCheckboxClick);
    }

    return () => {
      if (editor) {
        editor.removeEventListener('touchend', handleCheckboxClick);
        editor.removeEventListener('click', handleCheckboxClick);
      }
    };
  }, []);

  if (!mounted) {
    return <div className="h-full w-full bg-zinc-900 animate-pulse" />;
  }

  return (
    <div className={`bg-zinc-900 rounded-lg ${className}`}>
      <ReactQuill
        theme="snow"
        value={content}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        preserveWhitespace={true}
        className="prose prose-invert max-w-none h-full"
      />
      <style jsx global>{`
        ${customEditorStyles}
        .ql-container {
          font-family: inherit;
          font-size: inherit;
          border: none !important;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          background-color: rgb(24 24 27) !important;
        }
        .ql-toolbar {
          border: none !important;
          border-bottom: 1px solid rgb(63 63 70) !important;
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          background-color: rgb(24 24 27);
        }
        .ql-toolbar button {
          color: rgb(161 161 170) !important;
        }
        .ql-toolbar button:hover {
          color: white !important;
        }
        .ql-toolbar .ql-active {
          color: white !important;
        }
        .ql-toolbar .ql-stroke {
          stroke: rgb(161 161 170) !important;
        }
        .ql-toolbar .ql-stroke:hover {
          stroke: white !important;
        }
        .ql-toolbar .ql-active .ql-stroke {
          stroke: white !important;
        }
        .ql-toolbar .ql-fill {
          fill: rgb(161 161 170) !important;
        }
        .ql-toolbar .ql-fill:hover {
          fill: white !important;
        }
        .ql-toolbar .ql-active .ql-fill {
          fill: white !important;
        }
        .ql-editor {
          color: rgb(212 212 216) !important;
          background-color: rgb(24 24 27) !important;
        }
        .ql-editor.ql-blank::before {
          color: rgb(161 161 170) !important;
          font-style: normal !important;
        }
        .ql-snow.ql-toolbar button:hover,
        .ql-snow .ql-toolbar button:hover,
        .ql-snow.ql-toolbar button:focus,
        .ql-snow .ql-toolbar button:focus,
        .ql-snow.ql-toolbar button.ql-active,
        .ql-snow .ql-toolbar button.ql-active,
        .ql-snow.ql-toolbar .ql-picker-label:hover,
        .ql-snow .ql-toolbar .ql-picker-label:hover,
        .ql-snow.ql-toolbar .ql-picker-label.ql-active,
        .ql-snow .ql-toolbar .ql-picker-label.ql-active,
        .ql-snow.ql-toolbar .ql-picker-item:hover,
        .ql-snow .ql-toolbar .ql-picker-item:hover,
        .ql-snow.ql-toolbar .ql-picker-item.ql-selected,
        .ql-snow .ql-toolbar .ql-picker-item.ql-selected {
          color: white !important;
        }
      `}</style>
    </div>
  );
}
