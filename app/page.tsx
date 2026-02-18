'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useStore } from './store/useStore';
import Sidebar from './components/sidebar/Sidebar';
import ObjectDetail from './components/editor/ObjectDetail';
import CommandPalette from './components/ui/CommandPalette';
import GraphView from './components/graph/GraphView';
import CalendarView from './components/calendar/CalendarView';
import { ObjectType } from './lib/types';
import {
  PanelLeft, Plus, Keyboard, Sun, Moon, Network, Calendar,
  FileText, Download, Upload, Menu,
} from 'lucide-react';
import { format } from 'date-fns';
import { exportJSON, importJSON, exportAllMarkdown } from './lib/export';

export default function Home() {
  const store = useStore();
  const [showPalette, setShowPalette] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowPalette((v) => !v);
      }
      if (e.key === 'Escape') {
        setShowPalette(false);
        setShowExportMenu(false);
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleCreate = useCallback(
    (type: ObjectType, dateStr?: string) => {
      if (type === 'daily') {
        const d = dateStr ?? format(new Date(), 'yyyy-MM-dd');
        const existing = store.objects.find((o) => o.type === 'daily' && o.date === d);
        if (existing) { store.setSelectedId(existing.id); store.setView('editor'); return; }
        store.createObject('daily', {
          title: `Daily Note – ${format(new Date(d + 'T12:00:00'), 'MMMM d, yyyy')}`,
          date: d,
          icon: '📅',
        });
        store.setView('editor');
      } else {
        store.createObject(type);
        store.setView('editor');
      }
      setMobileSidebarOpen(false);
    },
    [store],
  );

  const handleSelect = useCallback(
    (id: string) => {
      store.setSelectedId(id);
      store.setView('editor');
      setMobileSidebarOpen(false);
    },
    [store],
  );

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importJSON(file);
      store.importObjects(data);
      setImportError(null);
    } catch (err) {
      setImportError((err as Error).message);
    }
    e.target.value = '';
  };

  if (!store.initialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f0f1a]">
        <div className="text-white/30 text-sm animate-pulse">Loading…</div>
      </div>
    );
  }

  const sidebarProps = {
    objects: store.objects,
    selectedId: store.selectedId,
    searchQuery: store.searchQuery,
    searchResults: store.searchResults,
    onSelect: handleSelect,
    onCreate: handleCreate,
    onSearch: store.setSearchQuery,
    onTodayNote: () => handleCreate('daily'),
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f0f1a] text-white">
      {/* ── Desktop Sidebar ─────────────────────────────────────────────────── */}
      {store.sidebarOpen && (
        <div className="hidden sm:flex">
          <Sidebar {...sidebarProps} onClose={() => store.setSidebarOpen(false)} />
        </div>
      )}

      {/* ── Mobile Sidebar overlay ──────────────────────────────────────────── */}
      {mobileSidebarOpen && (
        <div className="sm:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative z-50">
            <Sidebar {...sidebarProps} onClose={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* ── Main area ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-3 sm:px-6 py-2.5 border-b border-white/10 shrink-0 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile menu */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="sm:hidden text-white/40 hover:text-white transition-colors"
            >
              <Menu size={18} />
            </button>

            {/* Desktop sidebar toggle */}
            {!store.sidebarOpen && (
              <button
                onClick={() => store.setSidebarOpen(true)}
                className="hidden sm:block text-white/40 hover:text-white transition-colors"
                title="Open sidebar"
              >
                <PanelLeft size={18} />
              </button>
            )}

            {/* View tabs */}
            <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-1">
              <ViewTab
                active={store.view === 'editor'}
                onClick={() => store.setView('editor')}
                title="Editor"
              >
                <FileText size={13} />
                <span className="hidden sm:inline text-xs">Editor</span>
              </ViewTab>
              <ViewTab
                active={store.view === 'graph'}
                onClick={() => store.setView('graph')}
                title="Graph"
              >
                <Network size={13} />
                <span className="hidden sm:inline text-xs">Graph</span>
              </ViewTab>
              <ViewTab
                active={store.view === 'calendar'}
                onClick={() => store.setView('calendar')}
                title="Calendar"
              >
                <Calendar size={13} />
                <span className="hidden sm:inline text-xs">Calendar</span>
              </ViewTab>
            </div>

            {/* Breadcrumb (editor view only) */}
            {store.view === 'editor' && store.selectedObject && (
              <span className="text-white/40 text-sm truncate hidden sm:inline">
                {store.selectedObject.title}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Theme toggle */}
            <button
              onClick={store.toggleTheme}
              className="text-white/30 hover:text-white transition-colors p-1.5"
              title={`Switch to ${store.theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {store.theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Export/Import menu */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="text-white/30 hover:text-white transition-colors p-1.5"
                title="Export / Import"
              >
                <Download size={15} />
              </button>
              {showExportMenu && (
                <div
                  className="absolute right-0 top-full mt-1 z-30 bg-[#1a1a2e] border border-white/10 rounded-lg shadow-xl w-52 overflow-hidden"
                  onMouseLeave={() => setShowExportMenu(false)}
                >
                  <p className="text-white/30 text-xs px-3 py-1.5 border-b border-white/10 uppercase tracking-widest">
                    Export
                  </p>
                  <button
                    onClick={() => { exportAllMarkdown(store.objects); setShowExportMenu(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                  >
                    <Download size={13} /> All as Markdown
                  </button>
                  <button
                    onClick={() => { exportJSON(store.objects); setShowExportMenu(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                  >
                    <Download size={13} /> Backup (JSON)
                  </button>
                  <div className="border-t border-white/10" />
                  <button
                    onClick={() => { setShowExportMenu(false); fileInputRef.current?.click(); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                  >
                    <Upload size={13} /> Import JSON backup
                  </button>
                  {importError && (
                    <p className="text-red-400 text-xs px-3 pb-2">{importError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Command palette */}
            <button
              onClick={() => setShowPalette(true)}
              className="hidden sm:flex items-center gap-1.5 text-white/30 hover:text-white/70 transition-colors text-xs border border-white/10 rounded-md px-2 py-1.5"
              title="Command palette (Ctrl+K)"
            >
              <Keyboard size={12} />
              <span>⌃K</span>
            </button>

            {/* New button */}
            <button
              onClick={() => handleCreate('note')}
              className="flex items-center gap-1 bg-violet-600 hover:bg-violet-500 text-white text-xs rounded-md px-2.5 py-1.5 transition-colors"
              title="New note"
            >
              <Plus size={13} />
              <span className="hidden sm:inline">New</span>
            </button>
          </div>
        </header>

        {/* ── View content ─────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-hidden">
          {store.view === 'editor' && (
            store.selectedObject ? (
              <div className="h-full overflow-y-auto">
                <ObjectDetail
                  obj={store.selectedObject}
                  allObjects={store.objects}
                  onUpdate={store.updateObject}
                  onDelete={store.deleteObject}
                  onSelect={handleSelect}
                  onLink={store.addLink}
                  onRemoveLink={store.removeLink}
                />
              </div>
            ) : (
              <EmptyState onCreate={handleCreate} onOpenPalette={() => setShowPalette(true)} />
            )
          )}

          {store.view === 'graph' && (
            <GraphView
              objects={store.objects}
              selectedId={store.selectedId}
              onSelect={handleSelect}
            />
          )}

          {store.view === 'calendar' && (
            <div className="h-full overflow-y-auto">
              <CalendarView
                objects={store.objects}
                onSelect={handleSelect}
                onCreate={(date) => handleCreate('daily', date)}
              />
            </div>
          )}
        </main>
      </div>

      {/* Hidden file input for JSON import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImport}
      />

      {/* Command palette */}
      {showPalette && (
        <CommandPalette
          onClose={() => setShowPalette(false)}
          onCreate={(type) => { handleCreate(type); setShowPalette(false); }}
          objects={store.objects}
          onSelect={(id) => { handleSelect(id); setShowPalette(false); }}
        />
      )}
    </div>
  );
}

function ViewTab({
  children,
  active,
  onClick,
  title,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
        active ? 'bg-violet-600 text-white' : 'text-white/40 hover:text-white hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({
  onCreate,
  onOpenPalette,
}: {
  onCreate: (type: ObjectType) => void;
  onOpenPalette: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-white/20 gap-4 px-4">
      <p className="text-5xl">⚡</p>
      <p className="text-sm">Select an object or create a new one</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {(['note', 'daily', 'person', 'book'] as ObjectType[]).map((t) => (
          <button
            key={t}
            onClick={() => onCreate(t)}
            className="bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-xs px-3 py-1.5 rounded-lg transition-colors capitalize"
          >
            + {t}
          </button>
        ))}
      </div>
      <button
        onClick={onOpenPalette}
        className="text-xs text-white/20 hover:text-white/40 transition-colors"
      >
        or press Ctrl+K
      </button>
    </div>
  );
}
