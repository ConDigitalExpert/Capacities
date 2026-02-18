# Capacities Replica — Comprehensive Development Plan

> **Project**: Personal Knowledge Management Studio (Capacities Clone)
> **Goal**: Build a fully-featured, self-hosted replica of Capacities.io customized for personal use
> **Date**: 2026-02-18

---

## Table of Contents

1. [Architecture & Tech Stack](#1-architecture--tech-stack)
2. [Project Structure](#2-project-structure)
3. [Phase 1 — Foundation](#3-phase-1--foundation)
4. [Phase 2 — Core Object System](#4-phase-2--core-object-system)
5. [Phase 3 — Block Editor](#5-phase-3--block-editor)
6. [Phase 4 — Navigation & UI Shell](#6-phase-4--navigation--ui-shell)
7. [Phase 5 — Daily Notes & Calendar](#7-phase-5--daily-notes--calendar)
8. [Phase 6 — Tags, Collections & Organization](#8-phase-6--tags-collections--organization)
9. [Phase 7 — Search & Queries](#9-phase-7--search--queries)
10. [Phase 8 — Graph Visualization](#10-phase-8--graph-visualization)
11. [Phase 9 — Media Handling](#11-phase-9--media-handling)
12. [Phase 10 — Properties System](#12-phase-10--properties-system)
13. [Phase 11 — Templates & Page Layouts](#13-phase-11--templates--page-layouts)
14. [Phase 12 — Task Management](#14-phase-12--task-management)
15. [Phase 13 — AI Integration](#15-phase-13--ai-integration)
16. [Phase 14 — Import/Export](#16-phase-14--importexport)
17. [Phase 15 — Integrations & API](#17-phase-15--integrations--api)
18. [Phase 16 — Polish, Performance & PWA](#18-phase-16--polish-performance--pwa)
19. [Database Schema](#19-database-schema)
20. [API Route Map](#20-api-route-map)

---

## 1. Architecture & Tech Stack

### Frontend
| Layer | Technology | Rationale |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | SSR/SSG, file-based routing, API routes built-in |
| UI Library | **React 19** | Component model, ecosystem, concurrent features |
| Styling | **Tailwind CSS 4 + shadcn/ui** | Utility-first, accessible components, easy theming |
| State Management | **Zustand** | Lightweight, no boilerplate, good for complex nested state |
| Block Editor | **TipTap v3 (ProseMirror)** | Extensible block editor, collaborative editing ready |
| Graph Visualization | **Cytoscape.js** | Mature graph library, layout algorithms, performant |
| Date Handling | **date-fns** | Tree-shakeable, immutable, comprehensive |
| Forms | **React Hook Form + Zod** | Performant forms with schema validation |
| Icons | **Lucide React** | Clean, consistent icon set |
| DnD | **dnd-kit** | Accessible drag-and-drop for block reordering |
| Animations | **Framer Motion** | Declarative animations, layout transitions |

### Backend
| Layer | Technology | Rationale |
|---|---|---|
| Runtime | **Node.js 22 LTS** | Stable, fast, ecosystem |
| API | **Next.js Route Handlers** | Co-located with frontend, type-safe |
| ORM | **Prisma 6** | Type-safe queries, migrations, introspection |
| Database | **PostgreSQL 16** | JSONB for flexible properties, full-text search, graph queries via recursive CTEs |
| Search | **PostgreSQL FTS + pg_trgm** | Built-in full-text search with trigram similarity (no extra infra) |
| File Storage | **Local filesystem + S3-compatible (MinIO)** | Self-hosted media storage |
| Auth | **NextAuth.js v5** | Even for personal use — protects the instance |
| Real-time | **Server-Sent Events (SSE)** | Simpler than WebSockets for single-user |
| Background Jobs | **BullMQ + Redis** | Media processing, AI requests, import/export jobs |
| AI Gateway | **Vercel AI SDK** | Unified interface for OpenAI, Anthropic, Google, etc. |

### Infrastructure (Self-Hosted)
| Layer | Technology |
|---|---|
| Containerization | **Docker + Docker Compose** |
| Reverse Proxy | **Caddy** (auto HTTPS) |
| Database | **PostgreSQL 16** (container) |
| Cache/Queue | **Redis 7** (container) |
| Object Storage | **MinIO** (container) or local volume |
| Backup | **pg_dump** cron + rsync media |

---

## 2. Project Structure

```
capacities/
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── docker-compose.dev.yml
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
│   ├── icons/
│   └── default-covers/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (app)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── daily/[date]/
│   │   │   ├── object/[id]/
│   │   │   ├── type/[slug]/
│   │   │   ├── search/
│   │   │   ├── graph/[id]/
│   │   │   ├── tasks/
│   │   │   ├── settings/
│   │   │   └── ai/
│   │   └── api/
│   │       ├── objects/
│   │       ├── blocks/
│   │       ├── types/
│   │       ├── tags/
│   │       ├── collections/
│   │       ├── search/
│   │       ├── graph/
│   │       ├── media/
│   │       ├── templates/
│   │       ├── properties/
│   │       ├── tasks/
│   │       ├── ai/
│   │       ├── import/
│   │       ├── export/
│   │       ├── calendar/
│   │       └── auth/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── editor/
│   │   ├── objects/
│   │   ├── views/
│   │   ├── graph/
│   │   ├── calendar/
│   │   ├── search/
│   │   ├── tasks/
│   │   ├── ai/
│   │   ├── media/
│   │   └── settings/
│   ├── hooks/
│   ├── stores/
│   ├── lib/
│   └── types/
├── tests/
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. Phase 1 — Foundation

**Goal**: Bootable app with auth, database, and app shell rendering.

### 1.1 Project Initialization
- Initialize Next.js 15 with TypeScript, App Router, Tailwind CSS
- Install and configure shadcn/ui component library
- Set up ESLint, Prettier, path aliases

### 1.2 Database Setup
- Install and configure Prisma with PostgreSQL
- Create initial schema (User, Space, ObjectType, Object, Block, Tag, Collection, Property, Link, Media, Template, Query, DailyNote, Task, AIChat)
- Write seed script with default object types (Page, Tag, Image, Weblink, PDF, Audio, File, Tweet, AI Chat, Table, Query)
- Create Docker Compose for local development (PostgreSQL + Redis + MinIO)

### 1.3 Authentication
- Configure NextAuth.js v5 with credentials provider (email/password)
- Create login and registration pages
- Add auth middleware to protect app routes

### 1.4 App Shell
- Create root (app)/layout.tsx with sidebar + main content area
- Build static sidebar skeleton (logo, new content button, search icon, calendar icon, task icon, type list)
- Implement sidebar toggle (static vs. floating mode)
- Set up Zustand app store for global state
- Implement dark/light theme toggle
- Add keyboard shortcut system

**Deliverable**: Running app with login, empty sidebar, and main content area.

---

## 4. Phase 2 — Core Object System

**Goal**: CRUD operations for typed objects. The heart of the application.

### 2.1 Object Type Management
- API: GET/POST/PATCH/DELETE for `/api/types`
- Settings UI: Object Type manager (list, create, edit, delete custom types)
- Property definition editor per object type
- Icon picker and color picker components

### 2.2 Object CRUD
- API: Full CRUD for `/api/objects` with soft delete
- List objects by type with pagination, sorting, filtering
- "Turn Into" feature — change object type
- Trash: list, permanently delete, or restore

### 2.3 Object Views
- **List View**: Sortable table with title, type icon, tags, date, properties
- **Wall View**: Masonry-style card grid showing preview content
- **Gallery View**: Image-focused grid (cover image + title)
- **Board View**: Kanban columns grouped by a single-select property
- **Embed View**: Full content embedded in a scrollable list
- View switcher, sort controls, filter controls

### 2.4 Object Detail Page
- Route: `/object/[id]` with cover image, icon/emoji, title, description
- Properties panel (left sidebar, collapsible)
- Block editor area (Phase 3)
- Backlinks section at bottom (grouped by type, shows formatted content)
- Breadcrumb navigation and context menu

### 2.5 Quick Object Creation
- "New Content" button with type selector
- Cmd/Ctrl+N shortcut
- Inline creation from @ mentions
- Create from command palette

**Deliverable**: Full object CRUD with multiple views and detail pages.

---

## 5. Phase 3 — Block Editor

**Goal**: Rich block-based editor using TipTap with all Capacities block types.

### 3.1 TipTap Setup
- Install TipTap v3 with extensions
- Create BlockEditor wrapper with toolbar
- Content persistence (auto-save with debounce to DB)
- Undo/redo

### 3.2 Basic Block Types
- **Text**: Paragraphs with bold, italic, underline, strikethrough, code, highlight
- **Headings**: H1-H3 with optional toggle (expand/collapse children)
- **Lists**: Bullet and numbered, nested with indentation
- **To-do**: Checkbox + text, Cmd/Ctrl+Enter to toggle
- **Toggle**: Expand/collapse with summary
- **Code**: Syntax-highlighted with language picker
- **Math**: LaTeX rendering via KaTeX, inline math via Cmd/Ctrl+M
- **Quote/Callout**: Styled blockquote
- **Divider**: Horizontal rule
- **Highlight**: Colored background quote

### 3.3 Advanced Block Types
- **Table**: Inline with add/remove rows/columns
- **Group**: Cmd/Ctrl+G to group blocks
- **Embed**: External content via URL paste
- **Image**: Inline with resize, alignment, caption
- **File**: Attached file with download link

### 3.4 Slash Command Menu
- Type `/` to open filterable block type menu
- Recently used at top
- `/Ask AI` for inline AI

### 3.5 Bubble Menu (Floating Toolbar)
- Appears on text selection
- Formatting: bold, italic, underline, strikethrough, code, highlight, link
- AI sparkle button for quick actions
- "Turn into" to change block type

### 3.6 Block References & Transclusion
- **@ mentions**: Search and link to objects (renders as inline chip)
- **# mentions**: Search and apply tags
- **Block references**: Copy block reference, paste elsewhere
- **Block transclusion**: Live sync (edits propagate everywhere)
- **Block reference counter**: Badge with count + clickable list
- **Date mentions**: @date links to daily note

### 3.7 Block Operations
- Drag-and-drop reordering via dnd-kit
- Multi-block selection (Shift+click)
- Bulk actions: move, send to daily note, turn into new object, delete
- Markdown shortcuts at block start (`#`, `-`, `1.`, `>`, `---`, `` ``` ``)

### 3.8 Block Persistence
- API: CRUD + reorder + move for `/api/blocks`
- Optimistic updates with rollback
- Auto-save with 500ms debounce

**Deliverable**: Fully-featured block editor matching Capacities.

---

## 6. Phase 4 — Navigation & UI Shell

**Goal**: Tabs, side panel, command palette, focus mode.

### 4.1 Tab System
- Tab bar with independent navigation state per tab
- Open in new tab: Cmd/Ctrl+click
- Close, reorder, persist tabs across sessions
- Keyboard shortcuts: Ctrl+Tab / Ctrl+Shift+Tab

### 4.2 Side Panel
- Shift+click opens content alongside main view
- Can show: object content, graph view, table of contents, backlinks
- Resizable width, independent scroll

### 4.3 Command Palette (Cmd/Ctrl+P)
- Full-text search across all objects
- Actions section at top (create, navigate, toggle theme)
- Recent objects, property values searchable
- Paste URL auto-creates weblink, paste text sends to daily note
- Keyboard nav and fuzzy matching

### 4.4 Extended Search (Cmd/Ctrl+Shift+P)
- Dedicated page with filter panel
- Filter by type, tags, properties, date range
- Toggle objects or blocks, sort, group, limit
- "Save as Query" button
- Highlighting in results

### 4.5 Sidebar Enhancements
- Entry counts per type
- Custom sidebar groups (drag types/objects into groups)
- Collapsible groups, context menus, keyboard nav

### 4.6 Focus Mode
- Toggle hides all chrome, shows only editor
- Hover zones to reveal nav, ESC to exit

### 4.7 Keyboard Shortcuts
- Full shortcut system: Cmd+P, Cmd+Shift+P, Cmd+N, Cmd+J, Cmd+Enter, Cmd+G, Cmd+M, Cmd+B/I/U, Cmd+K, Cmd+Shift+F
- Help modal (Cmd+/)

**Deliverable**: Complete navigation with multi-tab, side panel, command palette.

---

## 7. Phase 5 — Daily Notes & Calendar

**Goal**: Time-based organization with daily notes and calendar.

### 5.1 Daily Notes
- Auto-create daily note on app load
- Route: `/daily/[date]` (YYYY-MM-DD)
- Daily note is a regular Object with "DailyNote" type
- Quick access: double-click calendar, prev/next day arrows
- Daily note template support

### 5.2 Calendar View
- Monthly mini-calendar in sidebar
- Click date to navigate, dots on dates with notes
- Highlight today, configurable week start

### 5.3 Timeline
- Show objects created/referenced that day
- Auto-link every object to its creation date
- Timeline entries: icon + title + time, clickable

### 5.4 Date Properties & Links
- @date mentions link to daily notes
- Objects with date properties appear on calendar
- "On this day" for previous years

**Deliverable**: Full daily notes with calendar and timeline.

---

## 8. Phase 6 — Tags, Collections & Organization

**Goal**: Cross-cutting organizational structures.

### 6.1 Tags
- Tags are first-class objects (own page with blocks/notes)
- Tag page shows all tagged objects, grouped by type
- Apply via # mention or properties panel
- Autocomplete with create-new, icon/color customization
- Nested tags (parent/child via `/`), cross-type, bulk operations

### 6.2 Collections
- Belong to a specific object type
- Objects in multiple collections simultaneously
- Create from sidebar or type page, drag-and-drop
- Collection-specific views, sidebar sub-items

### 6.3 Labels
- Single-select properties for within-type categorization
- Label colors, usable as Board view columns

### 6.4 Space Management
- Multiple spaces ("Personal", "Work")
- Space switcher in sidebar, each space independent

**Deliverable**: Tags, collections, labels, and spaces.

---

## 9. Phase 7 — Search & Queries

**Goal**: Powerful search and saved query system.

### 7.1 Full-Text Search
- PostgreSQL FTS: tsvector columns on Objects and Blocks
- GIN indexes, pg_trgm for fuzzy matching
- Search API with type/tag/property filters
- Title-only (fast) and full-text modes
- Ranking: title matches > content, exact phrase with quotes

### 7.2 Query Objects
- **Object Type Query**: filter by type + tag/property/collection
- **Search Query**: filter by terms + type/tag/property
- **Tag Query**: filter by tag + type/property
- Visual query builder UI
- Live results, embeddable via @, all views supported
- Variable queries for templates

### 7.3 Unlinked Mentions
- Detect titles mentioned but not linked
- Show at bottom of object page
- One-click to convert to proper link

**Deliverable**: Full search with saved queries and unlinked mentions.

---

## 10. Phase 8 — Graph Visualization

**Goal**: Interactive local graph view.

### 8.1 Graph Data API
- GET /api/graph/[objectId] — nodes and edges
- Direct links, backlinks, tags, collections
- Expandable second-degree connections
- Filter options as query params

### 8.2 Graph Rendering
- Cytoscape.js with force-directed layout
- Nodes: type icon + title, colored by type
- Edges styled by relationship type
- Center node highlighted, hover tooltip, click to navigate

### 8.3 Graph Controls
- Zoom, fit, reset, toggle type visibility
- Simplified view, hide high-connectivity nodes (25+)
- Full-screen mode, unified date nodes

### 8.4 Graph Integration
- Graph icon in object header opens in side panel
- Full-screen route: /graph/[id]
- Updates when navigating, responsive

**Deliverable**: Interactive local graph with full controls.

---

## 11. Phase 9 — Media Handling

**Goal**: First-class media objects with split-screen.

### 9.1 Upload System
- Multipart upload endpoint with validation (100MB limit)
- Auto-detect type, create appropriate object
- Metadata extraction, thumbnail generation (Sharp)
- Progress indicator, drag-and-drop, clipboard paste
- Command palette upload (up to 5 simultaneous)

### 9.2 Media Object Types
- **Image**: Viewer with zoom/pan, Unsplash integration, multiple embed sizes
- **PDF**: Built-in PDF.js reader with page nav/zoom/search
- **Audio**: HTML5 player with waveform, playback speed
- **File**: Generic card with icon, name, size, download
- **Weblink**: Auto-fetch OG tags (title, cover, description), iframe embed option

### 9.3 Media Split View
- Toggle: media only / notes only / split view
- Resizable split pane, persistent scroll/zoom

### 9.4 Storage Backend
- MinIO S3-compatible storage
- Organized by space/type/year-month/filename
- Signed URLs, optional local-only mode
- Storage usage tracking

**Deliverable**: Complete media handling with split-screen.

---

## 12. Phase 10 — Properties System

**Goal**: Typed properties per object type.

### 10.1 Property Definitions
- Define at object type level
- Types: Text, Number (currency/percentage), Date, Checkbox, Single-select, Multi-select, Object select, URL
- Icon customization, ordering, required vs optional

### 10.2 Property Values
- API: PATCH /api/objects/[id]/properties
- Properties panel in detail view (left sidebar)
- Inline editing, object select with search dropdown
- Date picker, single/multi-select option management

### 10.3 Property Features
- Filter and sort objects by property values
- Searchable via extended search
- AI auto-fill based on object content
- Show/hide properties in list views

**Deliverable**: Full property system.

---

## 13. Phase 11 — Templates & Page Layouts

**Goal**: Templates and multiple page layouts.

### 11.1 Templates
- CRUD API for templates per object type
- Template editor: default blocks + default property values
- Star to make default, template picker on creation
- Auto-assign collections, variable queries
- Daily note templates

### 11.2 Page Layouts
- **Standard**: Default clean design, optional wide mode
- **Index Card**: Constrained-width Zettelkasten card
- **Profile**: Circular avatar, properties left (people/orgs)
- **Encyclopedia**: TOC sidebar, backlink nav, high density
- Layout selector per type in settings
- Wide mode and wide cover image toggles

**Deliverable**: Template system and 4 page layouts.

---

## 14. Phase 12 — Task Management

**Goal**: Integrated task system from to-do blocks.

### 12.1 Task Extraction
- To-do blocks auto-register as tasks
- Bidirectional sync: dashboard toggle <-> editor toggle
- Delete block removes task

### 12.2 Task Dashboard
- Route: /tasks with sidebar icon
- Views: Today, Upcoming, All, Completed
- Filter by type, tag, collection, date
- Click task navigates to source object/block

### 12.3 Task Features
- Due dates, priority levels
- Tasks on calendar at due date
- Quick add from command palette to daily note

**Deliverable**: Task management with dashboard and calendar.

---

## 15. Phase 13 — AI Integration

**Goal**: Multi-provider AI for chat, quick actions, inline.

### 13.1 AI Provider System
- Settings page for API key management
- Providers: OpenAI, Anthropic, Google, Mistral, xAI, Perplexity, **Ollama (local!)**
- Model selector, usage tracking

### 13.2 AI Chat (Cmd/Ctrl+J)
- Slide-out panel, select notes as context
- Streaming responses, follow-up conversations
- Save as AI Chat object (taggable, searchable, linkable)

### 13.3 AI Quick Actions
- Select text + sparkle icon in bubble menu
- Actions: Summarize, Translate, Improve, Shorten, Lengthen, Fix grammar, Explain, Custom
- Replace or insert below

### 13.4 Ask AI Inline
- /Ask AI from slash menu
- Response as new blocks below, uses current object as context

### 13.5 AI Property Auto-Fill
- Enable per property, AI reads title + content
- One-click accept or override

**Deliverable**: Complete AI with chat, quick actions, inline, auto-fill.

---

## 16. Phase 14 — Import/Export

**Goal**: Full data portability.

### 14.1 Export
- **Markdown**: YAML frontmatter + wiki-links
- **HTML**: Rendered with embedded styles
- **CSV**: Tabular per object type
- **Word (.docx)**: Via pandoc/docx lib
- Scope: single object, type, or entire space
- Media included as ZIP, background job with progress

### 14.2 Import
- **Markdown**: Parse frontmatter, convert wiki-links
- **Text**: Import as plain pages
- **CSV**: Map columns to properties
- **ZIP**: Extract with media
- Preview, conflict resolution, background job

### 14.3 Backup System
- One-click full backup (DB dump + media)
- Scheduled automatic backups
- Restore functionality

**Deliverable**: Import/export plus backup.

---

## 17. Phase 15 — Integrations & API

**Goal**: Public API and external integrations.

### 15.1 Public REST API
- API key generation, documented CRUD endpoints
- Rate limiting, auto-generated OpenAPI docs

### 15.2 Web Clipper (Browser Extension)
- Save page as Weblink with OG data
- Choose space and tags, saving profiles

### 15.3 Webhook System
- Events: object.created/updated/deleted, tag.assigned
- Test/ping, retry with backoff

### 15.4 Calendar Integration
- CalDAV/iCal for external calendars
- Display events alongside daily notes

### 15.5 Quick Capture
- Email-to-daily-note
- Telegram bot
- REST endpoint for automation

**Deliverable**: Public API, web clipper, webhooks, capture.

---

## 18. Phase 16 — Polish, Performance & PWA

**Goal**: Production-ready application.

### 16.1 Performance
- DB query optimization, React Server Components, streaming SSR
- Virtual scrolling (react-virtuoso), image lazy loading
- Bundle splitting, Redis caching, optimistic UI

### 16.2 PWA
- Service worker for offline, web app manifest
- IndexedDB cache for recent objects
- Background sync, push notifications

### 16.3 UX Polish
- Loading skeletons, smooth transitions (Framer Motion)
- Toasts, confirmation dialogs, empty states
- Responsive: desktop (full), tablet (adapted), mobile (essential)
- Accessible: keyboard nav, screen reader, ARIA, focus management

### 16.4 Testing
- Unit: Vitest for utilities, hooks, stores
- Integration: API routes with supertest
- E2E: Playwright for critical flows
- Visual regression with screenshots

### 16.5 Deployment
- Production Docker Compose
- Health checks, structured logging (pino), error tracking
- Migration strategy, automated backup cron

**Deliverable**: Production-ready, performant, installable application.

---

## 19. Database Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  avatar    String?
  settings  Json     @default("{}")
  spaces    Space[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Space {
  id          String       @id @default(cuid())
  name        String
  icon        String?
  settings    Json         @default("{}")
  userId      String
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  objectTypes ObjectType[]
  objects     Object[]
  tags        Tag[]
  collections Collection[]
  dailyNotes  DailyNote[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model ObjectType {
  id                  String     @id @default(cuid())
  name                String
  slug                String
  icon                String     @default("file-text")
  color               String     @default("#6B7280")
  builtIn             Boolean    @default(false)
  layoutType          String     @default("standard")
  layoutConfig        Json       @default("{}")
  propertyDefinitions Json       @default("[]")
  spaceId             String
  space               Space      @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  objects             Object[]
  templates           Template[]
  collections         Collection[]
  createdAt           DateTime   @default(now())
  updatedAt           DateTime   @updatedAt

  @@unique([spaceId, slug])
}

model Object {
  id          String    @id @default(cuid())
  title       String    @default("")
  description String?
  icon        String?
  emoji       String?
  coverImage  String?
  typeId      String
  type        ObjectType @relation(fields: [typeId], references: [id])
  spaceId     String
  space       Space     @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  blocks      Block[]
  properties  Property[]
  tags        ObjectTag[]
  collections ObjectCollection[]
  media       Media[]
  tasks       Task[]
  aiChats     AIChat[]
  queries     Query[]
  dailyNote   DailyNote?
  outgoingLinks Link[] @relation("sourceObject")
  incomingLinks Link[] @relation("targetObject")
  searchVector Unsupported("tsvector")?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  @@index([typeId])
  @@index([spaceId])
  @@index([createdAt])
  @@index([deletedAt])
}

model Block {
  id            String   @id @default(cuid())
  objectId      String
  object        Object   @relation(fields: [objectId], references: [id], onDelete: Cascade)
  parentBlockId String?
  parentBlock   Block?   @relation("BlockChildren", fields: [parentBlockId], references: [id])
  children      Block[]  @relation("BlockChildren")
  type          String
  content       Json     @default("{}")
  position      Int      @default(0)
  tasks         Task[]
  sourceLinks   Link[]   @relation("sourceBlock")
  searchVector  Unsupported("tsvector")?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([objectId, position])
}

model Tag {
  id       String      @id @default(cuid())
  name     String
  icon     String?
  color    String?
  parentId String?
  parent   Tag?        @relation("TagChildren", fields: [parentId], references: [id])
  children Tag[]       @relation("TagChildren")
  spaceId  String
  space    Space       @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  objects  ObjectTag[]
  objectId String?     @unique
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  @@unique([spaceId, name])
}

model ObjectTag {
  objectId String
  object   Object @relation(fields: [objectId], references: [id], onDelete: Cascade)
  tagId    String
  tag      Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([objectId, tagId])
}

model Collection {
  id      String              @id @default(cuid())
  name    String
  icon    String?
  typeId  String
  type    ObjectType          @relation(fields: [typeId], references: [id])
  spaceId String
  space   Space               @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  objects ObjectCollection[]
  createdAt DateTime          @default(now())
  updatedAt DateTime          @updatedAt
}

model ObjectCollection {
  objectId     String
  object       Object     @relation(fields: [objectId], references: [id], onDelete: Cascade)
  collectionId String
  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)

  @@id([objectId, collectionId])
}

model Property {
  id            String @id @default(cuid())
  objectId      String
  object        Object @relation(fields: [objectId], references: [id], onDelete: Cascade)
  definitionKey String
  value         Json

  @@unique([objectId, definitionKey])
  @@index([definitionKey])
}

model Link {
  id             String  @id @default(cuid())
  sourceObjectId String
  sourceObject   Object  @relation("sourceObject", fields: [sourceObjectId], references: [id], onDelete: Cascade)
  targetObjectId String
  targetObject   Object  @relation("targetObject", fields: [targetObjectId], references: [id], onDelete: Cascade)
  sourceBlockId  String?
  sourceBlock    Block?  @relation("sourceBlock", fields: [sourceBlockId], references: [id], onDelete: SetNull)
  type           String  @default("mention")
  createdAt      DateTime @default(now())

  @@unique([sourceObjectId, targetObjectId, sourceBlockId])
  @@index([targetObjectId])
}

model Media {
  id       String @id @default(cuid())
  objectId String
  object   Object @relation(fields: [objectId], references: [id], onDelete: Cascade)
  filename String
  mimeType String
  size     Int
  path     String
  metadata Json   @default("{}")
  createdAt DateTime @default(now())
}

model Template {
  id               String     @id @default(cuid())
  name             String
  typeId           String
  type             ObjectType @relation(fields: [typeId], references: [id], onDelete: Cascade)
  isDefault        Boolean    @default(false)
  content          Json       @default("[]")
  propertyDefaults Json       @default("{}")
  collectionIds    Json       @default("[]")
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt
}

model DailyNote {
  id       String   @id @default(cuid())
  date     DateTime @db.Date
  spaceId  String
  space    Space    @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  objectId String   @unique
  object   Object   @relation(fields: [objectId], references: [id], onDelete: Cascade)

  @@unique([spaceId, date])
}

model Task {
  id          String    @id @default(cuid())
  objectId    String
  object      Object    @relation(fields: [objectId], references: [id], onDelete: Cascade)
  blockId     String?
  block       Block?    @relation(fields: [blockId], references: [id], onDelete: SetNull)
  text        String
  completed   Boolean   @default(false)
  dueDate     DateTime?
  priority    Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  completedAt DateTime?

  @@index([completed, dueDate])
}

model Query {
  id       String @id @default(cuid())
  objectId String
  object   Object @relation(fields: [objectId], references: [id], onDelete: Cascade)
  type     String
  config   Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model AIChat {
  id       String @id @default(cuid())
  objectId String
  object   Object @relation(fields: [objectId], references: [id], onDelete: Cascade)
  messages Json   @default("[]")
  provider String
  model    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 20. API Route Map

### Objects
| Method | Route | Description |
|---|---|---|
| GET | `/api/objects` | List objects (filters, sort, pagination) |
| POST | `/api/objects` | Create object |
| GET | `/api/objects/[id]` | Get object with blocks/props/tags |
| PATCH | `/api/objects/[id]` | Update metadata |
| DELETE | `/api/objects/[id]` | Soft delete |
| POST | `/api/objects/[id]/restore` | Restore deleted |
| POST | `/api/objects/[id]/turn-into` | Change type |
| POST | `/api/objects/[id]/duplicate` | Duplicate |
| PATCH | `/api/objects/[id]/properties` | Update properties |

### Blocks
| Method | Route | Description |
|---|---|---|
| GET | `/api/objects/[id]/blocks` | Get blocks for object |
| POST | `/api/blocks` | Create block |
| PATCH | `/api/blocks/[id]` | Update block |
| DELETE | `/api/blocks/[id]` | Delete block |
| POST | `/api/blocks/reorder` | Batch reorder |
| POST | `/api/blocks/move` | Move between objects |

### Types, Tags, Collections, Search, Daily Notes, Media, Templates, Tasks, AI, Graph, Import/Export, Auth, Settings
*(All follow standard REST CRUD patterns as detailed in sections above)*

---

## Implementation Priority

1. **Foundation** (Phase 1) — Can't do anything without this
2. **Core Object System** (Phase 2) — The heart of the app
3. **Block Editor** (Phase 3) — Writing is the primary activity
4. **Navigation** (Phase 4) — Makes the app usable
5. **Daily Notes** (Phase 5) — Core workflow
6. **Tags & Organization** (Phase 6) — Essential structure
7. **Search & Queries** (Phase 7) — Finding things
8. **Properties** (Phase 10) — Object enrichment
9. **Templates & Layouts** (Phase 11) — Productivity boost
10. **Graph** (Phase 8) — Visual exploration
11. **Media** (Phase 9) — Rich content
12. **Tasks** (Phase 12) — Task management
13. **AI** (Phase 13) — Intelligence layer
14. **Import/Export** (Phase 14) — Data portability
15. **Integrations** (Phase 15) — External connections
16. **Polish & PWA** (Phase 16) — Production readiness

---

## Custom Additions (Beyond Capacities)

Since this is for personal use, these extras differentiate from the original:

- **Ollama integration**: Run AI locally, no API keys needed
- **Full global graph view**: Capacities only has local graph — add a bird's-eye view
- **Vim keybindings**: Optional vim mode in the editor
- **Custom CSS injection**: Personalize look without rebuilding
- **CLI tool**: Terminal-based quick capture and search
- **Git-based backup**: Auto-commit notes to a Git repo
- **RSS feed reader**: Capture articles directly
- **Spaced repetition**: Flashcard review of tagged content
