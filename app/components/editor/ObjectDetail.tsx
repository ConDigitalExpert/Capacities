'use client';

import React, { useState, useRef } from 'react';
import { CapacityObject, ObjectType } from '../../lib/types';
import RichEditor from './RichEditor';
import {
  Tag, Link2, Trash2, Star, User, Book, Newspaper, Video,
  Calendar, FileText, Plus, X, ExternalLink,
} from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  obj: CapacityObject;
  allObjects: CapacityObject[];
  onUpdate: (id: string, patch: Partial<CapacityObject>) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  onLink: (fromId: string, toId: string) => void;
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

export default function ObjectDetail({ obj, allObjects, onUpdate, onDelete, onSelect, onLink }: Props) {
  const [tagInput, setTagInput] = useState('');
  const [showLinkPicker, setShowLinkPicker] = useState(false);
  const [linkSearch, setLinkSearch] = useState('');

  const linkedObjects = allObjects.filter((o) => obj.linkedIds.includes(o.id));
  const linkCandidates = allObjects.filter(
    (o) => o.id !== obj.id && !obj.linkedIds.includes(o.id) &&
      (linkSearch.trim() === '' || o.title.toLowerCase().includes(linkSearch.toLowerCase()))
  );

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

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[obj.type]}`}>
            {obj.type}
          </span>
          {obj.date && (
            <span className="text-white/30 text-xs">{format(new Date(obj.date), 'EEEE, MMMM d, yyyy')}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/20 text-xs">
            Updated {format(new Date(obj.updatedAt), 'MMM d, yyyy')}
          </span>
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
      <div className="flex-1 px-8 py-6 space-y-6">
        {/* Title */}
        <div className="flex items-center gap-3">
          <span className="text-3xl">{obj.icon ?? '📝'}</span>
          <input
            type="text"
            value={obj.title}
            onChange={handleTitleChange}
            placeholder="Untitled"
            className="flex-1 bg-transparent text-white text-2xl font-bold outline-none placeholder-white/20"
          />
        </div>

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
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
            placeholder="Add tag…"
            className="bg-transparent text-white/40 text-xs outline-none w-24 placeholder-white/20"
          />
        </div>

        {/* Divider */}
        <div className="border-t border-white/5" />

        {/* Editor */}
        <RichEditor
          content={obj.content}
          onChange={(json) => onUpdate(obj.id, { content: json })}
          placeholder="Start writing…"
        />

        {/* Linked objects */}
        <div className="border-t border-white/5 pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/40 text-xs uppercase tracking-widest flex items-center gap-1.5">
              <Link2 size={12} />
              Linked Objects ({linkedObjects.length})
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

          <div className="grid grid-cols-1 gap-2">
            {linkedObjects.map((linked) => (
              <button
                key={linked.id}
                onClick={() => onSelect(linked.id)}
                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-lg px-3 py-2 text-left transition-colors group"
              >
                <span>{linked.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm font-medium truncate">{linked.title}</p>
                  <p className="text-white/30 text-xs">{linked.type}</p>
                </div>
                <ExternalLink size={12} className="text-white/20 group-hover:text-white/50 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TypeMeta({ obj, onUpdate }: { obj: CapacityObject; onUpdate: (id: string, p: Partial<CapacityObject>) => void }) {
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
        <label className="flex items-center gap-2">
          <Star size={13} />
          <input
            type="number"
            min={1}
            max={5}
            value={obj.rating ?? ''}
            onChange={(e) => onUpdate(obj.id, { rating: Number(e.target.value) })}
            placeholder="Rating"
            className="bg-transparent outline-none text-white/70 placeholder-white/20 w-12"
          />
          <span className="text-xs">/5</span>
        </label>
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

  if (obj.type === 'person') {
    return (
      <div className="flex items-center gap-2 text-sm text-white/50">
        <User size={13} />
        <span className="text-white/30 text-xs">Person profile</span>
      </div>
    );
  }

  return null;
}
