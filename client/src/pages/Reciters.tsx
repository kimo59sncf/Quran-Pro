import { useReciters } from "@/hooks/use-reciters";
import { usePlayerStore } from "@/hooks/use-player";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Play, Music } from "lucide-react";
import { useState } from "react";

export default function Reciters() {
  const { data: reciters, isLoading } = useReciters();
  const { setReciter, play, currentReciter } = usePlayerStore();
  const [search, setSearch] = useState("");

  const filteredReciters = reciters?.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) && 
    r.moshaf.length > 0 // Filter out reciters with no recordings
  );

  const handleReciterSelect = (reciter: any) => {
    // Find the first high quality server
    const moshaf = reciter.moshaf[0];
    const server = moshaf.server;
    
    // Play Al-Fatiha (1) by default when selecting a reciter
    play(1, reciter, server);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border p-4">
        <h1 className="text-2xl font-bold font-display text-primary mb-4">Reciters</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-9 bg-muted/50 border-none" 
            placeholder="Search Reciter..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReciters?.map((reciter) => (
              <Card 
                key={reciter.id} 
                className={`
                  cursor-pointer border-border hover:border-primary/50 transition-all hover:bg-card/80
                  ${currentReciter?.id === reciter.id ? 'border-primary bg-primary/5' : 'bg-card'}
                `}
                onClick={() => handleReciterSelect(reciter)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                    <Music className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{reciter.name}</h3>
                    <p className="text-xs text-muted-foreground">{reciter.moshaf.length} Rewaya(s)</p>
                  </div>
                  {currentReciter?.id === reciter.id && (
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
