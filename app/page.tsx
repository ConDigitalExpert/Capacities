'use client';

import { useEffect, useCallback } from 'react';
import { useStore } from './store/useStore';
import Sidebar from './components/sidebar/Sidebar';
import ObjectDetail from './components/editor/ObjectDetail';
import CommandPalette from './components/ui/CommandPalette';
import { useState } from 'react';
import { ObjectType } from './lib/types';
import { PanelLeft, Plus, Keyboard } from 'lucide-react';
import { format } from 'date-fns';

export default function Home() {
  const store = useStore();
  const [showPalette, setShowPalette] = useState(false);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K  → command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowPalette((v) => !v);
      }
      // Escape → close palette
      if (e.key === 'Escape') {
        setShowPalette(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleCreate = useCallback(
    (type: ObjectType) => {
      if (type === 'daily') {
        const today = format(new Date(), 'yyyy-MM-dd');
        const existing = store.objects.find((o) => o.type === 'daily' && o.date === today);
        if (existing) {
          store.setSelectedId(existing.id);
          return;
        }
        store.createObject('daily', {
          title: `Daily Note – ${format(new Date(), 'MMMM d, yyyy')}`,
          date: today,
          icon: '📅',
        });
      } else {
        store.createObject(type);
      }
    },
    [store]
  );

  if (!store.initialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f0f1a]">
        <div className="text-white/30 text-sm animate-pulse">Loading…</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f0f1a] text-white">
      {/* Sidebar */}
      {store.sidebarOpen && (
        <Sidebar
          objects={store.objects}
          selectedId={store.selectedId}
          searchQuery={store.searchQuery}
          onSelect={store.setSelectedId}
          onCreate={handleCreate}
          onSearch={store.setSearchQuery}
          onClose={() => store.setSidebarOpen(false)}
        />
      )}

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            {!store.sidebarOpen && (
              <button
                onClick={() => store.setSidebarOpen(true)}
                className="text-white/40 hover:text-white transition-colors"
                title="Open sidebar"
              >
                <PanelLeft size={18} />
              </button>
            )}
            <span className="text-white/30 text-sm">
              {store.selectedObject ? (
                <span className="text-white/60">{store.selectedObject.title}</span>
              ) : (
                'No object selected'
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPalette(true)}
              className="flex items-center gap-1.5 text-white/30 hover:text-white/70 transition-colors text-xs border border-white/10 rounded-md px-2.5 py-1.5"
              title="Command palette (Ctrl+K)"
            >
              <Keyboard size={12} />
              <span>Ctrl K</span>
            </button>
            <button
              onClick={() => handleCreate('note')}
              className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs rounded-md px-3 py-1.5 transition-colors"
              title="New note"
            >
              <Plus size={13} />
              New
            </button>
          </div>
        </header>

        {/* Object detail */}
        <main className="flex-1 overflow-y-auto">
          {store.selectedObject ? (
            <ObjectDetail
              obj={store.selectedObject}
              allObjects={store.objects}
              onUpdate={store.updateObject}
              onDelete={store.deleteObject}
              onSelect={store.setSelectedId}
              onLink={store.addLink}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white/20">
              <p className="text-4xl mb-4">⚡</p>
              <p className="text-sm">Select an object or create a new one</p>
              <button
                onClick={() => handleCreate('note')}
                className="mt-4 bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 text-sm px-4 py-2 rounded-lg transition-colors"
              >
                + New Note
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Command palette */}
      {showPalette && (
        <CommandPalette
          onClose={() => setShowPalette(false)}
          onCreate={(type) => { handleCreate(type); setShowPalette(false); }}
          objects={store.objects}
          onSelect={(id) => { store.setSelectedId(id); setShowPalette(false); }}
        />
      )}
    </div>
  );
}
