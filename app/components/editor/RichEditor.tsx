'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { Node, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Bold, Italic, Strikethrough, Code, Highlighter,
  List, ListOrdered, CheckSquare, Quote, Table as TableIcon,
} from 'lucide-react';
import { CapacityObject } from '../../lib/types';

const lowlight = createLowlight(common);

// ── Wikilink inline node ──────────────────────────────────────────────────────
const WikilinkNode = Node.create({
  name: 'wikilink',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      id: { default: null },
      label: { default: '' },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-wikilink]' }];
  },

  renderHTML({ node }) {
    return [
      'span',
      mergeAttributes({ 'data-wikilink': node.attrs.id, class: 'wikilink-chip' }),
      `[[${node.attrs.label}]]`,
    ];
  },
});

// ─────────────────────────────────────────────────────────────────────────────

interface SuggestionState {
  query: string;
  startPos: number;
  coords: { left: number; bottom: number };
}

interface Props {
  content: string;
  onChange: (json: string) => void;
  placeholder?: string;
  allObjects?: CapacityObject[];
}

export default function RichEditor({ content, onChange, placeholder, allObjects = [] }: Props) {
  const [suggestion, setSuggestion] = useState<SuggestionState | null>(null);
  const [suggestionIdx, setSuggestionIdx] = useState(0);

  // Refs so keyboard handler always has fresh data
  const suggestionRef = useRef<SuggestionState | null>(null);
  const suggestionIdxRef = useRef(0);
  const allObjectsRef = useRef(allObjects);
  const editorRef = useRef<ReturnType<typeof useEditor>>(null);

  useEffect(() => { allObjectsRef.current = allObjects; }, [allObjects]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight,
      Typography,
      WikilinkNode,
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({ lowlight }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Start writing… type [[ to link objects',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: (() => {
      try { return JSON.parse(content); } catch { return content; }
    })(),
    onUpdate: ({ editor: e }) => {
      const { from } = e.state.selection;
      const textBefore = e.state.doc.textBetween(Math.max(0, from - 200), from, '\n');
      const match = textBefore.match(/\[\[([^\]]*)$/);

      if (match) {
        const coords = e.view.coordsAtPos(from);
        const state: SuggestionState = {
          query: match[1],
          startPos: from - match[0].length,
          coords: { left: coords.left, bottom: coords.bottom },
        };
        setSuggestion(state);
        suggestionRef.current = state;
        setSuggestionIdx(0);
        suggestionIdxRef.current = 0;
      } else {
        setSuggestion(null);
        suggestionRef.current = null;
      }

      onChange(JSON.stringify(e.getJSON()));
    },
    editorProps: {
      attributes: {
        class: 'prose-editor outline-none min-h-[200px] focus:outline-none',
      },
    },
    immediatelyRender: false,
  });

  // Keep editor ref fresh
  useEffect(() => { (editorRef as React.MutableRefObject<typeof editor>).current = editor; }, [editor]);

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

  const insertWikilink = useCallback((obj: CapacityObject) => {
    const e = editorRef.current;
    const s = suggestionRef.current;
    if (!e || !s) return;
    const endPos = e.state.selection.from;
    e.chain()
      .focus()
      .deleteRange({ from: s.startPos, to: endPos })
      .insertContentAt(s.startPos, { type: 'wikilink', attrs: { id: obj.id, label: obj.title } })
      .run();
    setSuggestion(null);
    suggestionRef.current = null;
  }, []);

  // Keep insertWikilink accessible in keyboard handler via ref
  const insertWikilinkRef = useRef(insertWikilink);
  useEffect(() => { insertWikilinkRef.current = insertWikilink; }, [insertWikilink]);

  // Global keyboard handler for suggestion navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!suggestionRef.current) return;
      const filtered = allObjectsRef.current
        .filter((o) => o.title.toLowerCase().includes(suggestionRef.current!.query.toLowerCase()))
        .slice(0, 8);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = Math.min(suggestionIdxRef.current + 1, filtered.length - 1);
        suggestionIdxRef.current = next;
        setSuggestionIdx(next);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = Math.max(suggestionIdxRef.current - 1, 0);
        suggestionIdxRef.current = prev;
        setSuggestionIdx(prev);
      } else if (e.key === 'Enter' && filtered.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        insertWikilinkRef.current(filtered[suggestionIdxRef.current]);
      } else if (e.key === 'Escape') {
        setSuggestion(null);
        suggestionRef.current = null;
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, []);

  if (!editor) return null;

  const filteredSuggestions = suggestion
    ? allObjects.filter((o) => o.title.toLowerCase().includes(suggestion.query.toLowerCase())).slice(0, 8)
    : [];

  return (
    <div className="space-y-2 relative">
      {/* Toolbar */}
      <div className="flex items-center flex-wrap gap-0.5 bg-white/5 border border-white/10 rounded-lg p-1">
        <ToolbarBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold"><Bold size={13} /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic"><Italic size={13} /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough"><Strikethrough size={13} /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} title="Inline code"><Code size={13} /></ToolbarBtn>
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
        <ToolbarBtn active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code block"><span className="font-mono text-xs">{'{}'}</span></ToolbarBtn>
        <div className="w-px h-4 bg-white/20 mx-1" />
        <ToolbarBtn
          active={editor.isActive('table')}
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          title="Insert table"
        >
          <TableIcon size={13} />
        </ToolbarBtn>
        {editor.isActive('table') && (
          <>
            <ToolbarBtn active={false} onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add column">+col</ToolbarBtn>
            <ToolbarBtn active={false} onClick={() => editor.chain().focus().addRowAfter().run()} title="Add row">+row</ToolbarBtn>
            <ToolbarBtn active={false} onClick={() => editor.chain().focus().deleteTable().run()} title="Delete table">✕tbl</ToolbarBtn>
          </>
        )}
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Wikilink suggestion dropdown */}
      {suggestion && filteredSuggestions.length > 0 && (
        <div
          style={{
            position: 'fixed',
            left: Math.min(suggestion.coords.left, window.innerWidth - 260),
            top: suggestion.coords.bottom + 6,
            zIndex: 1000,
          }}
          className="bg-[#1a1a2e] border border-white/20 rounded-lg shadow-2xl overflow-hidden w-64"
        >
          <p className="text-white/30 text-xs px-3 py-1.5 border-b border-white/10 uppercase tracking-widest flex items-center gap-1.5">
            <span>🔗</span> Link to object
          </p>
          {filteredSuggestions.map((obj, i) => (
            <button
              key={obj.id}
              onMouseDown={(e) => { e.preventDefault(); insertWikilink(obj); }}
              className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors ${
                i === suggestionIdx ? 'bg-violet-600/30 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="shrink-0">{obj.icon ?? '📝'}</span>
              <span className="truncate">{obj.title}</span>
              <span className="ml-auto text-white/30 text-xs shrink-0">{obj.type}</span>
            </button>
          ))}
          {filteredSuggestions.length === 0 && suggestion.query && (
            <p className="text-white/30 text-xs px-3 py-3">No matching objects</p>
          )}
          <p className="text-white/20 text-xs px-3 py-1.5 border-t border-white/10">
            ↑↓ navigate · Enter select · Esc cancel
          </p>
        </div>
      )}
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
