import { useReciters } from "@/hooks/use-reciters";
import { usePlayerStore } from "@/hooks/use-player";
import { useSurahs } from "@/hooks/use-quran";
import { useBookmarks, useCreateBookmark, useDeleteBookmark } from "@/hooks/use-bookmarks";
import { useDownloads, useCreateDownload, useUpdateDownload, useDeleteDownload } from "@/hooks/use-downloads";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Play, Music, ArrowLeft, Heart, ListPlus, CloudDownload, Shuffle as ShuffleIcon, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useLocation, useSearch } from "wouter";

// Component to handle reciter image with fallback
function ReciterImage({ src, alt }: { src?: string; alt: string }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
        <Music className="w-5 h-5 text-white" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      onError={() => setHasError(true)}
    />
  );
}

export default function Reciters() {
  const { data: reciters, isLoading: isLoadingReciters } = useReciters();
  const { data: surahs, isLoading: isLoadingSurahs } = useSurahs();
  const { data: bookmarks } = useBookmarks();
  const { data: downloads } = useDownloads();
  const createBookmark = useCreateBookmark();
  const deleteBookmark = useDeleteBookmark();
  const createDownload = useCreateDownload();
  const updateDownload = useUpdateDownload();
  const deleteDownload = useDeleteDownload();
  const { setReciter, play, currentReciter, resume } = usePlayerStore();
  const [search, setSearch] = useState("");
  const [selectedReciter, setSelectedReciter] = useState<any>(null);
  const { toast } = useToast();
  const queryString = useSearch();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (reciters && queryString) {
      const params = new URLSearchParams(queryString);
      const id = params.get('id');
      if (id) {
        const reciter = reciters.find(r => String(r.id) === id);
        if (reciter) {
          setSelectedReciter(reciter);
          setReciter(reciter);
        }
      }
    }
  }, [reciters, queryString, setReciter]);

  // Séparer les réciteurs avec et sans photos, puis les trier
  const filtered = reciters?.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) &&
    r.moshaf.length > 0
  ) || [];

  const withImages = filtered.filter(r => r.image);
  const withoutImages = filtered.filter(r => !r.image);

  // Trier chaque groupe par popularité puis par nom
  const sortByPopularity = (a: any, b: any) => {
    if (a.popularity === 0 && b.popularity === 0) return a.name.localeCompare(b.name);
    if (a.popularity === 0) return 1;
    if (b.popularity === 0) return -1;
    if (a.popularity === b.popularity) return a.name.localeCompare(b.name);
    return a.popularity - b.popularity;
  };

  withImages.sort(sortByPopularity);
  withoutImages.sort(sortByPopularity);

  // Séparer les réciteurs avec images en deux catégories: très populaires et populaires
  const mostPopularWithImages = withImages.filter(r => r.popularity === 1);
  const popularWithImages = withImages.filter(r => r.popularity === 2);
  const otherWithImages = withImages.filter(r => r.popularity === 3 || r.popularity === 0);

  // Combiner: tous les réciteurs avec photos d'abord, puis ceux sans photos
  const filteredReciters = [...withImages, ...withoutImages];

  // Debug logging
  console.log('=== Reciters Page Debug ===');
  console.log('Total reciters:', reciters?.length);
  console.log('Filtered reciters:', filtered.length);
  console.log('With images:', withImages.length);
  console.log('Without images:', withoutImages.length);
  console.log('Most popular with images:', mostPopularWithImages.length);
  console.log('Popular with images:', popularWithImages.length);
  console.log('Other with images:', otherWithImages.length);
  console.log('Search term:', search);
  console.log('Most popular reciters:', mostPopularWithImages.map(r => ({ name: r.name, image: r.image })));
  console.log('============================');

  const handleReciterSelect = (reciter: any) => {
    setSelectedReciter(reciter);
    const moshaf = reciter.moshaf[0];
    setReciter(reciter);
  };

  const handleSurahClick = (surah: any) => {
    const server = selectedReciter.moshaf[0].server;
    // Vérifier si le récitateur est "programmé" (popularité > 0)
    const isSupportedReciter = selectedReciter.popularity > 0;

    if (!isSupportedReciter) {
      // Pour les récitateurs non programmés, rediriger vers une page AudioPlayer dédiée
      play(surah.number, selectedReciter, server);
      setLocation("/audio-player");
      return;
    }

    // Pour les récitateurs programmés, aller à la page Play normale
    play(surah.number, selectedReciter, server);
    setLocation("/play");
  };

  const handleShufflePlay = () => {
    if (!surahs || !selectedReciter) return;
    const randomSurah = surahs[Math.floor(Math.random() * surahs.length)];
    const server = selectedReciter.moshaf[0].server;
    play(randomSurah.number, selectedReciter, server);
    toast({
      title: "Shuffle Play",
      description: `Playing ${randomSurah.englishName}`,
    });
  };

  const handleAction = (type: string, surah: any) => {
    console.log('=== handleAction Debug ===');
    console.log('Action type:', type);
    console.log('Surah:', surah);
    console.log('Selected Reciter:', selectedReciter);
    console.log('======================');
    
    if (type === "Favorites") {
      const isFav = bookmarks?.some(b => b.type === "surah" && b.surahNumber === surah.number && b.isFavorite);
      if (isFav) {
        const fav = bookmarks?.find(b => b.type === "surah" && b.surahNumber === surah.number && b.isFavorite);
        if (fav) deleteBookmark.mutate(fav.id);
      } else {
        createBookmark.mutate({
          surahNumber: surah.number,
          ayahNumber: 0,
          type: "surah",
          isFavorite: true,
          reciterId: String(selectedReciter.id),
        });
      }
    } else if (type === "Playlist") {
      const isPlaylist = bookmarks?.some(b => b.type === "playlist" && b.surahNumber === surah.number && b.isFavorite);
      if (isPlaylist) {
        const item = bookmarks?.find(b => b.type === "playlist" && b.surahNumber === surah.number);
        if (item) deleteBookmark.mutate(item.id);
      } else {
        createBookmark.mutate({
          surahNumber: surah.number,
          ayahNumber: 0,
          type: "playlist",
          isFavorite: true,
          reciterId: String(selectedReciter.id)
        });
      }
    } else if (type === "Download") {
      // Vérifier si déjà téléchargé
      const existingDownload = downloads?.find(d =>
        d.surahNumber === surah.number && d.reciterId === String(selectedReciter.id)
      );
      
      if (existingDownload) {
        // Si déjà téléchargé, le supprimer
        if (existingDownload.id) {
          deleteDownload.mutate(existingDownload.id, {
            onSuccess: () => {
              toast({
                title: "Téléchargement supprimé",
                description: `${surah.englishName} a été retiré des téléchargements.`,
              });
            },
            onError: () => {
              toast({
                title: "Erreur",
                description: "Impossible de supprimer le téléchargement.",
                variant: "destructive",
              });
            },
          });
        }
      } else {
        // Créer un nouveau téléchargement
        const server = selectedReciter.moshaf[0].server;
        const paddedId = String(surah.number).padStart(3, '0');
        const audioUrl = `${server}/${paddedId}.mp3`;
        
        createDownload.mutate({
          surahNumber: surah.number,
          reciterId: String(selectedReciter.id),
          localPath: audioUrl,
          status: "pending",
          progress: 0,
        }, {
          onSuccess: (data) => {
            console.log('Download created successfully:', data);
            // Simuler le téléchargement en mettant à jour le statut
            setTimeout(() => {
              updateDownload.mutate({
                id: data.id,
                data: { status: "downloading", progress: 50 }
              });
              
              // Simuler la fin du téléchargement
              setTimeout(() => {
                updateDownload.mutate({
                  id: data.id,
                  data: { status: "completed", progress: 100 }
                }, {
                  onSuccess: () => {
                    toast({
                      title: "Téléchargement terminé",
                      description: `${surah.englishName} a été téléchargé avec succès.`,
                    });
                  }
                });
              }, 1500);
            }, 500);
          },
          onError: () => {
            toast({
              title: "Erreur",
              description: "Impossible de créer le téléchargement.",
              variant: "destructive",
            });
          },
        });
      }
    } else {
      toast({
        title: type,
        description: `${surah.englishName} added to ${type.toLowerCase()}`,
      });
    }
  };

  const isSurahFavorite = (surahNumber: number) => {
    return bookmarks?.some(b => b.type === "surah" && b.surahNumber === surahNumber && b.isFavorite);
  };

  const isReciterFavorite = (reciterId: number) => {
    return bookmarks?.some(b => b.type === "reciter" && b.reciterId === String(reciterId) && b.isFavorite);
  };

  const isSurahDownloaded = (surahNumber: number, reciterId: string) => {
    const download = downloads?.find(d => d.surahNumber === surahNumber && d.reciterId === reciterId);
    console.log('=== isSurahDownloaded Debug ===');
    console.log('surahNumber:', surahNumber);
    console.log('reciterId:', reciterId);
    console.log('download found:', download);
    console.log('download status:', download?.status);
    console.log('is completed:', download?.status === 'completed');
    console.log('==============================');
    return download?.status === 'completed';
  };

  const toggleReciterFavorite = (reciter: any) => {
    const favorite = bookmarks?.find(b => b.type === "reciter" && b.reciterId === String(reciter.id));
    if (favorite) {
      deleteBookmark.mutate(favorite.id);
    } else {
      createBookmark.mutate({
        surahNumber: 0,
        ayahNumber: 0,
        type: "reciter",
        reciterId: String(reciter.id),
        isFavorite: true,
      });
    }
  };

  if (selectedReciter) {
    const server = selectedReciter.moshaf[0].server;
    return (
      <div className="min-h-screen bg-background pb-32">
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border p-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setSelectedReciter(null)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold font-display text-primary truncate">{selectedReciter.name}</h1>
            <p className="text-xs text-muted-foreground">Select a Surah to play</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-10 w-10", isReciterFavorite(selectedReciter.id) ? "text-red-500" : "text-muted-foreground")}
            onClick={() => toggleReciterFavorite(selectedReciter)}
          >
            <Heart className={cn("w-5 h-5", isReciterFavorite(selectedReciter.id) && "fill-current")} />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          <Button 
            className="w-full gap-2 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20" 
            variant="outline"
            onClick={handleShufflePlay}
          >
            <ShuffleIcon className="w-4 h-4" />
            Lecteur Aléatoire
          </Button>

          <div className="space-y-2">
            {surahs?.map((surah) => (
              <Card key={surah.number} className="bg-card hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => handleSurahClick(surah)}>
                <CardContent className="p-3 flex items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xs font-mono text-muted-foreground w-6">{surah.number}</span>
                    <div
                      className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm hover:bg-primary hover:text-white transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSurahClick(surah);
                      }}
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{surah.englishName}</h3>
                      <p className="text-xs text-muted-foreground">{surah.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={cn("h-8 w-8 hover:text-red-500", isSurahFavorite(surah.number) ? "text-red-500" : "text-muted-foreground")}
                      onClick={() => handleAction("Favorites", surah)}
                    >
                      <Heart className={cn("w-4 h-4", isSurahFavorite(surah.number) && "fill-current")} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleAction("Playlist", surah)}>
                      <ListPlus className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("h-8 w-8 hover:text-green-500", isSurahDownloaded(surah.number, String(selectedReciter.id)) ? "text-green-500" : "text-muted-foreground")}
                      onClick={() => handleAction("Download", surah)}
                    >
                      {isSurahDownloaded(surah.number, String(selectedReciter.id)) ? (
                        <CheckCircle2 className="w-4 h-4 fill-current" />
                      ) : (
                        <CloudDownload className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
        {isLoadingReciters ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Section des réciteurs très populaires avec images */}
            {mostPopularWithImages.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  Réciteurs très populaires
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {mostPopularWithImages.map((reciter) => (
                    <Card
                      key={reciter.id}
                      className={`
                        cursor-pointer border-border hover:border-primary/50 transition-all hover:bg-card/80
                        ${currentReciter?.id === reciter.id ? 'border-primary bg-primary/5' : 'bg-card'}
                      `}
                      onClick={() => handleReciterSelect(reciter)}
                    >
                      <CardContent className="p-4 flex flex-col items-center gap-3">
                        <div className="w-20 h-20 rounded-full overflow-hidden shrink-0 border-2 border-primary shadow-lg">
                          <ReciterImage src={reciter.image} alt={reciter.name} />
                        </div>
                        <div className="text-center w-full">
                          <h3 className="font-semibold text-sm truncate">{reciter.name}</h3>
                          <p className="text-xs text-muted-foreground">{reciter.moshaf.length} Rewaya(s)</p>
                        </div>
                        {currentReciter?.id === reciter.id && (
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse mt-auto" />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Section des réciteurs populaires avec images */}
            {popularWithImages.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                  <span className="text-xl">🎤</span>
                  Réciteurs populaires
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {popularWithImages.map((reciter) => (
                    <Card
                      key={reciter.id}
                      className={`
                        cursor-pointer border-border hover:border-primary/50 transition-all hover:bg-card/80
                        ${currentReciter?.id === reciter.id ? 'border-primary bg-primary/5' : 'bg-card'}
                      `}
                      onClick={() => handleReciterSelect(reciter)}
                    >
                      <CardContent className="p-4 flex flex-col items-center gap-3">
                        <div className="w-20 h-20 rounded-full overflow-hidden shrink-0 border-2 border-border">
                          <ReciterImage src={reciter.image} alt={reciter.name} />
                        </div>
                        <div className="text-center w-full">
                          <h3 className="font-semibold text-sm truncate">{reciter.name}</h3>
                          <p className="text-xs text-muted-foreground">{reciter.moshaf.length} Rewaya(s)</p>
                        </div>
                        {currentReciter?.id === reciter.id && (
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse mt-auto" />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Section des autres réciteurs avec images */}
            {otherWithImages.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                  <span className="text-xl">📚</span>
                  Autres réciteurs avec photos
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {otherWithImages.map((reciter) => (
                    <Card
                      key={reciter.id}
                      className={`
                        cursor-pointer border-border hover:border-primary/50 transition-all hover:bg-card/80
                        ${currentReciter?.id === reciter.id ? 'border-primary bg-primary/5' : 'bg-card'}
                      `}
                      onClick={() => handleReciterSelect(reciter)}
                    >
                      <CardContent className="p-4 flex flex-col items-center gap-3">
                        <div className="w-20 h-20 rounded-full overflow-hidden shrink-0 border-2 border-border">
                          <ReciterImage src={reciter.image} alt={reciter.name} />
                        </div>
                        <div className="text-center w-full">
                          <h3 className="font-semibold text-sm truncate">{reciter.name}</h3>
                          <p className="text-xs text-muted-foreground">{reciter.moshaf.length} Rewaya(s)</p>
                        </div>
                        {currentReciter?.id === reciter.id && (
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse mt-auto" />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Section des réciteurs sans images */}
            {withoutImages.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                  <span className="text-xl">🎵</span>
                  Autres réciteurs
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {withoutImages.map((reciter) => (
                    <Card
                      key={reciter.id}
                      className={`
                        cursor-pointer border-border hover:border-primary/50 transition-all hover:bg-card/80
                        ${currentReciter?.id === reciter.id ? 'border-primary bg-primary/5' : 'bg-card'}
                      `}
                      onClick={() => handleReciterSelect(reciter)}
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-border">
                          <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <Music className="w-5 h-5 text-white" />
                          </div>
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
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
