import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNav } from "@/components/BottomNav";
import { AudioPlayer } from "@/components/AudioPlayer";

import Home from "@/pages/Home";
import SurahDetail from "@/pages/SurahDetail";
import Reciters from "@/pages/Reciters";
import Favorites from "@/pages/Favorites";
import Memorize from "@/pages/Memorize";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/surah/:id" component={SurahDetail} />
      <Route path="/reciters" component={Reciters} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/memorize" component={Memorize} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background font-sans antialiased text-foreground">
          <Router />
          <AudioPlayer />
          <BottomNav />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
