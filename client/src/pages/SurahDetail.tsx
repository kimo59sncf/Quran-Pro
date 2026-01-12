import { useRoute } from "wouter";
import { useSurahDetail } from "@/hooks/use-quran";
import { useCreateBookmark } from "@/hooks/use-bookmarks";
import { usePlayerStore } from "@/hooks/use-player";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Play, Bookmark as BookmarkIcon, Eye, EyeOff } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";

export default function SurahDetail() {
  const [match, params] = useRoute("/surah/:id");
  const id = parseInt(params?.id || "1");
  const { data: surah, isLoading } = useSurahDetail(id);
  const { mutate: createBookmark, isPending: isBookmarking } = useCreateBookmark();
  const { play, currentReciter, serverUrl } = usePlayerStore();
  
  const [hideArabic, setHideArabic] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);

  if (isLoading || !surah) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const handlePlaySurah = () => {
    // Default reciter if none selected
    const reciter = currentReciter || { name: "Mishary Rashid Alafasy", id: 1 };
    const url = serverUrl || "https://server8.mp3quran.net/afs";
    play(id, reciter, url);
  };

  const handleBookmark = (ayahNumber: number) => {
    createBookmark({
      surahNumber: id,
      ayahNumber: ayahNumber,
      type: 'read',
      seconds: 0
    });
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Link href="/reciters">
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="text-center">
            <h2 className="font-bold text-lg">{surah.englishName}</h2>
            <p className="text-xs text-muted-foreground">{surah.englishNameTranslation}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary hover:bg-primary/10"
            onClick={handlePlaySurah}
          >
            <Play className="w-5 h-5 fill-current" />
          </Button>
        </div>
        
        {/* Controls Bar */}
        <div className="flex items-center justify-center gap-2 pb-2 px-4 overflow-x-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setHideArabic(!hideArabic)}
            className={cn("text-xs h-8 border-primary/20", hideArabic && "bg-primary/10 text-primary")}
          >
            {hideArabic ? <EyeOff className="w-3 h-3 mr-2" /> : <Eye className="w-3 h-3 mr-2" />}
            {hideArabic ? "Show Arabic" : "Blur Arabic"}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowTranslation(!showTranslation)}
            className={cn("text-xs h-8 border-primary/20", showTranslation && "bg-primary/10 text-primary")}
          >
            Translate
          </Button>
        </div>
      </div>

      {/* Bismillah */}
      <div className="text-center py-8">
        <div className="font-arabic text-3xl text-primary/80">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </div>
      </div>

      {/* Ayahs */}
      <div className="px-4 space-y-6 max-w-3xl mx-auto">
        {surah.ayahs.map((ayah) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            key={ayah.number} 
            className="group relative bg-card/30 rounded-2xl p-6 border border-transparent hover:border-primary/20 hover:bg-card/50 transition-all"
          >
            {/* Action Buttons (Hover) */}
            <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-primary/20 hover:text-primary"
                onClick={() => handleBookmark(ayah.numberInSurah)}
                disabled={isBookmarking}
              >
                <BookmarkIcon className="w-4 h-4" />
              </Button>
            </div>

            {/* Ayah Number Badge */}
            <div className="flex justify-end mb-4">
              <div className="w-8 h-8 rounded-full border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
                {ayah.numberInSurah}
              </div>
            </div>

            {/* Arabic Text */}
            <p 
              className={cn(
                "font-arabic text-right text-3xl leading-[2.5] mb-6 text-foreground/90 transition-all duration-300",
                hideArabic && "blur-text hover:blur-none"
              )} 
              dir="rtl"
            >
              {ayah.text}
            </p>

            {/* Translation */}
            {showTranslation && (
              <p className="text-muted-foreground text-sm leading-relaxed border-t border-border/50 pt-4">
                {ayah.translation}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
