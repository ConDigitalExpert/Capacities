'use client';

import { useState } from 'react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, isSameMonth, isToday, startOfWeek, endOfWeek,
} from 'date-fns';
import { CapacityObject } from '../../lib/types';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface Props {
  objects: CapacityObject[];
  onSelect: (id: string) => void;
  onCreate: (date: string) => void;
}

export default function CalendarView({ objects, onSelect, onCreate }: Props) {
  const [current, setCurrent] = useState(new Date());

  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const dailyMap = new Map<string, CapacityObject>();
  for (const obj of objects) {
    if (obj.type === 'daily' && obj.date) {
      dailyMap.set(obj.date, obj);
    }
  }

  const prev = () => setCurrent((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const next = () => setCurrent((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const goToday = () => setCurrent(new Date());

  return (
    <div className="flex flex-col h-full p-6 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-white text-lg font-semibold">
          {format(current, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={goToday}
            className="text-xs text-white/50 hover:text-white border border-white/10 rounded px-2 py-1 transition-colors"
          >
            Today
          </button>
          <button onClick={prev} className="text-white/40 hover:text-white transition-colors p-1">
            <ChevronLeft size={16} />
          </button>
          <button onClick={next} className="text-white/40 hover:text-white transition-colors p-1">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="text-center text-xs text-white/30 uppercase tracking-widest py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1 flex-1">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const note = dailyMap.get(key);
          const today = isToday(day);
          const inMonth = isSameMonth(day, current);

          return (
            <div
              key={key}
              className={`relative rounded-lg min-h-[80px] p-2 flex flex-col transition-colors border ${
                today
                  ? 'border-violet-500/60 bg-violet-600/10'
                  : inMonth
                  ? 'border-white/5 bg-white/3 hover:bg-white/5'
                  : 'border-transparent'
              }`}
            >
              <span
                className={`text-xs font-medium ${
                  today
                    ? 'text-violet-300'
                    : inMonth
                    ? 'text-white/70'
                    : 'text-white/20'
                }`}
              >
                {format(day, 'd')}
              </span>

              {note ? (
                <button
                  onClick={() => onSelect(note.id)}
                  className="mt-1 text-left text-xs bg-violet-600/30 hover:bg-violet-600/50 text-violet-200 rounded px-1.5 py-0.5 truncate transition-colors"
                >
                  {note.title.replace(/Daily Note – /, '') || 'Daily Note'}
                </button>
              ) : inMonth ? (
                <button
                  onClick={() => onCreate(key)}
                  className="mt-1 opacity-0 hover:opacity-100 group-hover:opacity-100 text-xs text-white/30 hover:text-white/60 flex items-center gap-0.5 transition-opacity"
                >
                  <Plus size={10} /> Note
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="text-white/30 text-xs text-center">
        {dailyMap.size} daily notes this month
      </div>
    </div>
  );
}
