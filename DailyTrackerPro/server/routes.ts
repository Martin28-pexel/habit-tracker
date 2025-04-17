import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertHabitSchema, insertHabitEntrySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Habits endpoints
  app.get("/api/habits", async (req: Request, res: Response) => {
    try {
      const habits = await storage.getAllHabits();
      res.json(habits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch habits" });
    }
  });
  
  app.get("/api/habits/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid habit ID" });
    }
    
    const habit = await storage.getHabit(id);
    
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }
    
    return res.json(habit);
  });

  app.post("/api/habits", async (req: Request, res: Response) => {
    try {
      const validatedData = insertHabitSchema.parse(req.body);
      const habit = await storage.createHabit(validatedData);
      res.status(201).json(habit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create habit" });
    }
  });

  app.patch("/api/habits/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid habit ID" });
    }
    
    try {
      // Validate partial data
      const validatedData = insertHabitSchema.partial().parse(req.body);
      
      const updatedHabit = await storage.updateHabit(id, validatedData);
      
      if (!updatedHabit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      res.json(updatedHabit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update habit" });
    }
  });

  app.delete("/api/habits/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid habit ID" });
    }
    
    const deleted = await storage.deleteHabit(id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Habit not found" });
    }
    
    res.status(204).end();
  });

  // Habit Entries endpoints
  app.get("/api/habits/:id/entries", async (req: Request, res: Response) => {
    const habitId = parseInt(req.params.id);
    
    if (isNaN(habitId)) {
      return res.status(400).json({ message: "Invalid habit ID" });
    }
    
    const entries = await storage.getHabitEntries(habitId);
    res.json(entries);
  });

  app.get("/api/habits/:id/entries/month", async (req: Request, res: Response) => {
    const habitId = parseInt(req.params.id);
    const year = parseInt(req.query.year as string || new Date().getFullYear().toString());
    const month = parseInt(req.query.month as string || new Date().getMonth().toString());
    
    if (isNaN(habitId) || isNaN(year) || isNaN(month)) {
      return res.status(400).json({ message: "Invalid parameters" });
    }
    
    const entries = await storage.getHabitEntriesByMonth(habitId, year, month);
    res.json(entries);
  });

  app.post("/api/habits/:id/entries", async (req: Request, res: Response) => {
    const habitId = parseInt(req.params.id);
    
    if (isNaN(habitId)) {
      return res.status(400).json({ message: "Invalid habit ID" });
    }
    
    // Check if habit exists
    const habit = await storage.getHabit(habitId);
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }
    
    try {
      // Add habitId to the request body
      const requestData = { ...req.body, habitId };
      
      // Validate data
      const validatedData = insertHabitEntrySchema.parse(requestData);
      
      const entry = await storage.createHabitEntry(validatedData);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create habit entry" });
    }
  });

  // Stats endpoints
  app.get("/api/habits/:id/stats", async (req: Request, res: Response) => {
    const habitId = parseInt(req.params.id);
    
    if (isNaN(habitId)) {
      return res.status(400).json({ message: "Invalid habit ID" });
    }
    
    // Check if habit exists
    const habit = await storage.getHabit(habitId);
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    const currentStreak = await storage.getCurrentStreak(habitId);
    const longestStreak = await storage.getLongestStreak(habitId);
    const monthlyCompletions = await storage.getMonthlyCompletions(
      habitId,
      currentYear,
      currentMonth
    );
    
    res.json({
      currentStreak,
      longestStreak,
      monthlyCompletions
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
