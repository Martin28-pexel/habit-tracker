import { useState } from 'react';
import HabitHeader from './HabitHeader';
import CurrentDayPrompt from './CurrentDayPrompt';
import StreaksSummary from './StreaksSummary';
import Calendar from './Calendar';
import type { Habit, HabitEntry, HabitStats } from '@/types';

interface HabitTrackerProps {
  habit: Habit;
  entries: HabitEntry[];
  stats: HabitStats;
  onMarkDay: (completed: boolean) => void;
  onEditHabit: () => void;
}

export default function HabitTracker({
  habit,
  entries,
  stats,
  onMarkDay,
  onEditHabit
}: HabitTrackerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  return (
    <div className="pt-2 pb-8">
      <HabitHeader 
        habit={habit} 
        onEdit={onEditHabit} 
      />
      
      <CurrentDayPrompt 
        onMarkComplete={() => onMarkDay(true)} 
        onMarkIncomplete={() => onMarkDay(false)} 
      />
      
      <StreaksSummary stats={stats} />
      
      <Calendar 
        entries={entries} 
        currentDate={currentDate}
        onChangeMonth={setCurrentDate}
      />
    </div>
  );
}
