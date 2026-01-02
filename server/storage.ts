import { db } from "./db";
import {
  bookmarks,
  memorizationProgress,
  type InsertBookmark,
  type InsertMemorization,
  type Bookmark,
  type Memorization
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Bookmarks
  getBookmarks(): Promise<Bookmark[]>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  deleteBookmark(id: number): Promise<void>;

  // Memorization
  getMemorizationProgress(): Promise<Memorization[]>;
  createMemorization(goal: InsertMemorization): Promise<Memorization>;
  updateMemorization(id: number, updates: Partial<InsertMemorization>): Promise<Memorization>;
}

export class DatabaseStorage implements IStorage {
  async getBookmarks(): Promise<Bookmark[]> {
    return await db.select().from(bookmarks).orderBy(desc(bookmarks.createdAt));
  }

  async createBookmark(bookmark: InsertBookmark): Promise<Bookmark> {
    const [newBookmark] = await db.insert(bookmarks).values(bookmark).returning();
    return newBookmark;
  }

  async deleteBookmark(id: number): Promise<void> {
    await db.delete(bookmarks).where(eq(bookmarks.id, id));
  }

  async getMemorizationProgress(): Promise<Memorization[]> {
    return await db.select().from(memorizationProgress).orderBy(desc(memorizationProgress.lastPracticed));
  }

  async createMemorization(goal: InsertMemorization): Promise<Memorization> {
    const [newGoal] = await db.insert(memorizationProgress).values(goal).returning();
    return newGoal;
  }

  async updateMemorization(id: number, updates: Partial<InsertMemorization>): Promise<Memorization> {
    const [updated] = await db
      .update(memorizationProgress)
      .set({ ...updates, lastPracticed: new Date() })
      .where(eq(memorizationProgress.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
