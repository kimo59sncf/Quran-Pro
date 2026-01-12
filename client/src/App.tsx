import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { BottomNav } from "@/components/BottomNav";
import { AudioPlayer } from "@/components/AudioPlayer";

import Home from "@/pages/Home";
import Reader from "@/pages/Reader";
import SurahDetail from "@/pages/SurahDetail";
import Reciters from "@/pages/Reciters";
import Favorites from "@/pages/Favorites";
import Memorize from "@/pages/Memorize";
import Settings from "@/pages/Settings";
import Play from "@/pages/Play";
import AudioPlayerPage from "@/pages/AudioPlayerPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Reciters} />
      <Route path="/reader" component={Reader} />
      <Route path="/surah/:id" component={SurahDetail} />
      <Route path="/reciters" component={Reciters} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/memorize" component={Memorize} />
      <Route path="/settings" component={Settings} />
      <Route path="/play" component={Play} />
      <Route path="/audio-player" component={AudioPlayerPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="quran-pro-theme">
        <TooltipProvider>
          <div className="min-h-screen bg-background font-sans antialiased text-foreground">
            <Router />
            <AudioPlayer />
            <BottomNav />
            <Toaster />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
