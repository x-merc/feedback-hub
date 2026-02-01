'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function DatePicker({ selectedDate, onDateChange }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(viewDate);

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    const next = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    if (next <= new Date()) {
      setViewDate(next);
    }
  };

  const selectDate = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (newDate <= new Date()) {
      onDateChange(newDate);
      setIsOpen(false);
    }
  };

  const goToToday = () => {
    const today = new Date();
    onDateChange(today);
    setViewDate(today);
    setIsOpen(false);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      viewDate.getFullYear() === today.getFullYear() &&
      viewDate.getMonth() === today.getMonth() &&
      day === today.getDate()
    );
  };

  const isSelected = (day: number) => {
    return (
      viewDate.getFullYear() === selectedDate.getFullYear() &&
      viewDate.getMonth() === selectedDate.getMonth() &&
      day === selectedDate.getDate()
    );
  };

  const isFuture = (day: number) => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    return date > new Date();
  };

  const formatDisplayDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  const canGoNext = () => {
    const next = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    return next <= new Date();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors',
          isOpen
            ? 'bg-orange-500/20 border-orange-500 text-orange-400'
            : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600'
        )}
      >
        <Calendar className="w-4 h-4" />
        <span className="text-sm font-medium">{formatDisplayDate(selectedDate)}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-4 w-72">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="p-1 hover:bg-zinc-800 rounded transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-zinc-400" />
            </button>
            <span className="text-sm font-medium text-zinc-200">
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              onClick={nextMonth}
              disabled={!canGoNext()}
              className={cn(
                'p-1 rounded transition-colors',
                canGoNext() ? 'hover:bg-zinc-800' : 'opacity-30 cursor-not-allowed'
              )}
            >
              <ChevronRight className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(day => (
              <div key={day} className="text-center text-xs text-zinc-500 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before the first of the month */}
            {Array.from({ length: startingDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}
            
            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const future = isFuture(day);
              const selected = isSelected(day);
              const today = isToday(day);
              
              return (
                <button
                  key={day}
                  onClick={() => selectDate(day)}
                  disabled={future}
                  className={cn(
                    'h-8 rounded text-sm transition-colors',
                    future && 'opacity-30 cursor-not-allowed',
                    selected && 'bg-orange-500 text-white',
                    !selected && today && 'bg-zinc-700 text-zinc-100',
                    !selected && !today && !future && 'hover:bg-zinc-800 text-zinc-300'
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-zinc-700 flex justify-between">
            <button
              onClick={goToToday}
              className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
            >
              Go to Today
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
