import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import HabitDefinition from '@/components/HabitDefinition';
import HabitTracker from '@/components/HabitTracker';
import ConfirmResetModal from '@/components/ConfirmResetModal';
import Toast from '@/components/Toast';
import { getTodayFormattedDate } from '@/lib/dateUtils';
import type { Habit, HabitEntry, HabitStats } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);
  const [showAddHabitForm, setShowAddHabitForm] = useState(false);
  
  // Fetch all habits
  const { data: habits = [], isLoading: habitsLoading } = useQuery<Habit[]>({
    queryKey: ['/api/habits'],
    retry: false,
    staleTime: 10000,
    gcTime: 60000
  });
  
  // Get selected habit or first habit if available
  const selectedHabit = selectedHabitId 
    ? habits.find((h: Habit) => h.id === selectedHabitId) 
    : (habits.length > 0 ? habits[0] : null);
  
  // Fetch selected habit's entries and stats
  const { data: entries = [], isLoading: entriesLoading } = useQuery<HabitEntry[]>({
    queryKey: ['/api/habits', selectedHabit?.id, 'entries'],
    enabled: !!selectedHabit,
    retry: false
  });
  
  const { data: stats = { currentStreak: 0, longestStreak: 0, monthlyCompletions: 0 }, 
          isLoading: statsLoading } = useQuery<HabitStats>({
    queryKey: ['/api/habits', selectedHabit?.id, 'stats'],
    enabled: !!selectedHabit,
    retry: false
  });
  
  const createHabitMutation = useMutation({
    mutationFn: (newHabit: { name: string; reminderTime: string | null }) => 
      apiRequest('POST', '/api/habits', newHabit),
    onSuccess: async (response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      setSelectedHabitId(data.id);
      setShowAddHabitForm(false);
      showToast('Habit created successfully!');
    }
  });
  
  const updateHabitMutation = useMutation({
    mutationFn: ({ id, habit }: { id: number, habit: { name: string; reminderTime: string | null } }) => 
      apiRequest('PATCH', `/api/habits/${id}`, habit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      showToast('Habit updated successfully!');
    }
  });
  
  const deleteHabitMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/habits/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      showToast('Habit reset successfully!');
      setSelectedHabitId(null);
      setIsModalOpen(false);
    }
  });
  
  const markDayMutation = useMutation({
    mutationFn: ({ habitId, completed }: { habitId: number, completed: boolean }) => 
      apiRequest('POST', `/api/habits/${habitId}/entries`, {
        date: getTodayFormattedDate(),
        completed
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits', variables.habitId, 'entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/habits', variables.habitId, 'stats'] });
      showToast(variables.completed ? 'Habit marked as completed for today!' : 'Habit marked as missed for today!');
    }
  });
  
  const handleSaveHabit = (name: string, reminderTime: string | null) => {
    if (selectedHabit) {
      updateHabitMutation.mutate({ 
        id: selectedHabit.id, 
        habit: { name, reminderTime } 
      });
    } else {
      createHabitMutation.mutate({ name, reminderTime });
    }
  };
  
  const handleResetHabit = () => {
    if (selectedHabit) {
      deleteHabitMutation.mutate(selectedHabit.id);
    }
  };
  
  const handleMarkDay = (completed: boolean) => {
    if (selectedHabit) {
      markDayMutation.mutate({ habitId: selectedHabit.id, completed });
    }
  };
  
  const showToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 3000);
  };
  
  const handleAddNewHabit = () => {
    setShowAddHabitForm(true);
    setSelectedHabitId(null);
  };
  
  const isLoading = habitsLoading || entriesLoading || statsLoading;
  
  return (
    <div className="min-h-screen max-w-md mx-auto flex flex-col bg-background text-foreground">
      <header className="bg-primary text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Habit Tracker</h1>
          {selectedHabit && (
            <button
              className="p-2 rounded-full hover:bg-white/10"
              onClick={() => setIsModalOpen(true)}
              aria-label="Settings"
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
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          )}
        </div>
      </header>
      
      <main className="flex-1 p-4">
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : showAddHabitForm || (!selectedHabit && habits.length === 0) ? (
          <div>
            <HabitDefinition onSaveHabit={handleSaveHabit} />
            
            {habits.length > 0 && (
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setShowAddHabitForm(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        ) : selectedHabit ? (
          <>
            {/* Habit Selection */}
            {habits.length > 1 && (
              <Card className="mb-4">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-medium">Your Habits</h2>
                    <div className="flex flex-wrap gap-2">
                      {habits.map(habit => (
                        <Button
                          key={habit.id}
                          variant={habit.id === selectedHabit.id ? "default" : "outline"}
                          onClick={() => setSelectedHabitId(habit.id)}
                          className="text-sm"
                        >
                          {habit.name}
                        </Button>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      className="mt-2" 
                      onClick={handleAddNewHabit}
                    >
                      + Add Another Habit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <HabitTracker
              habit={selectedHabit}
              entries={entries}
              stats={stats || { currentStreak: 0, longestStreak: 0, monthlyCompletions: 0 }}
              onMarkDay={handleMarkDay}
              onEditHabit={() => {
                updateHabitMutation.mutate({ 
                  id: selectedHabit.id, 
                  habit: { 
                    name: selectedHabit.name, 
                    reminderTime: selectedHabit.reminderTime 
                  } 
                });
              }}
            />
            
            {habits.length === 1 && (
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleAddNewHabit}
                >
                  + Add Another Habit
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground mb-4">No habits found</p>
            <Button onClick={handleAddNewHabit}>Create Your First Habit</Button>
          </div>
        )}
      </main>
      
      <ConfirmResetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleResetHabit}
      />
      
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
