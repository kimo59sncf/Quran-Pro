import { Link, useLocation } from "wouter";
import { BookOpen, Headphones, Trophy, Settings, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: BookOpen, label: "Read" },
    { href: "/reciters", icon: Headphones, label: "Listen" },
    { href: "/favorites", icon: Heart, label: "Cœur" },
    { href: "/memorize", icon: Trophy, label: "Memorize" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}>
              <item.icon className={cn("w-6 h-6", isActive && "fill-current/20")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
