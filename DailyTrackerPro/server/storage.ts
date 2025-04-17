import {
  habits,
  type Habit,
  type InsertHabit,
  habitEntries,
  type HabitEntry,
  type InsertHabitEntry,
  users,
  type User,
  type InsertUser
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Habit methods
  getAllHabits(): Promise<Habit[]>;
  getHabit(id: number): Promise<Habit | undefined>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: number, habit: Partial<InsertHabit>): Promise<Habit | undefined>;
  deleteHabit(id: number): Promise<boolean>;
  
  // Habit entries methods
  getHabitEntries(habitId: number): Promise<HabitEntry[]>;
  getHabitEntriesByMonth(habitId: number, year: number, month: number): Promise<HabitEntry[]>;
  getHabitEntry(habitId: number, date: Date): Promise<HabitEntry | undefined>;
  createHabitEntry(entry: InsertHabitEntry): Promise<HabitEntry>;
  updateHabitEntry(id: number, entry: Partial<InsertHabitEntry>): Promise<HabitEntry | undefined>;

  // Stats methods
  getCurrentStreak(habitId: number): Promise<number>;
  getLongestStreak(habitId: number): Promise<number>;
  getMonthlyCompletions(habitId: number, year: number, month: number): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private habits: Map<number, Habit>;
  private habitEntries: Map<number, HabitEntry>;
  private userIdCounter: number;
  private habitIdCounter: number;
  private entryIdCounter: number;

  constructor() {
    this.users = new Map();
    this.habits = new Map();
    this.habitEntries = new Map();
    this.userIdCounter = 1;
    this.habitIdCounter = 1;
    this.entryIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Habit methods
  async getAllHabits(): Promise<Habit[]> {
    return Array.from(this.habits.values());
  }
  
  async getHabit(id: number): Promise<Habit | undefined> {
    return this.habits.get(id);
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const id = this.habitIdCounter++;
    const createdAt = new Date().toISOString().split('T')[0];
    const habit: Habit = { 
      ...insertHabit, 
      id, 
      createdAt,
      userId: null // Set userId to null since we're not using authentication
    };
    this.habits.set(id, habit);
    return habit;
  }

  async updateHabit(id: number, updatedHabit: Partial<InsertHabit>): Promise<Habit | undefined> {
    const habit = this.habits.get(id);
    if (!habit) return undefined;

    const updated: Habit = { ...habit, ...updatedHabit };
    this.habits.set(id, updated);
    return updated;
  }

  async deleteHabit(id: number): Promise<boolean> {
    // Delete habit
    const deleted = this.habits.delete(id);
    
    // Also delete related entries
    const entriesArray = Array.from(this.habitEntries.values());
    entriesArray.forEach(entry => {
      if (entry.habitId === id) {
        this.habitEntries.delete(entry.id);
      }
    });
    
    return deleted;
  }

  // Habit entry methods
  async getHabitEntries(habitId: number): Promise<HabitEntry[]> {
    return Array.from(this.habitEntries.values())
      .filter(entry => entry.habitId === habitId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getHabitEntriesByMonth(habitId: number, year: number, month: number): Promise<HabitEntry[]> {
    return Array.from(this.habitEntries.values())
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entry.habitId === habitId && 
               entryDate.getFullYear() === year && 
               entryDate.getMonth() === month;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getHabitEntry(habitId: number, date: Date): Promise<HabitEntry | undefined> {
    const dateStr = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    return Array.from(this.habitEntries.values())
      .find(entry => {
        const entryDateStr = new Date(entry.date).toISOString().split('T')[0];
        return entry.habitId === habitId && entryDateStr === dateStr;
      });
  }

  async createHabitEntry(insertEntry: InsertHabitEntry): Promise<HabitEntry> {
    // Check if entry for this date already exists
    const existingEntry = await this.getHabitEntry(insertEntry.habitId, new Date(insertEntry.date));
    
    if (existingEntry) {
      // Update existing entry
      existingEntry.completed = insertEntry.completed;
      this.habitEntries.set(existingEntry.id, existingEntry);
      return existingEntry;
    }
    
    // Create new entry
    const id = this.entryIdCounter++;
    const entry: HabitEntry = { ...insertEntry, id };
    this.habitEntries.set(id, entry);
    return entry;
  }

  async updateHabitEntry(id: number, updatedEntry: Partial<InsertHabitEntry>): Promise<HabitEntry | undefined> {
    const entry = this.habitEntries.get(id);
    if (!entry) return undefined;

    const updated: HabitEntry = { ...entry, ...updatedEntry };
    this.habitEntries.set(id, updated);
    return updated;
  }

  // Stats methods
  async getCurrentStreak(habitId: number): Promise<number> {
    const entries = await this.getHabitEntries(habitId);
    if (!entries.length) return 0;
    
    // Sort entries by date descending (newest first)
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Get today's date (without time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);
    
    // Check if there's an entry for today
    const todayEntry = sortedEntries.find(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });
    
    // If no entry for today or it's not completed, check yesterday
    if (!todayEntry || !todayEntry.completed) {
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    // Count consecutive completed days
    while (true) {
      const dateToCheck = new Date(currentDate).toISOString().split('T')[0];
      
      const entry = sortedEntries.find(e => {
        const entryDate = new Date(e.date).toISOString().split('T')[0];
        return entryDate === dateToCheck;
      });
      
      if (!entry || !entry.completed) break;
      
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
  }

  async getLongestStreak(habitId: number): Promise<number> {
    const entries = await this.getHabitEntries(habitId);
    if (!entries.length) return 0;
    
    // Sort entries by date
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    let longestStreak = 0;
    let currentStreak = 0;
    let previousDate: Date | null = null;
    
    for (const entry of sortedEntries) {
      if (entry.completed) {
        const entryDate = new Date(entry.date);
        
        if (previousDate) {
          const dayDiff = Math.round(
            (entryDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (dayDiff === 1) {
            // Consecutive day
            currentStreak++;
          } else {
            // Gap in days, reset streak
            currentStreak = 1;
          }
        } else {
          // First completed entry
          currentStreak = 1;
        }
        
        previousDate = entryDate;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        // Broke the streak
        currentStreak = 0;
        previousDate = null;
      }
    }
    
    return longestStreak;
  }

  async getMonthlyCompletions(habitId: number, year: number, month: number): Promise<number> {
    const entries = await this.getHabitEntriesByMonth(habitId, year, month);
    return entries.filter(entry => entry.completed).length;
  }
}

// Switch to using DatabaseStorage
import { DatabaseStorage } from "./dbStorage";
export const storage = new DatabaseStorage();
