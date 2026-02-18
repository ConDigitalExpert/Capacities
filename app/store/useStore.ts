'use client';

import { useState, useCallback, useEffect } from 'react';
import { CapacityObject, ObjectType } from '../lib/types';
import { loadObjects, saveObjects } from '../lib/storage';
import { generateSeeds } from '../lib/seeds';
import { searchObjects } from '../lib/search';
import { loadTheme, saveTheme, applyTheme, Theme } from '../lib/theme';
import { v4 as uuidv4 } from 'uuid';

export function useStore() {
  const [objects, setObjectsState] = useState<CapacityObject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [theme, setThemeState] = useState<Theme>('dark');
  const [view, setView] = useState<'editor' | 'graph' | 'calendar'>('editor');

  useEffect(() => {
    const stored = loadObjects();
    const t = loadTheme();
    applyTheme(t);
    setThemeState(t);

    if (stored.length === 0) {
      const seeds = generateSeeds();
      saveObjects(seeds);
      setObjectsState(seeds);
      setSelectedId(seeds[0].id);
    } else {
      setObjectsState(stored);
      setSelectedId(stored[0].id);
    }
    setInitialized(true);
  }, []);

  const setObjects = useCallback((updated: CapacityObject[]) => {
    setObjectsState(updated);
    saveObjects(updated);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    saveTheme(t);
    applyTheme(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const createObject = useCallback(
    (type: ObjectType, extra?: Partial<CapacityObject>): CapacityObject => {
      const now = new Date().toISOString();
      const newObj: CapacityObject = {
        id: uuidv4(),
        type,
        title: 'Untitled',
        content: JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] }),
        tags: [],
        linkedIds: [],
        createdAt: now,
        updatedAt: now,
        icon: typeIcon(type),
        ...extra,
      };
      const updated = [newObj, ...objects];
      setObjects(updated);
      setSelectedId(newObj.id);
      return newObj;
    },
    [objects, setObjects],
  );

  const updateObject = useCallback(
    (id: string, patch: Partial<CapacityObject>) => {
      const updated = objects.map((o) =>
        o.id === id ? { ...o, ...patch, updatedAt: new Date().toISOString() } : o,
      );
      setObjects(updated);
    },
    [objects, setObjects],
  );

  const deleteObject = useCallback(
    (id: string) => {
      const updated = objects.filter((o) => o.id !== id);
      setObjects(updated);
      if (selectedId === id) {
        setSelectedId(updated[0]?.id ?? null);
      }
    },
    [objects, setObjects, selectedId],
  );

  const addLink = useCallback(
    (fromId: string, toId: string) => {
      const updated = objects.map((o) => {
        if (o.id === fromId && !o.linkedIds.includes(toId)) {
          return { ...o, linkedIds: [...o.linkedIds, toId], updatedAt: new Date().toISOString() };
        }
        if (o.id === toId && !o.linkedIds.includes(fromId)) {
          return { ...o, linkedIds: [...o.linkedIds, fromId], updatedAt: new Date().toISOString() };
        }
        return o;
      });
      setObjects(updated);
    },
    [objects, setObjects],
  );

  /** Replace all objects (used for JSON import) */
  const importObjects = useCallback(
    (incoming: CapacityObject[]) => {
      setObjects(incoming);
      setSelectedId(incoming[0]?.id ?? null);
    },
    [setObjects],
  );

  const selectedObject = objects.find((o) => o.id === selectedId) ?? null;

  const searchResults = searchQuery.trim()
    ? searchObjects(objects, searchQuery)
    : null;

  const filteredObjects = searchResults ? searchResults.map((r) => r.obj) : objects;

  return {
    objects,
    filteredObjects,
    searchResults,
    selectedId,
    selectedObject,
    searchQuery,
    sidebarOpen,
    initialized,
    theme,
    view,
    setSelectedId,
    setSearchQuery,
    setSidebarOpen,
    setView,
    toggleTheme,
    createObject,
    updateObject,
    deleteObject,
    addLink,
    importObjects,
  };
}

function typeIcon(type: ObjectType): string {
  const icons: Record<ObjectType, string> = {
    note: '📝',
    daily: '📅',
    person: '👤',
    book: '📚',
    article: '📰',
    media: '🎬',
    tag: '🏷️',
  };
  return icons[type] ?? '📝';
}
