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
      const res = await fetch("/api/downloads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(download),
      });
      if (!res.ok) throw new Error("Failed to create download");
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
