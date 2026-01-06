import { db } from "./db";
import {
  bookmarks,
  memorizationProgress,
  downloads,
  type InsertBookmark,
  type InsertMemorization,
  type InsertDownload,
  type Bookmark,
  type Memorization,
  type Download
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Bookmarks
  getBookmarks(): Promise<Bookmark[]>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  updateBookmark(id: number, updates: Partial<InsertBookmark>): Promise<Bookmark>;
  deleteBookmark(id: number): Promise<void>;

  // Downloads
  getDownloads(): Promise<Download[]>;
  createDownload(download: InsertDownload): Promise<Download>;
  deleteDownload(id: number): Promise<void>;

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

  async updateBookmark(id: number, updates: Partial<InsertBookmark>): Promise<Bookmark> {
    const [updated] = await db
      .update(bookmarks)
      .set(updates)
      .where(eq(bookmarks.id, id))
      .returning();
    return updated;
  }

  async deleteBookmark(id: number): Promise<void> {
    await db.delete(bookmarks).where(eq(bookmarks.id, id));
  }

  async getDownloads(): Promise<Download[]> {
    return await db.select().from(downloads).orderBy(desc(downloads.createdAt));
  }

  async createDownload(download: InsertDownload): Promise<Download> {
    const [newDownload] = await db.insert(downloads).values(download).returning();
    return newDownload;
  }

  async deleteDownload(id: number): Promise<void> {
    await db.delete(downloads).where(eq(downloads.id, id));
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

class MemoryStorage implements IStorage {
  private bookmarks: Bookmark[] = [];
  private downloads: Download[] = [];
  private memorizations: Memorization[] = [];
  private nextBookmarkId = 1;
  private nextDownloadId = 1;
  private nextMemorizationId = 1;

  async getBookmarks(): Promise<Bookmark[]> {
    return [...this.bookmarks].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async createBookmark(bookmark: InsertBookmark): Promise<Bookmark> {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: this.nextBookmarkId++,
      createdAt: new Date(),
      seconds: bookmark.seconds ?? null,
      isFavorite: bookmark.isFavorite ?? null,
      reciterId: bookmark.reciterId ?? null,
    };
    this.bookmarks.push(newBookmark);
    return newBookmark;
  }

  async updateBookmark(id: number, updates: Partial<InsertBookmark>): Promise<Bookmark> {
    const index = this.bookmarks.findIndex(b => b.id === id);
    if (index === -1) throw new Error("Bookmark not found");
    this.bookmarks[index] = { ...this.bookmarks[index], ...updates };
    return this.bookmarks[index];
  }

  async deleteBookmark(id: number): Promise<void> {
    this.bookmarks = this.bookmarks.filter(b => b.id !== id);
  }

  async getDownloads(): Promise<Download[]> {
    return [...this.downloads].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async createDownload(download: InsertDownload): Promise<Download> {
    const newDownload: Download = {
      ...download,
      id: this.nextDownloadId++,
      createdAt: new Date(),
    };
    this.downloads.push(newDownload);
    return newDownload;
  }

  async deleteDownload(id: number): Promise<void> {
    this.downloads = this.downloads.filter(d => d.id !== id);
  }

  async getMemorizationProgress(): Promise<Memorization[]> {
    return [...this.memorizations].sort((a, b) => new Date(b.lastPracticed || 0).getTime() - new Date(a.lastPracticed || 0).getTime());
  }

  async createMemorization(goal: InsertMemorization): Promise<Memorization> {
    const newGoal: Memorization = {
      ...goal,
      id: this.nextMemorizationId++,
      lastPracticed: new Date(),
      masteryLevel: goal.masteryLevel ?? null,
    };
    this.memorizations.push(newGoal);
    return newGoal;
  }

  async updateMemorization(id: number, updates: Partial<InsertMemorization>): Promise<Memorization> {
    const index = this.memorizations.findIndex(m => m.id === id);
    if (index === -1) throw new Error("Memorization not found");
    this.memorizations[index] = { ...this.memorizations[index], ...updates, lastPracticed: new Date() };
    return this.memorizations[index];
  }
}

export const storage = new MemoryStorage(); // Always use memory storage for development
