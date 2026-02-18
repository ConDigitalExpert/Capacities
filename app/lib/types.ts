export type ObjectType =
  | 'note'
  | 'daily'
  | 'person'
  | 'book'
  | 'article'
  | 'media'
  | 'tag';

export interface ContentBlock {
  id: string;
  type: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'bulletList' | 'orderedList' | 'taskList' | 'quote' | 'code';
  content: string;
}

export interface CapacityObject {
  id: string;
  type: ObjectType;
  title: string;
  content: string; // TipTap JSON string
  tags: string[];
  linkedIds: string[]; // bidirectional links
  createdAt: string;
  updatedAt: string;
  date?: string; // for daily notes (YYYY-MM-DD)
  icon?: string;
  color?: string;
  // type-specific fields
  author?: string;       // book / article
  url?: string;          // article
  rating?: number;       // book / media
  status?: 'todo' | 'in-progress' | 'done'; // generic
}

export interface AppState {
  objects: CapacityObject[];
  selectedId: string | null;
  sidebarOpen: boolean;
  searchQuery: string;
}
