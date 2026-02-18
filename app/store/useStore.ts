'use client';

import { useState, useCallback, useEffect } from 'react';
import { CapacityObject, ObjectType } from '../lib/types';
import { loadObjects, saveObjects } from '../lib/storage';
import { generateSeeds } from '../lib/seeds';
import { v4 as uuidv4 } from 'uuid';

export function useStore() {
  const [objects, setObjectsState] = useState<CapacityObject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const stored = loadObjects();
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
    [objects, setObjects]
  );

  const updateObject = useCallback(
    (id: string, patch: Partial<CapacityObject>) => {
      const updated = objects.map((o) =>
        o.id === id ? { ...o, ...patch, updatedAt: new Date().toISOString() } : o
      );
      setObjects(updated);
    },
    [objects, setObjects]
  );

  const deleteObject = useCallback(
    (id: string) => {
      const updated = objects.filter((o) => o.id !== id);
      setObjects(updated);
      if (selectedId === id) {
        setSelectedId(updated[0]?.id ?? null);
      }
    },
    [objects, setObjects, selectedId]
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
    [objects, setObjects]
  );

  const selectedObject = objects.find((o) => o.id === selectedId) ?? null;

  const filteredObjects = searchQuery.trim()
    ? objects.filter(
        (o) =>
          o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : objects;

  return {
    objects,
    filteredObjects,
    selectedId,
    selectedObject,
    searchQuery,
    sidebarOpen,
    initialized,
    setSelectedId,
    setSearchQuery,
    setSidebarOpen,
    createObject,
    updateObject,
    deleteObject,
    addLink,
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
