import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { 
  Play, Pause, ChevronLeft, ChevronRight, 
  Zap, Volume2, Maximize2, Minimize2, ArrowLeft
} from "lucide-react";
import { usePlayerStore } from "@/hooks/use-player";
import { useSurahDetail } from "@/hooks/use-quran";
import { useQuranSync } from "@/hooks/use-quran-sync";
import { useQuranTimings } from "@/hooks/use-quran-timings";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function PlayPage() {
  const [location, setLocation] = useLocation();
  const {
    isPlaying, currentSurah, currentReciter, serverUrl,
    pause, resume, play, playbackRate, setPlaybackRate
  } = usePlayerStore();
  const { toast } = useToast();
  
  const [seek, setSeek] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  
  const playerRef = useRef<HTMLAudioElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const ayahRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hideControlsTimeout = useRef<NodeJS.Timeout>();

  // Fetch surah details
  const { data: surahDetail, isLoading: isLoadingSurah } = useSurahDetail(currentSurah || 0);

  // Fetch timing data
  const { data: timingsData } = useQuranTimings(currentSurah);

  // Use Quran sync hook
  const { currentAyahId } = useQuranSync({
    audioRef: playerRef,
    timings: timingsData,
    currentSurah,
    ayahRefs,
    autoScrollEnabled
  });

  // Rename for consistency with user's request
  const currentAyahIndex = currentAyahId;

  // Audio URL
  const paddedId = currentSurah ? String(currentSurah).padStart(3, '0') : null;
  const audioUrl = serverUrl && paddedId ? `${serverUrl}/${paddedId}.mp3` : null;

  // Fonction améliorée scrollToAyah
  // ayahIndex correspond au numéro du verset (1, 2, 3...), donc on fait ayahIndex - 1 pour l'index du tableau
  const scrollToAyah = useCallback((ayahIndex: number) => {
    console.log('[Play.tsx] scrollToAyah appelé avec ayahIndex:', ayahIndex, 'autoScrollEnabled:', autoScrollEnabled);
    if (!autoScrollEnabled || !ayahRefs.current) {
      console.log('[Play.tsx] scrollToAyah - retour prématuré: autoScrollEnabled=', autoScrollEnabled, 'ayahRefs.current=', !!ayahRefs.current);
      return;
    }

    const ayahElement = ayahRefs.current[ayahIndex - 1]; // Conversion numéro verset (1-based) → index tableau (0-based)
    console.log('[Play.tsx] scrollToAyah - ayahElement trouvé:', !!ayahElement, 'pour index tableau:', ayahIndex - 1);
    if (ayahElement) {
      ayahElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
      console.log('[Play.tsx] scrollToAyah - scrollIntoView appelé');
    } else {
      console.log('[Play.tsx] scrollToAyah - ERREUR: ayahElement est null pour ayahIndex:', ayahIndex);
    }
  }, [autoScrollEnabled]);

  // Seek to specific ayah using timing data
  const seekToAyah = useCallback((index: number) => {
    if (!timingsData || !currentSurah || !timingsData[currentSurah]) return;

    const ayahTiming = timingsData[currentSurah][index];
    if (ayahTiming && playerRef.current) {
      const seekTime = ayahTiming.tempsDebut / 1000; // Convertir en secondes
      playerRef.current.currentTime = seekTime;
      setSeek(seekTime);
    }
  }, [timingsData, currentSurah]);



  // Update seek timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && playerRef.current) {
      timer = setInterval(() => {
        if (playerRef.current) {
          setSeek(playerRef.current.currentTime);
        }
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Hide controls auto timer
  useEffect(() => {
    if (isPlaying && !speedMenuOpen) {
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, [isPlaying, showControls, speedMenuOpen]);

  // Handle mouse/touch movement to show controls
  const handleInteraction = () => {
    setShowControls(true);
  };

  // Speed options
  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const currentSpeedIndex = speedOptions.findIndex(s => s === playbackRate);

  // Handle swipe gestures for speed control
  const touchStartY = useRef<number>(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        const nextIndex = Math.min(currentSpeedIndex + 1, speedOptions.length - 1);
        setPlaybackRate(speedOptions[nextIndex]);
        toast({
          title: "Vitesse",
          description: `${speedOptions[nextIndex]}x`,
          duration: 1000,
        });
      } else {
        const prevIndex = Math.max(currentSpeedIndex - 1, 0);
        setPlaybackRate(speedOptions[prevIndex]);
        toast({
          title: "Vitesse",
          description: `${speedOptions[prevIndex]}x`,
          duration: 1000,
        });
      }
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle audio ended
  const handleAudioEnded = () => {
    if (currentSurah && currentSurah < 114) {
      play(currentSurah + 1, currentReciter, serverUrl!);
    }
  };

  if (!currentSurah || !audioUrl) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-muted-foreground mb-4">Aucune sourate sélectionnée</p>
          <Button onClick={() => setLocation("/reciters")}>
            Aller aux réciteurs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "fixed inset-0 bg-gradient-to-b from-background to-card z-50",
        isFullscreen && "fullscreen-mode"
      )}
      onMouseMove={handleInteraction}
      onTouchMove={handleInteraction}
    >
      {/* Hidden Audio Element */}
      <audio
        ref={playerRef}
        src={audioUrl}
        onTimeUpdate={(e) => {
          // Mettre à jour seek seulement si pas en cours de lecture (pour éviter les conflits avec le hook)
          if (!isPlaying) {
            setSeek(e.currentTarget.currentTime);
          }
        }}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration);
          // Start playing automatically when audio is loaded
          if (!isPlaying) {
            resume();
          }
        }}
        onEnded={handleAudioEnded}
        preload="metadata"
      />

      {/* Header */}
      <div className={cn(
        "fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-background/80 to-transparent p-4 transition-opacity duration-300",
        showControls ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost"
            onClick={() => setLocation("/reciters")}
          >
            <ArrowLeft className="w-6 h-6 mr-2" />
            Retour
          </Button>
          
          <div className="text-center">
            <h1 className="font-bold text-lg">{surahDetail?.englishName || `Sourate ${currentSurah}`}</h1>
            <p className="text-xs text-muted-foreground">{currentReciter?.name}</p>
          </div>

          <Button 
            variant="ghost"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Ayahs Container */}
      <div 
        ref={scrollContainerRef}
        className="h-full overflow-y-auto pb-40 pt-24 px-4 scroll-smooth"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {isLoadingSurah ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : surahDetail ? (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Surah Header */}
            <div className="text-center py-8">
              <h2 className="text-3xl font-arabic text-primary mb-2">{surahDetail.name}</h2>
              <p className="text-muted-foreground">{surahDetail.englishName}</p>
            </div>

            {/* Ayahs */}
            {surahDetail.ayahs.map((ayah, index) => (
              <div
                key={ayah.number}
                ref={(el) => {
                  console.log('[Play.tsx] Ref assignée - index:', index, 'élément:', !!el, 'ayahRefs.current.length:', ayahRefs.current?.length);
                  ayahRefs.current[index] = el;
                }}
                className={cn(
                  "p-6 rounded-2xl transition-all duration-500 cursor-pointer",
                  index + 1 === currentAyahIndex ? "active-ayah" : "hover:bg-accent/50"
                )}
                onClick={() => seekToAyah(index)}
              >
                {/* Ayah Number */}
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                    {ayah.numberInSurah}
                  </span>
                  {index + 1 === currentAyahIndex && (
                    <span className="text-xs text-primary font-medium animate-pulse">
                      ● En cours
                    </span>
                  )}
                </div>

                {/* Arabic Text */}
                <div className="font-arabic text-2xl leading-loose text-right mb-4 text-foreground">
                  {ayah.text}
                </div>

                {/* Translation */}
                <p className="text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-3">
                  {index + 1}. {ayah.translation}
                </p>
              </div>
            ))}

            {/* End of Surah */}
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-2xl font-arabic">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
              <p className="text-sm mt-2">Fin de la sourate</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Bottom Controls */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-background/95 to-background/80 backdrop-blur-xl border-t border-border p-4 transition-opacity duration-300",
        showControls ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[seek]}
            max={duration || 100}
            step={1}
            onValueChange={(val: number[]) => {
              setSeek(val[0]);
              if (playerRef.current) {
                playerRef.current.currentTime = val[0];
              }
            }}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{formatTime(seek)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-between gap-2">
          {/* Auto Scroll Toggle */}
          <Button
            variant={autoScrollEnabled ? "default" : "outline"}
            onClick={() => setAutoScrollEnabled(!autoScrollEnabled)}
            className="h-12 px-4"
            title="Défilement automatique"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </Button>

          {/* Speed Control */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setSpeedMenuOpen(!speedMenuOpen)}
              className="h-12 rounded-full px-4"
            >
              <Zap className="w-4 h-4 mr-1" />
              <span className="text-sm">{playbackRate}x</span>
            </Button>
            
            {/* Speed Menu */}
            {speedMenuOpen && (
              <div className="absolute bottom-full mb-2 left-0 bg-card border border-border rounded-xl p-2 shadow-xl animate-in slide-in-from-bottom-2">
                <div className="space-y-1">
                  {speedOptions.map((speed) => (
                    <button
                      key={speed}
                      className={cn(
                        "w-full px-4 py-2 text-sm rounded-lg transition-colors",
                        playbackRate === speed
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      )}
                      onClick={() => {
                        setPlaybackRate(speed);
                        if (playerRef.current) {
                          playerRef.current.playbackRate = speed;
                        }
                        toast({
                          title: "Vitesse",
                          description: `Vitesse de lecture: ${speed}x`,
                          duration: 1500,
                        });
                      }}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              onClick={() => seekToAyah(Math.max(0, (currentAyahIndex || 1) - 2))}
              disabled={(currentAyahIndex || 1) <= 1}
              className="h-10 w-10 rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              onClick={() => seekToAyah(Math.max(0, (currentAyahIndex || 1) - 11))}
              className="h-10 w-12 rounded-full"
            >
              <span className="text-xs">-10</span>
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>

          {/* Play/Pause */}
          <Button
            onClick={() => isPlaying ? pause() : resume()}
            className="h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current ml-1" />
            )}
          </Button>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              onClick={() => seekToAyah(Math.min((surahDetail?.ayahs.length || 1) - 1, (currentAyahIndex || 1) + 9))}
              className="h-10 w-12 rounded-full"
            >
              <ChevronRight className="w-4 h-4" />
              <span className="text-xs">+10</span>
            </Button>

            <Button
              variant="ghost"
              onClick={() => seekToAyah(Math.min((surahDetail?.ayahs.length || 1) - 1, (currentAyahIndex || 1)))}
              disabled={(currentAyahIndex || 1) >= (surahDetail?.ayahs.length || 1)}
              className="h-10 w-10 rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Volume */}
          <Button
            variant="outline"
            className="h-12 w-12 rounded-full"
          >
            <Volume2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Instructions */}
        <div className="flex justify-center gap-4 mt-3 text-xs text-muted-foreground">
          <span>↑↓ pour vitesse</span>
          <span>•</span>
          <span>Auto-scroll: {autoScrollEnabled ? "Activé" : "Désactivé"}</span>
        </div>
      </div>
    </div>
  );
}
          <span>Auto-scroll: {autoScrollEnabled ? "Activé" : "Désactivé"}</span>
