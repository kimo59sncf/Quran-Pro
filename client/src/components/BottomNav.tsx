import { Link, useLocation } from "wouter";
import { BookOpen, Headphones, Trophy, Settings, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: BookOpen, label: "Read", color: "text-blue-500", activeColor: "text-blue-600", fillColor: "fill-blue-500/20" },
    { href: "/reciters", icon: Headphones, label: "Listen", color: "text-purple-500", activeColor: "text-purple-600", fillColor: "fill-purple-500/20" },
    { href: "/favorites", icon: Heart, label: "Cœur", color: "text-red-500", activeColor: "text-red-600", fillColor: "fill-red-500/20" },
    { href: "/memorize", icon: Trophy, label: "Memorize", color: "text-amber-500", activeColor: "text-amber-600", fillColor: "fill-amber-500/20" },
    { href: "/settings", icon: Settings, label: "Settings", color: "text-emerald-500", activeColor: "text-emerald-600", fillColor: "fill-emerald-500/20" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200",
              isActive ? item.activeColor : item.color
            )}>
              <item.icon className={cn("w-6 h-6", isActive && item.fillColor)} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
