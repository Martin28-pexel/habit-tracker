import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/dateUtils';
import type { Habit } from '@/types';

interface HabitHeaderProps {
  habit: Habit;
  onEdit: () => void;
}

export default function HabitHeader({ habit, onEdit }: HabitHeaderProps) {
  return (
    <div className="mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{habit.name}</h2>
              {habit.reminderTime && (
                <p className="text-sm text-muted-foreground">
                  <span className="inline-flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-1"
                    >
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    Reminder: {formatTime(habit.reminderTime)}
                  </span>
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              aria-label="Edit habit"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground"
              >
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
