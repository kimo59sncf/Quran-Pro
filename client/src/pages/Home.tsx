import { Link } from "wouter";
import { useSurahs, useRandomAyah } from "@/hooks/use-quran";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Loader2, BookMarked, Sparkles } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: surahs, isLoading } = useSurahs();
  const { data: randomAyah, isLoading: isRandomLoading } = useRandomAyah();
  const { data: bookmarks } = useBookmarks();
  const [search, setSearch] = useState("");

  const filteredSurahs = surahs?.filter(
    (s) =>
      s.englishName.toLowerCase().includes(search.toLowerCase()) ||
      s.englishNameTranslation.toLowerCase().includes(search.toLowerCase()) ||
      String(s.number).includes(search)
  );

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold font-display text-primary">Quran Pro</h1>
            <p className="text-xs text-muted-foreground">Read, Listen & Reflect</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-secondary" />
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary" 
            placeholder="Search Surah..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="px-4 py-6 space-y-8">
        {/* Random Ayah Section */}
        {randomAyah && !isRandomLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-secondary" />
              Daily Verse
            </h3>
            <Card className="bg-gradient-to-br from-card to-card/50 border-primary/10 overflow-hidden relative group">
              <div className="absolute inset-0 islamic-pattern opacity-50 pointer-events-none" />
              <CardContent className="p-6 relative z-10 text-center">
                <p className="font-arabic text-2xl leading-relaxed mb-4" dir="rtl">
                  {randomAyah[0].text}
                </p>
                <p className="text-sm text-muted-foreground italic mb-4">
                  "{randomAyah[1].text}"
                </p>
                <div className="text-xs font-bold text-primary uppercase tracking-widest">
                  {randomAyah[0].surah.englishName} • Ayah {randomAyah[0].numberInSurah}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Continue Reading Section (Bookmarks) */}
        {bookmarks && bookmarks.length > 0 && (
          <div className="mb-8">
             <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-primary" />
              Continue Reading
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {bookmarks.map(bm => (
                <Link key={bm.id} href={`/surah/${bm.surahNumber}`} className="shrink-0">
                  <Card className="w-40 hover:border-primary transition-colors cursor-pointer bg-card/50">
                    <CardContent className="p-4">
                      <div className="text-xs text-muted-foreground mb-1">Surah {bm.surahNumber}</div>
                      <div className="font-bold text-lg mb-1 truncate">
                        {surahs?.find(s => s.number === bm.surahNumber)?.englishName}
                      </div>
                      <div className="text-xs text-primary">Ayah {bm.ayahNumber}</div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Surah List */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">All Surahs</h3>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSurahs?.map((surah) => (
                <Link key={surah.number} href={`/surah/${surah.number}`}>
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/50 hover:bg-card/80 transition-all cursor-pointer group"
                  >
                    <div className="relative w-10 h-10 flex items-center justify-center">
                      <div className="absolute inset-0 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors rotate-45" />
                      <span className="text-sm font-bold text-primary relative z-10">{surah.number}</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {surah.englishName}
                        </h4>
                        <span className="font-arabic text-lg text-muted-foreground group-hover:text-foreground transition-colors">
                          {surah.name}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {surah.englishNameTranslation} • {surah.numberOfAyahs} Ayahs
                      </p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
