import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface HabitDefinitionProps {
  onSaveHabit: (name: string, reminderTime: string | null) => void;
}

export default function HabitDefinition({ onSaveHabit }: HabitDefinitionProps) {
  const [habitName, setHabitName] = useState('');
  const [reminderTime, setReminderTime] = useState<string | null>(null);
  const [validationError, setValidationError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!habitName.trim()) {
      setValidationError('Please enter a habit description');
      return;
    }
    
    if (habitName.length > 50) {
      setValidationError('Habit description must be 50 characters or less');
      return;
    }
    
    onSaveHabit(habitName, reminderTime);
  };
  
  return (
    <div className="py-8">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Define Your Habit</h2>
          <p className="text-muted-foreground mb-6">
            Define a single task or habit you want to track daily. Be specific to help you stay consistent.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label htmlFor="habitInput" className="block text-sm font-medium mb-1">
                What habit do you want to track?
              </Label>
              <Input
                id="habitInput"
                type="text"
                value={habitName}
                onChange={(e) => {
                  setHabitName(e.target.value);
                  setValidationError('');
                }}
                placeholder="E.g., Exercise for 30 minutes"
                maxLength={50}
                className="w-full p-3"
                required
              />
              <div className="text-xs text-muted-foreground mt-1">50 characters maximum</div>
              {validationError && <div className="text-sm text-destructive mt-1">{validationError}</div>}
            </div>
            
            <div className="mb-6">
              <Label htmlFor="reminderTime" className="block text-sm font-medium mb-1">
                Daily reminder (optional)
              </Label>
              <Input
                id="reminderTime"
                type="time"
                value={reminderTime || ''}
                onChange={(e) => setReminderTime(e.target.value || null)}
                className="w-full p-3"
              />
              <div className="text-xs text-muted-foreground mt-1">We'll send you a reminder at this time</div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-primary text-white py-6 font-medium"
            >
              Start Tracking
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
