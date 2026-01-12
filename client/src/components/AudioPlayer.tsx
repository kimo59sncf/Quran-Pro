import { useState, useRef, useEffect } from "react";
import ReactHowler from "react-howler";
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, ChevronLeft, ChevronRight } from "lucide-react";
import { usePlayerStore } from "@/hooks/use-player";
import { useSurahs } from "@/hooks/use-quran";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

export function AudioPlayer() {
  const { isPlaying, currentSurah, currentReciter, serverUrl, pause, resume, play, playbackRate } = usePlayerStore();
  const { data: surahs } = useSurahs();
  const [seek, setSeek] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const playerRef = useRef<ReactHowler>(null);

  // Pad surah ID with leading zeros (001, 002, etc.) for URL
  const paddedId = currentSurah ? String(currentSurah).padStart(3, '0') : null;
  const audioUrl = serverUrl && paddedId ? `${serverUrl}/${paddedId}.mp3` : null;
  
  const currentSurahData = surahs?.find(s => s.number === currentSurah);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && playerRef.current) {
      timer = setInterval(() => {
        const currentSeek = playerRef.current?.seek();
        if (typeof currentSeek === 'number') {
          setSeek(currentSeek);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleNext = () => {
    if (currentSurah && currentSurah < 114 && serverUrl) {
      play(currentSurah + 1, currentReciter, serverUrl);
    }
  };

  const handlePrev = () => {
    if (currentSurah && currentSurah > 1 && serverUrl) {
      play(currentSurah - 1, currentReciter, serverUrl);
    }
  };

  const handleSeekBack = () => {
    const newSeek = Math.max(0, seek - 15);
    setSeek(newSeek);
    playerRef.current?.seek(newSeek);
  };

  const handleSeekForward = () => {
    const newSeek = Math.min(duration, seek + 15);
    setSeek(newSeek);
    playerRef.current?.seek(newSeek);
  };

  if (!currentSurah || !audioUrl) return null;

  return (
    <>
      {/* Hidden Audio Element */}
      <ReactHowler
        src={audioUrl}
        playing={isPlaying}
        html5={true}
        ref={playerRef}
        onLoad={() => setDuration(playerRef.current?.duration() || 0)}
        onEnd={() => handleNext()}
      />

      {/* Mini Player (Sticky) */}
      <div 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-16 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-primary/20 p-3 cursor-pointer shadow-[0_-4px_20px_rgba(0,0,0,0.3)]"
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto px-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {currentSurah}
            </div>
            <div className="truncate">
              <h4 className="text-sm font-semibold truncate text-foreground">{currentSurahData?.englishName}</h4>
              <p className="text-xs text-muted-foreground truncate">{currentReciter?.name}</p>
            </div>
          </div>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-10 w-10 text-primary hover:text-primary hover:bg-primary/10 rounded-full shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              isPlaying ? pause() : resume();
            }}
          >
            {isPlaying ? <Pause className="fill-current" /> : <Play className="fill-current" />}
          </Button>
        </div>
        
        {/* Progress Bar (Mini) */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-muted/30">
          <div 
            className="h-full bg-primary transition-all duration-300" 
            style={{ width: `${(seek / duration) * 100}%` }} 
          />
        </div>
      </div>

      {/* Full Screen Player */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="h-[100dvh] pt-12 flex flex-col bg-gradient-to-b from-background to-card border-none">
          <div className="flex-1 flex flex-col items-center justify-center gap-8 max-w-md mx-auto w-full">
            
            {/* Album Art / Surah Info */}
            <div className="text-center space-y-6 w-full">
              <div className="w-64 h-64 mx-auto bg-gradient-to-tr from-primary/20 to-secondary/10 rounded-3xl border border-primary/20 shadow-2xl flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 islamic-pattern opacity-30" />
                <div className="relative z-10 text-center">
                  <span className="block text-6xl font-arabic mb-2 text-primary">{currentSurahData?.name}</span>
                  <span className="block text-lg font-display text-muted-foreground tracking-widest uppercase">Surah {currentSurahData?.number}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-foreground">{currentSurahData?.englishName}</h2>
                <p className="text-lg text-primary">{currentReciter?.name}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="w-full space-y-6">
              <div className="space-y-2">
                <Slider
                  value={[seek]}
                  max={duration}
                  step={1}
                  onValueChange={(val: number[]) => {
                    setSeek(val[0]);
                    playerRef.current?.seek(val[0]);
                  }}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground font-mono">
                  <span>{formatTime(seek)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-foreground">
                  <Shuffle className="w-5 h-5" />
                </Button>

                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" onClick={handleSeekBack} className="h-10 w-10 hover:bg-primary/10 rounded-full" title="15s back">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <Button size="icon" variant="ghost" onClick={handlePrev} className="h-12 w-12 hover:bg-primary/10 rounded-full" title="Previous Surah">
                    <SkipBack className="w-6 h-6" />
                  </Button>

                  <Button
                    size="icon"
                    className="h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 hover:bg-primary/90 transition-all"
                    onClick={() => isPlaying ? pause() : resume()}
                  >
                    {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                  </Button>

                  <Button size="icon" variant="ghost" onClick={handleNext} className="h-12 w-12 hover:bg-primary/10 rounded-full" title="Next Surah">
                    <SkipForward className="w-6 h-6" />
                  </Button>

                  <Button size="icon" variant="ghost" onClick={handleSeekForward} className="h-10 w-10 hover:bg-primary/10 rounded-full" title="15s forward">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-foreground">
                  <Repeat className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            {/* Loop AB Placeholders */}
            <div className="flex gap-4 w-full">
               <Button variant="outline" className="flex-1 border-primary/20 hover:bg-primary/5">Set A</Button>
               <Button variant="outline" className="flex-1 border-primary/20 hover:bg-primary/5">Set B</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
