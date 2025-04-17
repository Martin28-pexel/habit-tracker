import type { HabitStats } from '@/types';

interface StreaksSummaryProps {
  stats: HabitStats;
}

export default function StreaksSummary({ stats }: StreaksSummaryProps) {
  const { currentStreak, longestStreak, monthlyCompletions } = stats;
  
  return (
    <div className="mb-6">
      <div className="bg-gradient-to-r from-primary to-[#10B981] text-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center">
          <div className="text-center">
            <p className="text-sm font-medium">Current Streak</p>
            <p className="text-3xl font-bold">{currentStreak}</p>
            <p className="text-xs">days</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Longest Streak</p>
            <p className="text-3xl font-bold">{longestStreak}</p>
            <p className="text-xs">days</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">This Month</p>
            <p className="text-3xl font-bold">{monthlyCompletions}</p>
            <p className="text-xs">days</p>
          </div>
        </div>
      </div>
    </div>
  );
}
