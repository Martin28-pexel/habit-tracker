import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  getCalendarDays, 
  formatMonthYear, 
  nextMonth, 
  previousMonth 
} from '@/lib/dateUtils';
import type { HabitEntry, CalendarDay } from '@/types';

interface CalendarProps {
  entries: HabitEntry[];
  currentDate: Date;
  onChangeMonth: (date: Date) => void;
}

export default function Calendar({ entries, currentDate, onChangeMonth }: CalendarProps) {
  const calendarDays = getCalendarDays(currentDate, entries);
  
  const handlePreviousMonth = () => {
    onChangeMonth(previousMonth(currentDate));
  };
  
  const handleNextMonth = () => {
    onChangeMonth(nextMonth(currentDate));
  };
  
  return (
    <div className="mb-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handlePreviousMonth}
              aria-label="Previous month"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </Button>
            <h3 className="font-semibold text-lg">{formatMonthYear(currentDate)}</h3>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleNextMonth}
              aria-label="Next month"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </Button>
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 text-center mb-2">
            {/* Weekday Headers */}
            <div className="text-muted-foreground text-sm font-medium">S</div>
            <div className="text-muted-foreground text-sm font-medium">M</div>
            <div className="text-muted-foreground text-sm font-medium">T</div>
            <div className="text-muted-foreground text-sm font-medium">W</div>
            <div className="text-muted-foreground text-sm font-medium">T</div>
            <div className="text-muted-foreground text-sm font-medium">F</div>
            <div className="text-muted-foreground text-sm font-medium">S</div>
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <CalendarDayCell key={index} day={day} />
            ))}
          </div>
          
          <div className="mt-4 flex justify-center space-x-6 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-[#10B981] rounded-full mr-1"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-[#FB7185] rounded-full mr-1"></div>
              <span>Missed</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface CalendarDayCellProps {
  day: CalendarDay;
}

function CalendarDayCell({ day }: CalendarDayCellProps) {
  const { dayNumber, isCurrentMonth, isToday, status } = day;
  
  const getClassNames = () => {
    const baseClass = "aspect-w-1 aspect-h-1 flex items-center justify-center rounded-md";
    
    if (!isCurrentMonth) {
      return `${baseClass} text-muted-foreground`;
    }
    
    if (status === 'completed') {
      return `${baseClass} bg-[#10B981] text-white`;
    }
    
    if (status === 'missed') {
      return `${baseClass} bg-[#FB7185] text-white`;
    }
    
    if (isToday) {
      return `${baseClass} border-2 border-primary`;
    }
    
    return `${baseClass} border border-border`;
  };
  
  // Status indicator icon
  const renderStatusIcon = () => {
    if (status === 'completed') {
      return (
        <span className="absolute top-0.5 right-0.5 text-white font-bold text-xs">
          ✓
        </span>
      );
    }
    if (status === 'missed') {
      return (
        <span className="absolute top-0.5 right-0.5 text-white font-bold text-xs">
          ✗
        </span>
      );
    }
    return null;
  };
  
  return (
    <div className="relative" style={{ aspectRatio: '1/1' }}>
      <div className={getClassNames()}>
        <span className="absolute inset-0 flex items-center justify-center">
          {dayNumber}
        </span>
        {renderStatusIcon()}
      </div>
    </div>
  );
}
