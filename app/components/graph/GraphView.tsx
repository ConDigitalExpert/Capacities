'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { CapacityObject } from '../../lib/types';

interface Node {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  obj: CapacityObject;
}

interface Edge {
  source: string;
  target: string;
}

const TYPE_COLORS: Record<string, string> = {
  note: '#60a5fa',
  daily: '#fbbf24',
  person: '#34d399',
  book: '#a78bfa',
  article: '#22d3ee',
  media: '#f472b6',
  tag: '#9ca3af',
};

interface Props {
  objects: CapacityObject[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function GraphView({ objects, selectedId, onSelect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const rafRef = useRef<number>(0);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const hoveredRef = useRef<string | null>(null);
  const [dims, setDims] = useState({ w: 800, h: 600 });

  // Build graph data from objects
  useEffect(() => {
    const existing = new Map(nodesRef.current.map((n) => [n.id, n]));
    nodesRef.current = objects.map((obj) => {
      const ex = existing.get(obj.id);
      return ex
        ? { ...ex, obj }
        : {
            id: obj.id,
            x: dims.w / 2 + (Math.random() - 0.5) * 300,
            y: dims.h / 2 + (Math.random() - 0.5) * 300,
            vx: 0,
            vy: 0,
            obj,
          };
    });

    const edges: Edge[] = [];
    for (const obj of objects) {
      for (const linkedId of obj.linkedIds) {
        if (
          objects.find((o) => o.id === linkedId) &&
          !edges.find(
            (e) =>
              (e.source === obj.id && e.target === linkedId) ||
              (e.source === linkedId && e.target === obj.id),
          )
        ) {
          edges.push({ source: obj.id, target: linkedId });
        }
      }
    }
    edgesRef.current = edges;
  }, [objects, dims]);

  // Resize observer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const { width, height } = e.contentRect;
        setDims({ w: width, h: height });
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
    });
    ro.observe(canvas.parentElement!);
    return () => ro.disconnect();
  }, []);

  // Force simulation + render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio;

    function tick() {
      const nodes = nodesRef.current;
      const edges = edgesRef.current;
      const cx = dims.w / 2;
      const cy = dims.h / 2;

      // Forces
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        if (dragRef.current?.id === a.id) continue;

        // Center gravity
        a.vx += (cx - a.x) * 0.002;
        a.vy += (cy - a.y) * 0.002;

        // Repulsion between all nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist2 = dx * dx + dy * dy + 1;
          const force = 4000 / dist2;
          a.vx += dx * force;
          a.vy += dy * force;
          b.vx -= dx * force;
          b.vy -= dy * force;
        }
      }

      // Spring attraction for edges
      const nodeMap = new Map(nodes.map((n) => [n.id, n]));
      for (const edge of edges) {
        const s = nodeMap.get(edge.source);
        const t = nodeMap.get(edge.target);
        if (!s || !t) continue;
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.01;
        const target = 150;
        const force = (dist - target) * 0.04;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        if (dragRef.current?.id !== s.id) { s.vx += fx; s.vy += fy; }
        if (dragRef.current?.id !== t.id) { t.vx -= fx; t.vy -= fy; }
      }

      // Integrate + damp
      for (const n of nodes) {
        if (dragRef.current?.id === n.id) continue;
        n.vx *= 0.8;
        n.vy *= 0.8;
        n.x += n.vx;
        n.y += n.vy;
        // Clamp to canvas
        const pad = 40;
        n.x = Math.max(pad, Math.min(dims.w - pad, n.x));
        n.y = Math.max(pad, Math.min(dims.h - pad, n.y));
      }

      // ── Render ──────────────────────────────────────────────────────────────
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, dims.w, dims.h);

      // Edges
      for (const edge of edges) {
        const s = nodeMap.get(edge.source);
        const t = nodeMap.get(edge.target);
        if (!s || !t) continue;
        const isHighlighted =
          s.id === selectedId || t.id === selectedId || s.id === hoveredRef.current || t.id === hoveredRef.current;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.strokeStyle = isHighlighted ? 'rgba(139,92,246,0.7)' : 'rgba(255,255,255,0.12)';
        ctx.lineWidth = isHighlighted ? 2 : 1;
        ctx.stroke();
      }

      // Nodes
      for (const n of nodes) {
        const isSelected = n.id === selectedId;
        const isHovered = n.id === hoveredRef.current;
        const color = TYPE_COLORS[n.obj.type] ?? '#9ca3af';
        const r = isSelected ? 16 : isHovered ? 13 : 10;

        // Glow for selected
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, r + 6, 0, Math.PI * 2);
          ctx.fillStyle = color + '30';
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? color : color + 'cc';
        ctx.fill();
        ctx.strokeStyle = isSelected ? 'white' : 'rgba(255,255,255,0.3)';
        ctx.lineWidth = isSelected ? 2.5 : 1;
        ctx.stroke();

        // Label
        const fontSize = isSelected ? 12 : 11;
        ctx.font = `${isSelected ? 600 : 400} ${fontSize}px system-ui, sans-serif`;
        ctx.fillStyle = isSelected ? 'white' : 'rgba(255,255,255,0.75)';
        ctx.textAlign = 'center';
        ctx.fillText(
          n.obj.title.length > 18 ? n.obj.title.slice(0, 16) + '…' : n.obj.title,
          n.x,
          n.y + r + 14,
        );
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [dims, selectedId]);

  // Mouse interaction
  const getNodeAt = useCallback((x: number, y: number): Node | null => {
    for (const n of nodesRef.current) {
      const dx = n.x - x;
      const dy = n.y - y;
      if (dx * dx + dy * dy < 20 * 20) return n;
    }
    return null;
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (dragRef.current) {
        const node = nodesRef.current.find((n) => n.id === dragRef.current!.id);
        if (node) {
          node.x = x + dragRef.current.offsetX;
          node.y = y + dragRef.current.offsetY;
          node.vx = 0;
          node.vy = 0;
        }
        return;
      }

      const node = getNodeAt(x, y);
      hoveredRef.current = node?.id ?? null;
      canvasRef.current!.style.cursor = node ? 'pointer' : 'default';
    },
    [getNodeAt],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const node = getNodeAt(x, y);
      if (node) {
        dragRef.current = { id: node.id, offsetX: node.x - x, offsetY: node.y - y };
      }
    },
    [getNodeAt],
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (dragRef.current) {
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const wasDragging =
          Math.abs(nodesRef.current.find((n) => n.id === dragRef.current!.id)!.x - (x + dragRef.current.offsetX)) > 5 ||
          Math.abs(nodesRef.current.find((n) => n.id === dragRef.current!.id)!.y - (y + dragRef.current.offsetY)) > 5;
        dragRef.current = null;
        if (!wasDragging) {
          const node = getNodeAt(x, y);
          if (node) onSelect(node.id);
        }
      }
    },
    [getNodeAt, onSelect],
  );

  return (
    <div className="relative w-full h-full bg-[#0a0a18]">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { hoveredRef.current = null; dragRef.current = null; }}
      />
      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <span key={type} className="flex items-center gap-1 text-xs text-white/50">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: color }} />
            {type}
          </span>
        ))}
      </div>
      {/* Stats */}
      <div className="absolute top-4 right-4 text-white/20 text-xs">
        {objects.length} objects · {edgesRef.current.length} links
      </div>
    </div>
  );
}
