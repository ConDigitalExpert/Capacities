'use client';

import React, { useState, useEffect } from 'react';
import { CapacityObject, ObjectType } from '../../lib/types';
import { templatesByType } from '../../lib/templates';
import { exportMarkdown } from '../../lib/export';
import RichEditor from './RichEditor';
import {
  Tag, Link2, Trash2, User, Newspaper,
  Plus, X, ExternalLink, ArrowLeft, Download,
  LayoutTemplate, ChevronDown, Circle, Clock, CheckCircle2,
} from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  obj: CapacityObject;
  allObjects: CapacityObject[];
  onUpdate: (id: string, patch: Partial<CapacityObject>) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  onLink: (fromId: string, toId: string) => void;
  onRemoveLink: (fromId: string, toId: string) => void;
  onBack?: () => void;
}

const TYPE_COLORS: Record<ObjectType, string> = {
  note: 'bg-blue-500/20 text-blue-300',
  daily: 'bg-amber-500/20 text-amber-300',
  person: 'bg-green-500/20 text-green-300',
  book: 'bg-purple-500/20 text-purple-300',
  article: 'bg-cyan-500/20 text-cyan-300',
  media: 'bg-pink-500/20 text-pink-300',
  tag: 'bg-gray-500/20 text-gray-300',
};

const STATUS_OPTIONS: { value: CapacityObject['status']; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'todo', label: 'To Do', icon: <Circle size={13} />, color: 'text-white/40 hover:text-white/70' },
  { value: 'in-progress', label: 'In Progress', icon: <Clock size={13} />, color: 'text-amber-400' },
  { value: 'done', label: 'Done', icon: <CheckCircle2 size={13} />, color: 'text-green-400' },
];

export default function ObjectDetail({ obj, allObjects, onUpdate, onDelete, onSelect, onLink, onRemoveLink, onBack }: Props) {
  const [tagInput, setTagInput] = useState('');
  const [showLinkPicker, setShowLinkPicker] = useState(false);
  const [linkSearch, setLinkSearch] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  // Listen for wikilink clicks inside the editor
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest('[data-wikilink]');
      if (el) {
        const id = el.getAttribute('data-wikilink');
        if (id) onSelect(id);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [onSelect]);

  // Backlinks: objects that link TO this one
  const backlinks = allObjects.filter(
    (o) => o.id !== obj.id && o.linkedIds.includes(obj.id),
  );
  // Forward links
  const linkedObjects = allObjects.filter((o) => obj.linkedIds.includes(o.id));

  const linkCandidates = allObjects.filter(
    (o) =>
      o.id !== obj.id &&
      !obj.linkedIds.includes(o.id) &&
      (linkSearch.trim() === '' || o.title.toLowerCase().includes(linkSearch.toLowerCase())),
  );

  const templates = templatesByType(obj.type);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(obj.id, { title: e.target.value });
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !obj.tags.includes(tag)) {
      onUpdate(obj.id, { tags: [...obj.tags, tag] });
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    onUpdate(obj.id, { tags: obj.tags.filter((t) => t !== tag) });
  };

  const handleLink = (toId: string) => {
    onLink(obj.id, toId);
    setShowLinkPicker(false);
    setLinkSearch('');
  };

  const applyTemplate = (content: object) => {
    onUpdate(obj.id, { content: JSON.stringify(content) });
    setShowTemplates(false);
  };

  // Objects that have this tag (for tag-type objects)
  const taggedObjects = obj.type === 'tag'
    ? allObjects.filter((o) => o.id !== obj.id && o.tags.includes(obj.title.toLowerCase()))
    : [];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-3 border-b border-white/10 gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {onBack && (
            <button onClick={onBack} className="text-white/40 hover:text-white transition-colors mr-1">
              <ArrowLeft size={16} />
            </button>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[obj.type]}`}>
            {obj.type}
          </span>
          {obj.date && (
            <span className="text-white/30 text-xs hidden sm:inline">
              {format(new Date(obj.date + 'T12:00:00'), 'EEEE, MMMM d, yyyy')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/20 text-xs hidden sm:inline">
            {format(new Date(obj.updatedAt), 'MMM d')}
          </span>
          {/* Templates */}
          {templates.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center gap-1 text-white/40 hover:text-white transition-colors text-xs border border-white/10 rounded px-2 py-1"
                title="Apply template"
              >
                <LayoutTemplate size={12} />
                <ChevronDown size={10} />
              </button>
              {showTemplates && (
                <div className="absolute right-0 top-full mt-1 z-20 bg-[#1a1a2e] border border-white/10 rounded-lg shadow-xl overflow-hidden w-48">
                  <p className="text-white/30 text-xs px-3 py-1.5 border-b border-white/10 uppercase tracking-widest">
                    Templates
                  </p>
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => applyTemplate(t.content)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white text-left"
                    >
                      <span>{t.icon}</span>
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* Export */}
          <button
            onClick={() => exportMarkdown(obj)}
            className="text-white/30 hover:text-white transition-colors"
            title="Export as Markdown"
          >
            <Download size={15} />
          </button>
          <button
            onClick={() => onDelete(obj.id)}
            className="text-white/30 hover:text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-4 sm:px-8 py-6 space-y-5">
        {/* Title */}
        <div className="flex items-center gap-3">
          <span className="text-3xl">{obj.icon ?? '📝'}</span>
          <input
            type="text"
            value={obj.title}
            onChange={handleTitleChange}
            placeholder="Untitled"
            className="flex-1 bg-transparent text-white text-xl sm:text-2xl font-bold outline-none placeholder-white/20"
          />
        </div>

        {/* Status bar */}
        <StatusBar obj={obj} onUpdate={onUpdate} />

        {/* Type-specific metadata */}
        <TypeMeta obj={obj} onUpdate={onUpdate} />

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2">
          <Tag size={14} className="text-white/30" />
          {obj.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full"
            >
              {tag}
              <button onClick={() => removeTag(tag)} className="hover:text-red-400">
                <X size={10} />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
            }}
            placeholder="Add tag…"
            className="bg-transparent text-white/40 text-xs outline-none w-24 placeholder-white/20"
          />
        </div>

        {/* Tag page: show all objects with this tag */}
        {obj.type === 'tag' && (
          <div className="border border-white/10 rounded-xl p-4 space-y-2 bg-white/3">
            <p className="text-white/40 text-xs uppercase tracking-widest flex items-center gap-1.5">
              <Tag size={12} /> Objects tagged &ldquo;{obj.title.toLowerCase()}&rdquo; ({taggedObjects.length})
            </p>
            {taggedObjects.length === 0 ? (
              <p className="text-white/20 text-xs">No objects have this tag yet. Add &ldquo;{obj.title.toLowerCase()}&rdquo; as a tag on any object.</p>
            ) : (
              <div className="grid grid-cols-1 gap-1.5">
                {taggedObjects.map((tagged) => (
                  <LinkedCard key={tagged.id} obj={tagged} onSelect={onSelect} typeColors={TYPE_COLORS} />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="border-t border-white/5" />

        {/* Editor */}
        <RichEditor
          content={obj.content}
          onChange={(json) => onUpdate(obj.id, { content: json })}
          placeholder={obj.type === 'tag' ? 'Notes about this tag…' : 'Start writing… type [[ to link objects'}
          allObjects={allObjects}
        />

        {/* ── Links section ───────────────────────────────────────────────────── */}
        <div className="border-t border-white/5 pt-4 space-y-5">

          {/* Forward links */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/40 text-xs uppercase tracking-widest flex items-center gap-1.5">
                <Link2 size={12} />
                Links ({linkedObjects.length})
              </span>
              <button
                onClick={() => setShowLinkPicker(!showLinkPicker)}
                className="text-white/30 hover:text-white transition-colors flex items-center gap-1 text-xs"
              >
                <Plus size={12} /> Link
              </button>
            </div>

            {showLinkPicker && (
              <div className="mb-3 bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                <input
                  type="text"
                  autoFocus
                  value={linkSearch}
                  onChange={(e) => setLinkSearch(e.target.value)}
                  placeholder="Search to link…"
                  className="w-full bg-transparent px-3 py-2 text-sm text-white/80 outline-none border-b border-white/10 placeholder-white/30"
                />
                <div className="max-h-48 overflow-y-auto">
                  {linkCandidates.slice(0, 20).map((candidate) => (
                    <button
                      key={candidate.id}
                      onClick={() => handleLink(candidate.id)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white text-left"
                    >
                      <span>{candidate.icon}</span>
                      <span className="truncate">{candidate.title}</span>
                      <span className={`ml-auto text-xs px-1.5 py-0.5 rounded ${TYPE_COLORS[candidate.type]}`}>
                        {candidate.type}
                      </span>
                    </button>
                  ))}
                  {linkCandidates.length === 0 && (
                    <p className="text-white/30 text-xs px-3 py-3">No objects found.</p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-1.5">
              {linkedObjects.map((linked) => (
                <LinkedCard
                  key={linked.id}
                  obj={linked}
                  onSelect={onSelect}
                  typeColors={TYPE_COLORS}
                  onRemove={() => onRemoveLink(obj.id, linked.id)}
                />
              ))}
              {linkedObjects.length === 0 && (
                <p className="text-white/20 text-xs">No links yet. Add one above or type [[ in the editor.</p>
              )}
            </div>
          </div>

          {/* Backlinks */}
          {backlinks.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <ArrowLeft size={12} className="text-white/40" />
                <span className="text-white/40 text-xs uppercase tracking-widest">
                  Backlinks ({backlinks.length})
                </span>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {backlinks.map((linked) => (
                  <LinkedCard key={linked.id} obj={linked} onSelect={onSelect} typeColors={TYPE_COLORS} dim />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBar({
  obj,
  onUpdate,
}: {
  obj: CapacityObject;
  onUpdate: (id: string, p: Partial<CapacityObject>) => void;
}) {
  const current = STATUS_OPTIONS.find((s) => s.value === obj.status);
  return (
    <div className="flex items-center gap-1">
      {STATUS_OPTIONS.map((s) => (
        <button
          key={s.value}
          onClick={() => onUpdate(obj.id, { status: obj.status === s.value ? undefined : s.value })}
          title={s.label}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors ${
            obj.status === s.value
              ? 'border-white/20 bg-white/10 ' + s.color
              : 'border-transparent text-white/20 hover:text-white/50 hover:border-white/10'
          }`}
        >
          {s.icon}
          {obj.status === s.value && <span>{s.label}</span>}
        </button>
      ))}
      {current && (
        <span className="text-white/20 text-xs ml-1">· click to clear</span>
      )}
    </div>
  );
}

function LinkedCard({
  obj,
  onSelect,
  typeColors,
  dim,
  onRemove,
}: {
  obj: CapacityObject;
  onSelect: (id: string) => void;
  typeColors: Record<ObjectType, string>;
  dim?: boolean;
  onRemove?: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors group ${
        dim ? 'bg-white/3 hover:bg-white/6' : 'bg-white/5 hover:bg-white/10'
      }`}
    >
      <button onClick={() => onSelect(obj.id)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
        <span>{obj.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-white/80 text-sm font-medium truncate">{obj.title}</p>
        </div>
        <span className={`text-xs px-1.5 py-0.5 rounded ${typeColors[obj.type]}`}>{obj.type}</span>
        <ExternalLink size={11} className="text-white/20 group-hover:text-white/50 shrink-0" />
      </button>
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-white/0 group-hover:text-white/30 hover:!text-red-400 transition-colors shrink-0"
          title="Remove link"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}

function TypeMeta({
  obj,
  onUpdate,
}: {
  obj: CapacityObject;
  onUpdate: (id: string, p: Partial<CapacityObject>) => void;
}) {
  if (obj.type === 'book') {
    return (
      <div className="flex flex-wrap items-center gap-4 text-sm text-white/50">
        <label className="flex items-center gap-2">
          <User size={13} />
          <input
            type="text"
            value={obj.author ?? ''}
            onChange={(e) => onUpdate(obj.id, { author: e.target.value })}
            placeholder="Author"
            className="bg-transparent outline-none text-white/70 placeholder-white/20 w-40"
          />
        </label>
        <label className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => onUpdate(obj.id, { rating: n })}
              className={`text-lg transition-colors ${n <= (obj.rating ?? 0) ? 'text-amber-400' : 'text-white/15 hover:text-amber-400/50'}`}
            >
              ★
            </button>
          ))}
        </label>
      </div>
    );
  }

  if (obj.type === 'media') {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onUpdate(obj.id, { rating: n })}
            className={`text-lg transition-colors ${n <= (obj.rating ?? 0) ? 'text-amber-400' : 'text-white/15 hover:text-amber-400/50'}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  }

  if (obj.type === 'article') {
    return (
      <div className="flex items-center gap-2 text-sm text-white/50">
        <Newspaper size={13} />
        <input
          type="url"
          value={obj.url ?? ''}
          onChange={(e) => onUpdate(obj.id, { url: e.target.value })}
          placeholder="Article URL"
          className="bg-transparent outline-none text-white/70 placeholder-white/20 flex-1"
        />
        {obj.url && (
          <a href={obj.url} target="_blank" rel="noopener noreferrer" className="hover:text-white">
            <ExternalLink size={13} />
          </a>
        )}
      </div>
    );
  }

  return null;
}
