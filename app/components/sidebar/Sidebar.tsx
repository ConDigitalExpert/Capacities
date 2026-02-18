'use client';

import React, { useState } from 'react';
import {
  Search, Plus, Calendar, FileText, User, Book, Newspaper,
  Video, Tag, ChevronRight, ChevronDown, X, PanelLeft,
  ArrowDownAZ, Clock, SlidersHorizontal,
} from 'lucide-react';
import { CapacityObject, ObjectType } from '../../lib/types';
import { SearchResult } from '../../lib/search';

interface Props {
  objects: CapacityObject[];
  selectedId: string | null;
  searchQuery: string;
  searchResults: SearchResult[] | null;
  onSelect: (id: string) => void;
  onCreate: (type: ObjectType) => void;
  onSearch: (q: string) => void;
  onClose: () => void;
  onTodayNote: () => void;
}

const TYPE_SECTIONS: { type: ObjectType; label: string; icon: React.ReactNode }[] = [
  { type: 'daily', label: 'Daily Notes', icon: <Calendar size={15} /> },
  { type: 'note', label: 'Notes', icon: <FileText size={15} /> },
  { type: 'person', label: 'People', icon: <User size={15} /> },
  { type: 'book', label: 'Books', icon: <Book size={15} /> },
  { type: 'article', label: 'Articles', icon: <Newspaper size={15} /> },
  { type: 'media', label: 'Media', icon: <Video size={15} /> },
  { type: 'tag', label: 'Tags', icon: <Tag size={15} /> },
];

type SortKey = 'updated' | 'created' | 'name';

function sortItems(items: CapacityObject[], sort: SortKey): CapacityObject[] {
  return [...items].sort((a, b) => {
    if (sort === 'name') return a.title.localeCompare(b.title);
    if (sort === 'created') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export default function Sidebar({
  objects, selectedId, searchQuery, searchResults,
  onSelect, onCreate, onSearch, onClose, onTodayNote,
}: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [activeTypes, setActiveTypes] = useState<Set<ObjectType>>(new Set());
  const [sort, setSort] = useState<SortKey>('updated');
  const [showFilters, setShowFilters] = useState(false);

  const toggle = (type: string) =>
    setCollapsed((c) => ({ ...c, [type]: !c[type] }));

  const toggleTypeFilter = (type: ObjectType) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const clearFilters = () => {
    setActiveTypes(new Set());
    setSort('updated');
  };

  const hasFilters = activeTypes.size > 0 || sort !== 'updated';

  const visibleTypes = activeTypes.size > 0
    ? TYPE_SECTIONS.filter((s) => activeTypes.has(s.type))
    : TYPE_SECTIONS;

  return (
    <aside className="flex flex-col h-full w-64 shrink-0 bg-[#1a1a2e] border-r border-white/10 text-sm select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="font-semibold text-white tracking-wide text-base">⚡ Capacities</span>
        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
          <PanelLeft size={18} />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-white/10">
        <div className="flex items-center gap-2 bg-white/5 rounded-md px-3 py-1.5">
          <Search size={14} className="text-white/40 shrink-0" />
          <input
            type="text"
            placeholder="Search…"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="bg-transparent text-white/80 placeholder-white/30 text-sm outline-none w-full"
          />
          {searchQuery && (
            <button onClick={() => onSearch('')} className="text-white/30 hover:text-white">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Filter + Sort bar */}
      <div className="px-3 py-1.5 border-b border-white/10 flex items-center gap-1.5">
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
            hasFilters ? 'text-violet-400 bg-violet-500/10' : 'text-white/30 hover:text-white/60'
          }`}
          title="Filter & sort"
        >
          <SlidersHorizontal size={11} />
          <span>Filter</span>
          {hasFilters && <span className="text-violet-400">·</span>}
        </button>

        {/* Sort quick toggles */}
        <div className="flex items-center gap-0.5 ml-auto">
          <button
            onClick={() => setSort('updated')}
            title="Sort by last updated"
            className={`p-1 rounded text-xs transition-colors ${sort === 'updated' ? 'text-violet-400' : 'text-white/20 hover:text-white/50'}`}
          >
            <Clock size={11} />
          </button>
          <button
            onClick={() => setSort('name')}
            title="Sort alphabetically"
            className={`p-1 rounded text-xs transition-colors ${sort === 'name' ? 'text-violet-400' : 'text-white/20 hover:text-white/50'}`}
          >
            <ArrowDownAZ size={11} />
          </button>
        </div>

        {hasFilters && (
          <button onClick={clearFilters} className="text-white/20 hover:text-white/50 text-xs ml-0.5" title="Clear filters">
            <X size={11} />
          </button>
        )}
      </div>

      {/* Type filter chips */}
      {showFilters && (
        <div className="px-3 py-2 border-b border-white/10 flex flex-wrap gap-1">
          {TYPE_SECTIONS.map(({ type, label, icon }) => (
            <button
              key={type}
              onClick={() => toggleTypeFilter(type)}
              className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-colors ${
                activeTypes.has(type)
                  ? 'border-violet-500/50 bg-violet-500/20 text-violet-300'
                  : 'border-white/10 text-white/30 hover:text-white/60 hover:border-white/20'
              }`}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-2 space-y-1">
        {searchResults ? (
          // Search results
          <div className="px-2">
            <p className="text-white/30 text-xs uppercase tracking-widest px-2 mb-1">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </p>
            {searchResults.length === 0 && (
              <p className="text-white/30 px-2 py-4 text-center text-xs">Nothing found.</p>
            )}
            {searchResults.map(({ obj, matchedIn }) => (
              <button
                key={obj.id}
                onClick={() => onSelect(obj.id)}
                className={`flex flex-col w-full px-3 py-2 rounded-md text-left transition-colors mb-0.5 ${
                  obj.id === selectedId
                    ? 'bg-violet-600/30 text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white/90'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <span>{obj.icon ?? '📝'}</span>
                  <span className="truncate text-sm">{obj.title}</span>
                </span>
                {matchedIn.includes('content') && !matchedIn.includes('title') && (
                  <span className="text-white/30 text-xs pl-6">matched in content</span>
                )}
              </button>
            ))}
          </div>
        ) : (
          // Grouped by type with filter/sort applied
          visibleTypes.map(({ type, label, icon }) => {
            const items = sortItems(objects.filter((o) => o.type === type), sort);
            const isOpen = !collapsed[type];
            return (
              <div key={type}>
                <button
                  onClick={() => toggle(type)}
                  className="flex items-center justify-between w-full px-4 py-1.5 text-white/50 hover:text-white/90 hover:bg-white/5 transition-colors group"
                >
                  <span className="flex items-center gap-2">
                    {icon}
                    <span className="font-medium text-xs uppercase tracking-widest">{label}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-white/30 text-xs">{items.length}</span>
                    <span
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); onCreate(type); }}
                    >
                      <Plus size={12} />
                    </span>
                    {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </span>
                </button>
                {isOpen &&
                  items.map((obj) => (
                    <ObjectRow
                      key={obj.id}
                      obj={obj}
                      selected={obj.id === selectedId}
                      onSelect={onSelect}
                    />
                  ))}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 px-4 py-3">
        <button
          onClick={onTodayNote}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs"
        >
          <Calendar size={14} />
          <span>Today&apos;s Note</span>
        </button>
      </div>
    </aside>
  );
}

function ObjectRow({
  obj,
  selected,
  onSelect,
}: {
  obj: CapacityObject;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(obj.id)}
      className={`flex items-center gap-2 w-full px-6 py-1.5 text-left truncate transition-colors ${
        selected ? 'bg-violet-600/30 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white/90'
      }`}
    >
      <span>{obj.icon ?? '📝'}</span>
      <span className="truncate text-sm">{obj.title}</span>
    </button>
  );
}
