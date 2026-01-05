import { useBookmarks } from "@/hooks/use-bookmarks";
import { useReciters } from "@/hooks/use-reciters";
import { useSurahs } from "@/hooks/use-quran";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Music, ListMusic, Loader2, Play } from "lucide-react";
import { usePlayerStore } from "@/hooks/use-player";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export default function Favorites() {
  const { data: bookmarks, isLoading: isLoadingBookmarks } = useBookmarks();
  const { data: reciters } = useReciters();
  const { data: surahs } = useSurahs();
  const { play } = usePlayerStore();

  const favoriteReciters = reciters?.filter(r => 
    bookmarks?.some(b => b.type === "reciter" && b.reciterId === String(r.id) && b.isFavorite)
  );

  const favoriteSurahs = surahs?.filter(s => 
    bookmarks?.some(b => b.type === "surah" && b.surahNumber === s.number && b.isFavorite)
  );

  const isLoading = isLoadingBookmarks;

  const handlePlaySurah = (surahNumber: number) => {
    // We need a reciter to play a surah. 
    // If there's a favorite reciter, use the first one. Otherwise, we might need a default.
    // For now, let's find the first favorite reciter or the first available one.
    const reciterToUse = favoriteReciters?.[0] || reciters?.[0];
    if (reciterToUse && reciterToUse.moshaf.length > 0) {
      play(surahNumber, reciterToUse, reciterToUse.moshaf[0].server);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border p-4">
        <h1 className="text-2xl font-bold font-display text-primary">Coup de Cœur</h1>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="surahs" className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-6">
              <TabsTrigger value="surahs" className="gap-2">
                <Heart className="w-4 h-4" />
                Sourates
              </TabsTrigger>
              <TabsTrigger value="reciters" className="gap-2">
                <Music className="w-4 h-4" />
                Récitateurs
              </TabsTrigger>
              <TabsTrigger value="playlists" className="gap-2">
                <ListMusic className="w-4 h-4" />
                Playlists
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reciters" className="space-y-4">
              {favoriteReciters?.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">Aucun récitateur favori</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favoriteReciters?.map((reciter) => (
                    <Card key={reciter.id} className="bg-card">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Music className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{reciter.name}</h3>
                          <p className="text-xs text-muted-foreground">{reciter.moshaf.length} Rewaya(s)</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="surahs" className="space-y-2">
              {favoriteSurahs?.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">Aucune sourate favorite</p>
              ) : (
                favoriteSurahs?.map((surah) => (
                  <Card key={surah.number} className="bg-card">
                    <CardContent className="p-3 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {surah.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{surah.englishName}</h3>
                        <p className="text-xs text-muted-foreground">{surah.name}</p>
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-primary"
                        onClick={() => handlePlaySurah(surah.number)}
                      >
                        <Play className="w-5 h-5 fill-current" />
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="playlists" className="space-y-4">
              <p className="text-center text-muted-foreground py-12">Vos playlists apparaîtront ici</p>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
