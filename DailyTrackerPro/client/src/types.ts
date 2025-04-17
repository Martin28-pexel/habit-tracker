export interface Habit {
  id: number;
  name: string;
  reminderTime: string | null;
  createdAt: string;
}

export interface HabitEntry {
  id: number;
  habitId: number;
  date: string;
  completed: boolean;
}

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  monthlyCompletions: number;
}

export interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  status: 'completed' | 'missed' | 'pending' | 'future';
}
