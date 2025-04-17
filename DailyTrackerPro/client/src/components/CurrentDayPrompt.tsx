import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrentDate } from '@/lib/dateUtils';

interface CurrentDayPromptProps {
  onMarkComplete: () => void;
  onMarkIncomplete: () => void;
}

export default function CurrentDayPrompt({
  onMarkComplete,
  onMarkIncomplete
}: CurrentDayPromptProps) {
  const today = new Date();
  
  return (
    <div className="mb-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="font-medium mb-4">Today, {formatCurrentDate(today)}</h3>
          <p className="text-lg mb-5 font-medium">Did you complete your habit today?</p>
          
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-[#10B981] hover:bg-[#10B981]/90 text-white py-6 font-medium"
              onClick={onMarkComplete}
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
                className="mr-1"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Yes
            </Button>
            <Button
              className="flex-1 bg-[#FB7185] hover:bg-[#FB7185]/90 text-white py-6 font-medium"
              onClick={onMarkIncomplete}
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
                className="mr-1"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              No
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
