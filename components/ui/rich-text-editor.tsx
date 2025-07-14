"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, 
  Italic, 
  List,
  ListOrdered,
  Type,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

interface TipTapEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

export function TipTapEditor({ 
  content = '', 
  onChange, 
  placeholder = 'Start writing your content...', 
  className = '',
  editable = true 
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    immediatelyRender: false, // Add this to fix SSR hydration issues
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html); // Return HTML so it can be rendered properly
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="min-h-[200px] border border-gray-300 rounded-lg p-4 bg-gray-50 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        .ProseMirror {
          outline: none !important;
          line-height: 1.6 !important;
        }

        .ProseMirror p {
          margin: 0.5em 0 !important;
        }

        .ProseMirror h1 {
          font-size: 1.5em !important;
          font-weight: 600 !important;
          margin: 1em 0 0.5em 0 !important;
        }

        .ProseMirror h2 {
          font-size: 1.25em !important;
          font-weight: 600 !important;
          margin: 1em 0 0.5em 0 !important;
        }

        .ProseMirror h3 {
          font-size: 1.125em !important;
          font-weight: 600 !important;
          margin: 1em 0 0.5em 0 !important;
        }

        .ProseMirror ul {
          list-style-type: disc !important;
          padding-left: 1.5em !important;
          margin: 0.5em 0 !important;
        }

        .ProseMirror ol {
          list-style-type: decimal !important;
          padding-left: 1.5em !important;
          margin: 0.5em 0 !important;
        }

        .ProseMirror li {
          margin: 0.25em 0 !important;
        }

        .ProseMirror strong {
          font-weight: 600 !important;
        }

        .ProseMirror em {
          font-style: italic !important;
        }

        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
      `}</style>
      <div className={`border border-gray-300 rounded-lg overflow-hidden bg-white ${className}`}>
        {/* Toolbar */}
        <div className="border-b border-gray-200 bg-gray-50 p-3">
          <div className="flex flex-wrap items-center gap-1">
            {/* Text Formatting */}
            <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`h-8 w-8 p-0 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
                disabled={!editor.can().chain().focus().toggleBold().run()}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`h-8 w-8 p-0 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
              >
                <Italic className="h-4 w-4" />
              </Button>
            </div>

            {/* Headings */}
            <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={`h-8 w-8 p-0 ${editor.isActive('paragraph') ? 'bg-gray-200' : ''}`}
              >
                <Type className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`h-8 w-8 p-0 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
              >
                <Heading1 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`h-8 w-8 p-0 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
              >
                <Heading2 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`h-8 w-8 p-0 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
              >
                <Heading3 className="h-4 w-4" />
              </Button>
            </div>

            {/* Lists */}
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`h-8 w-8 p-0 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`h-8 w-8 p-0 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Editor Content */}
        <div className="p-4 min-h-[200px] focus-within:outline-none">
          <EditorContent 
            editor={editor}
            className="outline-none"
          />
        </div>
      </div>
    </>
  );
}