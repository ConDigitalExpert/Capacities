import { ObjectType } from './types';
import { format } from 'date-fns';

export interface Template {
  id: string;
  label: string;
  type: ObjectType;
  icon: string;
  content: object;
  extra?: Record<string, unknown>;
}

function doc(...nodes: object[]) {
  return { type: 'doc', content: nodes };
}
function h(level: 1 | 2 | 3, text: string) {
  return { type: 'heading', attrs: { level }, content: [{ type: 'text', text }] };
}
function p(text: string) {
  return { type: 'paragraph', content: text ? [{ type: 'text', text }] : [] };
}
function bullet(...items: string[]) {
  return {
    type: 'bulletList',
    content: items.map((i) => ({
      type: 'listItem',
      content: [p(i)],
    })),
  };
}
function task(...items: { text: string; checked?: boolean }[]) {
  return {
    type: 'taskList',
    content: items.map((i) => ({
      type: 'taskItem',
      attrs: { checked: i.checked ?? false },
      content: [p(i.text)],
    })),
  };
}
function quote(text: string) {
  return { type: 'blockquote', content: [p(text)] };
}

export const TEMPLATES: Template[] = [
  // ── Notes ──────────────────────────────────────────────────────────────────
  {
    id: 'note-blank',
    label: 'Blank Note',
    type: 'note',
    icon: '📝',
    content: doc(p('')),
  },
  {
    id: 'note-meeting',
    label: 'Meeting Notes',
    type: 'note',
    icon: '🤝',
    content: doc(
      h(2, 'Meeting Notes'),
      p(`Date: ${format(new Date(), 'MMMM d, yyyy')}`),
      h(3, 'Attendees'),
      bullet(''),
      h(3, 'Agenda'),
      bullet(''),
      h(3, 'Notes'),
      p(''),
      h(3, 'Action Items'),
      task({ text: '' }),
    ),
  },
  {
    id: 'note-project',
    label: 'Project Brief',
    type: 'note',
    icon: '🗂️',
    content: doc(
      h(2, 'Project Brief'),
      h(3, 'Goal'),
      p(''),
      h(3, 'Scope'),
      bullet('In scope:', 'Out of scope:'),
      h(3, 'Timeline'),
      p(''),
      h(3, 'Tasks'),
      task({ text: 'Define requirements' }, { text: 'Design solution' }, { text: 'Implement' }, { text: 'Review' }),
    ),
  },
  {
    id: 'note-idea',
    label: 'Idea Capture',
    type: 'note',
    icon: '💡',
    content: doc(
      h(2, 'Idea'),
      h(3, 'Problem'),
      p(''),
      h(3, 'Solution'),
      p(''),
      h(3, 'Why it matters'),
      p(''),
      h(3, 'Next steps'),
      task({ text: '' }),
    ),
  },
  // ── Daily ───────────────────────────────────────────────────────────────────
  {
    id: 'daily-default',
    label: 'Daily Note',
    type: 'daily',
    icon: '📅',
    content: doc(
      h(3, 'Morning intentions'),
      p(''),
      h(3, 'Today\'s focus'),
      task({ text: '' }, { text: '' }, { text: '' }),
      h(3, 'Notes & thoughts'),
      p(''),
      h(3, 'Evening reflection'),
      p(''),
    ),
  },
  {
    id: 'daily-standup',
    label: 'Standup',
    type: 'daily',
    icon: '🕐',
    content: doc(
      h(3, 'Yesterday'),
      bullet(''),
      h(3, 'Today'),
      bullet(''),
      h(3, 'Blockers'),
      bullet('None'),
    ),
  },
  // ── Person ──────────────────────────────────────────────────────────────────
  {
    id: 'person-default',
    label: 'Person',
    type: 'person',
    icon: '👤',
    content: doc(
      h(3, 'About'),
      p(''),
      h(3, 'How we met'),
      p(''),
      h(3, 'Notes'),
      p(''),
    ),
  },
  // ── Book ────────────────────────────────────────────────────────────────────
  {
    id: 'book-default',
    label: 'Book Review',
    type: 'book',
    icon: '📚',
    content: doc(
      h(3, 'Summary'),
      p(''),
      h(3, 'Key ideas'),
      bullet(''),
      h(3, 'Favourite quotes'),
      quote(''),
      h(3, 'My takeaways'),
      p(''),
    ),
  },
  // ── Article ─────────────────────────────────────────────────────────────────
  {
    id: 'article-default',
    label: 'Article',
    type: 'article',
    icon: '📰',
    content: doc(
      h(3, 'Summary'),
      p(''),
      h(3, 'Key points'),
      bullet(''),
      h(3, 'My thoughts'),
      p(''),
    ),
  },
  // ── Media ───────────────────────────────────────────────────────────────────
  {
    id: 'media-default',
    label: 'Media Review',
    type: 'media',
    icon: '🎬',
    content: doc(
      h(3, 'Overview'),
      p(''),
      h(3, 'What I liked'),
      bullet(''),
      h(3, 'What I didn\'t like'),
      bullet(''),
      h(3, 'Rating'),
      p('/5'),
    ),
  },
];

export function templatesByType(type: ObjectType): Template[] {
  return TEMPLATES.filter((t) => t.type === type);
}
