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
import { db } from "./db";
import { eq, and, sql, desc, asc } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Habit methods
  async getAllHabits(): Promise<Habit[]> {
    return await db.select().from(habits);
  }
  
  async getHabit(id: number): Promise<Habit | undefined> {
    const [habit] = await db.select().from(habits).where(eq(habits.id, id));
    return habit;
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const [habit] = await db.insert(habits).values({
      ...insertHabit,
      userId: null,
      createdAt: new Date().toISOString().split('T')[0]
    }).returning();
    return habit;
  }

  async updateHabit(id: number, updatedHabit: Partial<InsertHabit>): Promise<Habit | undefined> {
    const [updated] = await db
      .update(habits)
      .set(updatedHabit)
      .where(eq(habits.id, id))
      .returning();
    return updated;
  }

  async deleteHabit(id: number): Promise<boolean> {
    // First delete related entries
    await db
      .delete(habitEntries)
      .where(eq(habitEntries.habitId, id));
    
    // Then delete the habit
    const result = await db
      .delete(habits)
      .where(eq(habits.id, id))
      .returning({ id: habits.id });
    
    return result.length > 0;
  }

  // Habit entry methods
  async getHabitEntries(habitId: number): Promise<HabitEntry[]> {
    return await db
      .select()
      .from(habitEntries)
      .where(eq(habitEntries.habitId, habitId))
      .orderBy(asc(habitEntries.date));
  }

  async getHabitEntriesByMonth(habitId: number, year: number, month: number): Promise<HabitEntry[]> {
    const startDate = new Date(year, month, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
    
    return await db
      .select()
      .from(habitEntries)
      .where(
        and(
          eq(habitEntries.habitId, habitId),
          sql`${habitEntries.date} >= ${startDate}`,
          sql`${habitEntries.date} <= ${endDate}`
        )
      )
      .orderBy(asc(habitEntries.date));
  }

  async getHabitEntry(habitId: number, date: Date): Promise<HabitEntry | undefined> {
    const dateStr = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    const [entry] = await db
      .select()
      .from(habitEntries)
      .where(
        and(
          eq(habitEntries.habitId, habitId),
          eq(habitEntries.date, dateStr)
        )
      );
    
    return entry;
  }

  async createHabitEntry(insertEntry: InsertHabitEntry): Promise<HabitEntry> {
    // Check if entry for this date already exists
    const existingEntry = await this.getHabitEntry(
      insertEntry.habitId, 
      new Date(insertEntry.date)
    );
    
    if (existingEntry) {
      // Update existing entry
      return await this.updateHabitEntry(existingEntry.id, {
        completed: insertEntry.completed
      }) as HabitEntry;
    }
    
    // Create new entry
    const [entry] = await db
      .insert(habitEntries)
      .values(insertEntry)
      .returning();
    
    return entry;
  }

  async updateHabitEntry(id: number, updatedEntry: Partial<InsertHabitEntry>): Promise<HabitEntry | undefined> {
    const [updated] = await db
      .update(habitEntries)
      .set(updatedEntry)
      .where(eq(habitEntries.id, id))
      .returning();
    
    return updated;
  }

  // Stats methods
  async getCurrentStreak(habitId: number): Promise<number> {
    const entries = await this.getHabitEntries(habitId);
    if (entries.length === 0) return 0;
    
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
    if (entries.length === 0) return 0;
    
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