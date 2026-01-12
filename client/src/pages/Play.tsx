import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import {
  Play, Pause, ChevronLeft, ChevronRight,
  Zap, Volume2, Maximize2, Minimize2, ArrowLeft,
  ScrollText, ChevronUp, ChevronDown, Repeat, Shuffle
} from "lucide-react";
import { usePlayerStore } from "@/hooks/use-player";
import { useSurahDetail } from "@/hooks/use-quran";
import { useAyahTimings } from "@/hooks/use-ayah-timings";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function PlayPage() {
  const [location, setLocation] = useLocation();
  const {
    isPlaying, currentSurah, currentReciter, serverUrl,
    pause, resume, play, playbackRate, setPlaybackRate,
    loopMode, shuffleMode, toggleLoop, toggleShuffle, nextSurah, previousSurah
  } = usePlayerStore();
  const { toast } = useToast();
  
  const [seek, setSeek] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [scrollSpeed, setScrollSpeed] = useState(1);
  const [audioError, setAudioError] = useState<string | null>(null);

  const playerRef = useRef<HTMLAudioElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const ayahRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hideControlsTimeout = useRef<NodeJS.Timeout>();

  // Fetch surah details
  const { data: surahDetail, isLoading: isLoadingSurah } = useSurahDetail(currentSurah || 0);

  // Audio URL
  const paddedId = currentSurah ? String(currentSurah).padStart(3, '0') : null;
  const audioUrl = serverUrl && paddedId ? `${serverUrl}/${paddedId}.mp3` : null;

  // Charger les timings réels depuis l'API
  const { getCurrentAyah, isLoading: isLoadingTimings } = useAyahTimings(
    currentReciter?.id?.toString() || undefined,
    currentSurah || undefined
  );

  // Stable auto-scroll based on real timings
  useEffect(() => {
    if (!surahDetail || !autoScrollEnabled || isLoadingTimings) return;

    // Convertir seek (secondes) en millisecondes pour l'API
    const currentTimeMs = seek * 1000;
    const newIndex = getCurrentAyah(currentTimeMs) - 1; // -1 car les indices commencent à 0

    if (newIndex !== currentAyahIndex && newIndex >= 0) {
      setCurrentAyahIndex(newIndex);
      scrollToAyah(newIndex);
    }
  }, [seek, surahDetail, autoScrollEnabled, getCurrentAyah, currentAyahIndex, isLoadingTimings]);

  // Scroll to current ayah
  const scrollToAyah = useCallback((index: number) => {
    const element = ayahRefs.current[index];
    if (element && scrollContainerRef.current) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, []);

  // Seek to specific ayah
  const seekToAyah = useCallback((index: number) => {
    if (!surahDetail || duration === 0) return;

    // Calculate time position based on average ayah duration
    const averageAyahDuration = duration / surahDetail.ayahs.length;
    const targetTime = index * averageAyahDuration;

    setSeek(targetTime);
    if (playerRef.current) {
      playerRef.current.currentTime = targetTime;
    }
    setCurrentAyahIndex(index);
  }, [surahDetail, duration]);

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
    // Désactivé : l'accélérateur de lecteur lors du scroll a été désactivé
    // const touchEndY = e.changedTouches[0].clientY;
    // const diff = touchStartY.current - touchEndY;

    // if (Math.abs(diff) > 50) {
    //   if (diff > 0) {
    //     const nextIndex = Math.min(currentSpeedIndex + 1, speedOptions.length - 1);
    //     setPlaybackRate(speedOptions[nextIndex]);
    //     toast({
    //       title: "Vitesse",
    //       description: `${speedOptions[nextIndex]}x`,
    //       duration: 1000,
    //     });
    //   } else {
    //     const prevIndex = Math.max(currentSpeedIndex - 1, 0);
    //     setPlaybackRate(speedOptions[prevIndex]);
    //     toast({
    //       title: "Vitesse",
    //       description: `${speedOptions[prevIndex]}x`,
    //       duration: 1000,
    //     });
    //   }
    // }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle audio ended
  const handleAudioEnded = () => {
    nextSurah();
  };

  // Control audio playback based on isPlaying state
  useEffect(() => {
    if (playerRef.current && !audioError) {
      if (isPlaying) {
        const playPromise = playerRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Audio play error:', error);
            setAudioError('Erreur de lecture audio. Redirection vers le lecteur audio...');
            // Rediriger automatiquement vers la page audio-player après un délai
            setTimeout(() => {
              setLocation("/audio-player");
            }, 2000);
          });
        }
      } else {
        playerRef.current.pause();
      }
    }
  }, [isPlaying, audioError, setLocation]);

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
        onTimeUpdate={(e) => setSeek(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration);
          setAudioError(null); // Clear any previous error
        }}
        onError={(e) => {
          console.error('Audio load error:', e);
          setAudioError('Impossible de charger le fichier audio. Ce récitateur pourrait ne pas avoir cette sourate disponible.');
          // Rediriger automatiquement vers la page audio-player après un délai
          setTimeout(() => {
            setLocation("/audio-player");
          }, 2000);
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
            onClick={() => setLocation(`/reciters?id=${currentReciter?.id}`)}
          >
            <ArrowLeft className="w-6 h-6 mr-2" />
            Retour
          </Button>
          
          <div className="text-center">
            <h1 className="font-bold text-lg">{surahDetail?.englishName || `Sourate ${currentSurah}`}</h1>
            <p className="text-xs text-muted-foreground">{currentReciter?.name}</p>
            {audioError && (
              <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-xs text-destructive">{audioError}</p>
              </div>
            )}
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
                ref={(el) => { ayahRefs.current[index] = el }}
                className={cn(
                  "p-6 rounded-2xl transition-all duration-500 cursor-pointer",
                  index === currentAyahIndex 
                    ? "bg-primary/10 scale-[1.02] shadow-lg border border-primary/20" 
                    : "hover:bg-accent/50"
                )}
                onClick={() => seekToAyah(index)}
              >
                {/* Ayah Number */}
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                    {ayah.numberInSurah}
                  </span>
                  {index === currentAyahIndex && (
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
          {/* Playback Mode Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant={shuffleMode ? "default" : "outline"}
              onClick={toggleShuffle}
              className={cn(
                "h-10 w-10 rounded-full",
                shuffleMode ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              title={shuffleMode ? "Désactiver aléatoire" : "Activer aléatoire"}
            >
              <Shuffle className="w-4 h-4" />
            </Button>

            <Button
              variant={loopMode ? "default" : "outline"}
              onClick={toggleLoop}
              className={cn(
                "h-10 w-10 rounded-full",
                loopMode ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              title={loopMode ? "Désactiver boucle" : "Activer boucle"}
            >
              <Repeat className="w-4 h-4" />
            </Button>
          </div>

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
                        setSpeedMenuOpen(false);
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
              onClick={() => seekToAyah(Math.max(0, currentAyahIndex - 1))}
              disabled={currentAyahIndex === 0}
              className="h-10 w-10 rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              onClick={() => seekToAyah(Math.max(0, currentAyahIndex - 10))}
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
              onClick={() => seekToAyah(Math.min((surahDetail?.ayahs.length || 1) - 1, currentAyahIndex + 10))}
              className="h-10 w-12 rounded-full"
            >
              <ChevronRight className="w-4 h-4" />
              <span className="text-xs">+10</span>
            </Button>

            <Button
              variant="ghost"
              onClick={() => seekToAyah(Math.min((surahDetail?.ayahs.length || 1) - 1, currentAyahIndex + 1))}
              disabled={currentAyahIndex >= (surahDetail?.ayahs.length || 1) - 1}
              className="h-10 w-10 rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Auto-scroll Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant={autoScrollEnabled ? "default" : "outline"}
              onClick={() => setAutoScrollEnabled(!autoScrollEnabled)}
              className="h-12 w-12 rounded-full"
              title={autoScrollEnabled ? "Désactiver défilement auto" : "Activer défilement auto"}
            >
              <ScrollText className="w-5 h-5" />
            </Button>

            <div className="flex flex-col gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScrollSpeed(Math.min(3, scrollSpeed + 0.25))}
                className="h-5 w-5 p-0 rounded text-xs"
                title="Augmenter vitesse de défilement"
              >
                <ChevronUp className="w-3 h-3" />
              </Button>
              <span className="text-xs text-center font-mono min-w-[20px]">{scrollSpeed}x</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScrollSpeed(Math.max(0.25, scrollSpeed - 0.25))}
                className="h-5 w-5 p-0 rounded"
                title="Diminuer vitesse de défilement"
              >
                <ChevronDown className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="flex justify-center gap-4 mt-3 text-xs text-muted-foreground">
          <span>↑↓ boutons pour naviguer</span>
        </div>
      </div>
    </div>
  );
}
