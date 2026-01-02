import { useMemorizationProgress, useCreateGoal, useUpdateProgress } from "@/hooks/use-memorization";
import { useSurahs } from "@/hooks/use-quran";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMemorizationSchema } from "@shared/schema";
import { Loader2, Plus, Trophy, Target } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

// Schema for the form needs numeric coercion for form inputs
const formSchema = insertMemorizationSchema.extend({
  surahNumber: z.coerce.number(),
  startAyah: z.coerce.number(),
  endAyah: z.coerce.number(),
});

export default function Memorize() {
  const { data: progressList, isLoading } = useMemorizationProgress();
  const { data: surahs } = useSurahs();
  const { mutate: createGoal, isPending: isCreating } = useCreateGoal();
  const { mutate: updateProgress } = useUpdateProgress();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "in_progress",
      masteryLevel: 0,
      startAyah: 1,
      endAyah: 10,
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createGoal(data, {
      onSuccess: () => {
        setIsOpen(false);
        form.reset();
      }
    });
  };

  const getSurahName = (num: number) => {
    return surahs?.find(s => s.number === num)?.englishName || `Surah ${num}`;
  };

  const handleIncrementMastery = (item: any) => {
    const newLevel = Math.min(100, (item.masteryLevel || 0) + 10);
    updateProgress({
      id: item.id,
      masteryLevel: newLevel,
      status: newLevel === 100 ? "completed" : "in_progress"
    });
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold font-display text-primary">Memorization</h1>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set Memorization Goal</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="surahNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Surah</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Surah" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {surahs?.map((s) => (
                              <SelectItem key={s.number} value={String(s.number)}>
                                {s.number}. {s.englishName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startAyah"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Ayah</FormLabel>
                          <Input type="number" {...field} />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endAyah"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Ayah</FormLabel>
                          <Input type="number" {...field} />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Goal"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-primary/20 to-card border-none">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Trophy className="w-8 h-8 text-primary mb-2" />
              <div className="text-2xl font-bold">{progressList?.filter(p => p.status === 'completed').length || 0}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-secondary/20 to-card border-none">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Target className="w-8 h-8 text-secondary mb-2" />
              <div className="text-2xl font-bold">{progressList?.filter(p => p.status === 'in_progress').length || 0}</div>
              <div className="text-xs text-muted-foreground">In Progress</div>
            </CardContent>
          </Card>
        </div>

        {/* Goals List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Current Goals</h2>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : progressList?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-card/50 rounded-xl border border-dashed border-border">
              <p>No active goals.</p>
              <p className="text-xs">Start by creating a new memorization goal!</p>
            </div>
          ) : (
            progressList?.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{getSurahName(item.surahNumber)}</h3>
                        <p className="text-sm text-muted-foreground">
                          Ayah {item.startAyah} - {item.endAyah}
                        </p>
                      </div>
                      <div className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                        {item.masteryLevel}%
                      </div>
                    </div>
                    
                    <Progress value={item.masteryLevel || 0} className="h-2 mb-4" />
                    
                    <div className="flex justify-end gap-2">
                       <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleIncrementMastery(item)}
                        disabled={item.masteryLevel === 100}
                      >
                        Practice +
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
