import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Bookmarks
  app.get(api.bookmarks.list.path, async (_req, res) => {
    const list = await storage.getBookmarks();
    res.json(list);
  });

  app.post(api.bookmarks.create.path, async (req, res) => {
    try {
      const input = api.bookmarks.create.input.parse(req.body);
      const bookmark = await storage.createBookmark(input);
      res.status(201).json(bookmark);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.bookmarks.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    await storage.deleteBookmark(id);
    res.status(204).send();
  });

  // Memorization
  app.get(api.memorization.list.path, async (_req, res) => {
    const list = await storage.getMemorizationProgress();
    res.json(list);
  });

  app.post(api.memorization.create.path, async (req, res) => {
    try {
      const input = api.memorization.create.input.parse(req.body);
      const goal = await storage.createMemorization(input);
      res.status(201).json(goal);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.memorization.update.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    
    try {
      const input = api.memorization.update.input.parse(req.body);
      const updated = await storage.updateMemorization(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      // If not found, storage throws? No, returns undefined. Handle it.
      // But for now keeping it simple as per storage implementation.
      throw err;
    }
  });

  return httpServer;
}
