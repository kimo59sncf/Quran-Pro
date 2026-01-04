import { z } from 'zod';
import { insertBookmarkSchema, insertMemorizationSchema, insertDownloadSchema, bookmarks, memorizationProgress, downloads } from './schema';

export const api = {
  bookmarks: {
    list: {
      method: 'GET' as const,
      path: '/api/bookmarks',
      responses: {
        200: z.array(z.custom<typeof bookmarks.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/bookmarks',
      input: insertBookmarkSchema,
      responses: {
        201: z.custom<typeof bookmarks.$inferSelect>(),
        400: z.object({ message: z.string() }),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/bookmarks/:id',
      input: insertBookmarkSchema.partial(),
      responses: {
        200: z.custom<typeof bookmarks.$inferSelect>(),
        404: z.object({ message: z.string() }),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/bookmarks/:id',
      responses: {
        204: z.void(),
        404: z.object({ message: z.string() }),
      },
    },
  },
  downloads: {
    list: {
      method: 'GET' as const,
      path: '/api/downloads',
      responses: {
        200: z.array(z.custom<typeof downloads.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/downloads',
      input: insertDownloadSchema,
      responses: {
        201: z.custom<typeof downloads.$inferSelect>(),
        400: z.object({ message: z.string() }),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/downloads/:id',
      responses: {
        204: z.void(),
        404: z.object({ message: z.string() }),
      },
    },
  },
  memorization: {
    list: {
      method: 'GET' as const,
      path: '/api/memorization',
      responses: {
        200: z.array(z.custom<typeof memorizationProgress.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/memorization',
      input: insertMemorizationSchema,
      responses: {
        201: z.custom<typeof memorizationProgress.$inferSelect>(),
        400: z.object({ message: z.string() }),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/memorization/:id',
      input: insertMemorizationSchema.partial(),
      responses: {
        200: z.custom<typeof memorizationProgress.$inferSelect>(),
        404: z.object({ message: z.string() }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
