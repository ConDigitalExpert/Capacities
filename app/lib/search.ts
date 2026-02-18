import { CapacityObject } from './types';

/** Extract plain text from a TipTap JSON doc string */
export function extractText(jsonContent: string): string {
  try {
    const doc = JSON.parse(jsonContent);
    return nodeToText(doc);
  } catch {
    return jsonContent;
  }
}

function nodeToText(node: Record<string, unknown>): string {
  if (node.type === 'text') return (node.text as string) ?? '';
  if (node.type === 'wikilink') return (node.attrs as Record<string, string>)?.label ?? '';
  const content = node.content as Record<string, unknown>[] | undefined;
  if (!content) return '';
  return content.map(nodeToText).join(' ');
}

export interface SearchResult {
  obj: CapacityObject;
  score: number;
  matchedIn: ('title' | 'content' | 'tags' | 'author')[];
}

export function searchObjects(objects: CapacityObject[], query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return objects.map((obj) => ({ obj, score: 0, matchedIn: [] }));

  return objects
    .map((obj) => {
      let score = 0;
      const matchedIn: SearchResult['matchedIn'] = [];

      const title = obj.title.toLowerCase();
      if (title.includes(q)) {
        score += title.startsWith(q) ? 10 : 6;
        matchedIn.push('title');
      }

      if (obj.tags.some((t) => t.toLowerCase().includes(q))) {
        score += 4;
        matchedIn.push('tags');
      }

      if (obj.author?.toLowerCase().includes(q)) {
        score += 3;
        matchedIn.push('author');
      }

      const text = extractText(obj.content).toLowerCase();
      if (text.includes(q)) {
        score += 2;
        matchedIn.push('content');
      }

      return { obj, score, matchedIn };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}
