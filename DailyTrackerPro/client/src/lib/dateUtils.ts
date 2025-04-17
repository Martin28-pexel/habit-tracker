import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, addDays, isSameMonth, isToday, isSameDay } from 'date-fns';
import type { HabitEntry, CalendarDay } from '@/types';

export const formatTime = (time: string | null): string => {
  if (!time) return '';
  
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  
  return `${hour12}:${minutes} ${ampm}`;
};

export const formatCurrentDate = (date: Date): string => {
  return format(date, 'MMMM d, yyyy');
};

export const formatMonthYear = (date: Date): string => {
  return format(date, 'MMMM yyyy');
};

export const getCalendarDays = (date: Date, entries: HabitEntry[]): CalendarDay[] => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const startDate = startOfWeek(monthStart);
  
  const days: CalendarDay[] = [];
  let currentDate = startDate;
  
  // Generate 42 days (6 weeks) to ensure we cover the month
  for (let i = 0; i < 42; i++) {
    const formattedDate = format(currentDate, 'yyyy-MM-dd');
    const entry = entries.find(e => {
      const entryDate = new Date(e.date);
      return isSameDay(entryDate, currentDate);
    });
    
    let status: 'completed' | 'missed' | 'pending' | 'future' = 'pending';
    
    if (entry) {
      status = entry.completed ? 'completed' : 'missed';
    } else {
      const today = new Date();
      if (currentDate > today) {
        status = 'future';
      }
    }
    
    days.push({
      date: new Date(currentDate),
      dayNumber: currentDate.getDate(),
      isCurrentMonth: isSameMonth(currentDate, date),
      isToday: isToday(currentDate),
      status
    });
    
    currentDate = addDays(currentDate, 1);
    
    // If we've gone past the end of the month and completed a week, stop
    if (currentDate > monthEnd && days.length % 7 === 0) {
      break;
    }
  }
  
  return days;
};

export const nextMonth = (date: Date): Date => {
  return addMonths(date, 1);
};

export const previousMonth = (date: Date): Date => {
  return subMonths(date, 1);
};

export const getTodayFormattedDate = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};
