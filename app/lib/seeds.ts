import { CapacityObject } from './types';
import { format } from 'date-fns';

export function generateSeeds(): CapacityObject[] {
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');

  return [
    {
      id: 'seed-daily-today',
      type: 'daily',
      title: `Daily Note – ${format(new Date(), 'MMMM d, yyyy')}`,
      content: JSON.stringify({
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'Welcome to Capacities! This is your daily note.' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Jot down thoughts, tasks, and ideas here.' }] },
          { type: 'taskList', content: [
            { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Read about Capacities features' }] }] },
            { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Create your first note' }] }] },
          ]},
        ],
      }),
      tags: ['daily'],
      linkedIds: ['seed-note-1'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      date: today,
      icon: '📅',
    },
    {
      id: 'seed-daily-yesterday',
      type: 'daily',
      title: `Daily Note – ${format(new Date(Date.now() - 86400000), 'MMMM d, yyyy')}`,
      content: JSON.stringify({
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'Yesterday\'s reflections go here.' }] },
        ],
      }),
      tags: ['daily'],
      linkedIds: [],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      date: yesterday,
      icon: '📅',
    },
    {
      id: 'seed-note-1',
      type: 'note',
      title: 'Getting Started with Capacities',
      content: JSON.stringify({
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'What is Capacities?' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Capacities is a connected knowledge management system. Everything is an object with properties and links.' }] },
          { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Key Features' }] },
          { type: 'bulletList', content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Rich object types (notes, people, books, …)' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Bidirectional links between objects' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Daily notes for journaling' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Tags to organise content' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Full-text search across all objects' }] }] },
          ]},
        ],
      }),
      tags: ['guide', 'getting-started'],
      linkedIds: ['seed-daily-today'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      icon: '📝',
    },
    {
      id: 'seed-person-1',
      type: 'person',
      title: 'Ada Lovelace',
      content: JSON.stringify({
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'First computer programmer. Wrote the first algorithm intended to be processed by a machine.' }] },
        ],
      }),
      tags: ['tech', 'history'],
      linkedIds: ['seed-book-1'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      icon: '👤',
    },
    {
      id: 'seed-book-1',
      type: 'book',
      title: 'The Innovators',
      content: JSON.stringify({
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'A story of the people who created the computer and the internet.' }] },
        ],
      }),
      tags: ['technology', 'history'],
      linkedIds: ['seed-person-1'],
      author: 'Walter Isaacson',
      rating: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      icon: '📚',
    },
  ];
}
