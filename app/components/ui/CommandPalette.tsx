'use client';

import { useEffect, useState, useRef } from 'react';
import { CapacityObject, ObjectType } from '../../lib/types';
import { Search, Calendar, FileText, User, Book, Newspaper, Video, Tag } from 'lucide-react';

const TYPES: { type: ObjectType; label: string; icon: React.ReactNode; shortcut: string }[] = [
  { type: 'note', label: 'New Note', icon: <FileText size={15} />, shortcut: 'N' },
  { type: 'daily', label: 'New Daily Note', icon: <Calendar size={15} />, shortcut: 'D' },
  { type: 'person', label: 'New Person', icon: <User size={15} />, shortcut: 'P' },
  { type: 'book', label: 'New Book', icon: <Book size={15} />, shortcut: 'B' },
  { type: 'article', label: 'New Article', icon: <Newspaper size={15} />, shortcut: 'A' },
  { type: 'media', label: 'New Media', icon: <Video size={15} />, shortcut: 'M' },
];

interface Props {
  onClose: () => void;
  onCreate: (type: ObjectType) => void;
  objects: CapacityObject[];
  onSelect: (id: string) => void;
}

export default function CommandPalette({ onClose, onCreate, objects, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const filteredObjects = query
    ? objects.filter((o) => o.title.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : [];

  const allItems: { label: string; icon: React.ReactNode; action: () => void }[] = [
    ...(filteredObjects.length
      ? filteredObjects.map((o) => ({
          label: o.title,
          icon: <span>{o.icon}</span>,
          action: () => { onSelect(o.id); onClose(); },
        }))
      : TYPES.map((t) => ({
          label: t.label,
          icon: t.icon,
          action: () => { onCreate(t.type); onClose(); },
        }))
    ),
  ];

  useEffect(() => { setHighlighted(0); }, [query]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, allItems.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)); }
    if (e.key === 'Enter') { e.preventDefault(); allItems[highlighted]?.action(); }
    if (e.key === 'Escape') onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[20vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Search size={16} className="text-white/40" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search or create…"
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/30"
          />
          <kbd className="text-white/20 text-xs border border-white/10 rounded px-1.5 py-0.5">ESC</kbd>
        </div>
        <div className="py-1 max-h-72 overflow-y-auto">
          {!query && (
            <p className="text-white/20 text-xs px-4 py-2 uppercase tracking-widest">Create new…</p>
          )}
          {allItems.map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              onMouseEnter={() => setHighlighted(i)}
              className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left transition-colors ${
                i === highlighted ? 'bg-violet-600/30 text-white' : 'text-white/60 hover:bg-white/5'
              }`}
            >
              <span className="text-white/50">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
