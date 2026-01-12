import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Download, type InsertDownload } from "@shared/schema";

export function useDownloads() {
  return useQuery({
    queryKey: ["downloads"],
    queryFn: async () => {
      const res = await fetch("/api/downloads");
      if (!res.ok) throw new Error("Failed to fetch downloads");
      return res.json() as Promise<Download[]>;
    },
  });
}

export function useCreateDownload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (download: InsertDownload) => {
      console.log('=== useCreateDownload Debug ===');
      console.log('Creating download:', download);
      const res = await fetch("/api/downloads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(download),
      });
      if (!res.ok) throw new Error("Failed to create download");
      const result = await res.json();
      console.log('Download created successfully:', result);
      console.log('==============================');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["downloads"] });
    },
  });
}

export function useUpdateDownload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Download> }) => {
      const res = await fetch(`/api/downloads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update download");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["downloads"] });
    },
  });
}

export function useDeleteDownload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/downloads/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete download");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["downloads"] });
    },
  });
}

export function useDeleteOneDownload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/downloads/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete download");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["downloads"] });
      queryClient.invalidateQueries({ queryKey: ["surahs"] });
    },
  });
}

export function useDeleteAllDownloads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/downloads/clear", {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to clear downloads");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["downloads"] });
    },
  });
}
