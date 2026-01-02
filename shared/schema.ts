import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  surahNumber: integer("surah_number").notNull(),
  ayahNumber: integer("ayah_number").notNull(),
  type: text("type").notNull(), // 'read' or 'audio'
  seconds: integer("seconds").default(0), // for audio resume
  createdAt: timestamp("created_at").defaultNow(),
});

export const memorizationProgress = pgTable("memorization_progress", {
  id: serial("id").primaryKey(),
  surahNumber: integer("surah_number").notNull(),
  startAyah: integer("start_ayah").notNull(),
  endAyah: integer("end_ayah").notNull(),
  status: text("status").notNull(), // 'in_progress', 'completed'
  masteryLevel: integer("mastery_level").default(0), // 0-100
  lastPracticed: timestamp("last_practiced").defaultNow(),
});

export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({ id: true, createdAt: true });
export const insertMemorizationSchema = createInsertSchema(memorizationProgress).omit({ id: true, lastPracticed: true });

export type Bookmark = typeof bookmarks.$inferSelect;
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;

export type Memorization = typeof memorizationProgress.$inferSelect;
export type InsertMemorization = z.infer<typeof insertMemorizationSchema>;
