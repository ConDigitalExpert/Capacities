'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import { useEffect } from 'react';
import { Bold, Italic, Strikethrough, Code, Highlighter, List, ListOrdered, CheckSquare, Quote } from 'lucide-react';

interface Props {
  content: string;
  onChange: (json: string) => void;
  placeholder?: string;
}

export default function RichEditor({ content, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight,
      Typography,
      Placeholder.configure({
        placeholder: placeholder ?? 'Start writing…',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: (() => {
      try { return JSON.parse(content); } catch { return content; }
    })(),
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()));
    },
    editorProps: {
      attributes: {
        class: 'prose-editor outline-none min-h-[200px] focus:outline-none',
      },
    },
    immediatelyRender: false,
  });

  // Sync content when object changes
  useEffect(() => {
    if (!editor) return;
    try {
      const parsed = JSON.parse(content);
      if (JSON.stringify(parsed) !== JSON.stringify(editor.getJSON())) {
        editor.commands.setContent(parsed);
      }
    } catch { /* noop */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  if (!editor) return null;

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center flex-wrap gap-0.5 bg-white/5 border border-white/10 rounded-lg p-1">
        <ToolbarBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold"><Bold size={13} /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic"><Italic size={13} /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough"><Strikethrough size={13} /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} title="Code"><Code size={13} /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()} title="Highlight"><Highlighter size={13} /></ToolbarBtn>
        <div className="w-px h-4 bg-white/20 mx-1" />
        <ToolbarBtn active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">H1</ToolbarBtn>
        <ToolbarBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">H2</ToolbarBtn>
        <ToolbarBtn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">H3</ToolbarBtn>
        <div className="w-px h-4 bg-white/20 mx-1" />
        <ToolbarBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list"><List size={13} /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered list"><ListOrdered size={13} /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()} title="Task list"><CheckSquare size={13} /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Quote"><Quote size={13} /></ToolbarBtn>
      </div>
      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarBtn({ children, active, onClick, title }: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
        active ? 'bg-violet-600 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  );
}
