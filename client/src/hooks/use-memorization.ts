import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertMemorization } from "@shared/schema";
import { useToast } from "./use-toast";

export function useMemorizationProgress() {
  return useQuery({
    queryKey: [api.memorization.list.path],
    queryFn: async () => {
      const res = await fetch(api.memorization.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch progress");
      return api.memorization.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertMemorization) => {
      const validated = api.memorization.create.input.parse(data);
      const res = await fetch(api.memorization.create.path, {
        method: api.memorization.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to create goal");
      return api.memorization.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.memorization.list.path] });
      toast({
        title: "Goal Created",
        description: "May Allah make it easy for you.",
      });
    },
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertMemorization>) => {
      const validated = api.memorization.update.input.parse(updates);
      const url = buildUrl(api.memorization.update.path, { id });
      
      const res = await fetch(url, {
        method: api.memorization.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update progress");
      return api.memorization.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.memorization.list.path] });
      toast({
        title: "Progress Updated",
        description: "Keep going!",
      });
    },
  });
}
