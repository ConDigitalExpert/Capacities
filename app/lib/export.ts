import { CapacityObject } from './types';
import { extractText } from './search';

// ─── JSON backup ─────────────────────────────────────────────────────────────

export function exportJSON(objects: CapacityObject[]): void {
  const blob = new Blob([JSON.stringify(objects, null, 2)], { type: 'application/json' });
  triggerDownload(blob, `capacities-backup-${dateStamp()}.json`);
}

export function importJSON(file: File): Promise<CapacityObject[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!Array.isArray(data)) throw new Error('Expected array');
        resolve(data as CapacityObject[]);
      } catch {
        reject(new Error('Invalid JSON backup file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// ─── Markdown export ─────────────────────────────────────────────────────────

export function exportMarkdown(obj: CapacityObject): void {
  const md = objectToMarkdown(obj);
  const blob = new Blob([md], { type: 'text/markdown' });
  const safeName = obj.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  triggerDownload(blob, `${safeName}.md`);
}

export function exportAllMarkdown(objects: CapacityObject[]): void {
  const combined = objects.map(objectToMarkdown).join('\n\n---\n\n');
  const blob = new Blob([combined], { type: 'text/markdown' });
  triggerDownload(blob, `capacities-export-${dateStamp()}.md`);
}

function objectToMarkdown(obj: CapacityObject): string {
  const lines: string[] = [];

  lines.push(`# ${obj.title}`);
  lines.push('');
  lines.push(`**Type:** ${obj.type}`);
  if (obj.author) lines.push(`**Author:** ${obj.author}`);
  if (obj.url) lines.push(`**URL:** ${obj.url}`);
  if (obj.rating) lines.push(`**Rating:** ${'⭐'.repeat(obj.rating)}`);
  if (obj.date) lines.push(`**Date:** ${obj.date}`);
  if (obj.tags.length) lines.push(`**Tags:** ${obj.tags.map((t) => `\`${t}\``).join(', ')}`);
  lines.push(`**Created:** ${obj.createdAt.slice(0, 10)}`);
  lines.push('');
  lines.push(tiptapToMarkdown(obj.content));

  return lines.join('\n');
}

function tiptapToMarkdown(jsonContent: string): string {
  try {
    const doc = JSON.parse(jsonContent);
    return nodesToMarkdown(doc.content ?? []);
  } catch {
    return jsonContent;
  }
}

type TNode = {
  type: string;
  text?: string;
  content?: TNode[];
  attrs?: Record<string, unknown>;
  marks?: { type: string }[];
};

function nodesToMarkdown(nodes: TNode[]): string {
  return nodes.map(nodeToMarkdown).join('\n');
}

function nodeToMarkdown(node: TNode): string {
  switch (node.type) {
    case 'text': {
      let text = node.text ?? '';
      if (node.marks) {
        for (const mark of node.marks) {
          if (mark.type === 'bold') text = `**${text}**`;
          if (mark.type === 'italic') text = `*${text}*`;
          if (mark.type === 'code') text = `\`${text}\``;
          if (mark.type === 'strike') text = `~~${text}~~`;
        }
      }
      return text;
    }
    case 'paragraph':
      return (node.content ? node.content.map(nodeToMarkdown).join('') : '') + '\n';
    case 'heading': {
      const level = (node.attrs?.level as number) ?? 1;
      const prefix = '#'.repeat(level);
      return `${prefix} ${node.content ? node.content.map(nodeToMarkdown).join('') : ''}\n`;
    }
    case 'bulletList':
      return (node.content ?? []).map((li) => `- ${nodesToMarkdown(li.content ?? []).trim()}`).join('\n') + '\n';
    case 'orderedList':
      return (node.content ?? [])
        .map((li, i) => `${i + 1}. ${nodesToMarkdown(li.content ?? []).trim()}`)
        .join('\n') + '\n';
    case 'listItem':
      return nodesToMarkdown(node.content ?? []);
    case 'taskList':
      return (node.content ?? [])
        .map((li) => `- [${li.attrs?.checked ? 'x' : ' '}] ${nodesToMarkdown(li.content ?? []).trim()}`)
        .join('\n') + '\n';
    case 'taskItem':
      return nodesToMarkdown(node.content ?? []);
    case 'blockquote':
      return nodesToMarkdown(node.content ?? [])
        .split('\n')
        .map((l) => `> ${l}`)
        .join('\n') + '\n';
    case 'codeBlock':
      return `\`\`\`\n${nodesToMarkdown(node.content ?? [])}\n\`\`\`\n`;
    case 'hardBreak':
      return '\n';
    default:
      return nodesToMarkdown(node.content ?? []);
  }
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function dateStamp(): string {
  return new Date().toISOString().slice(0, 10);
}
