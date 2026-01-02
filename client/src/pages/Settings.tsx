import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Moon, Sun, Monitor, Type } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();

  const handleThemeChange = () => {
    toast({
      title: "Theme Updated",
      description: "Theme preferences saved locally.",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-32">
       <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border p-4">
        <h1 className="text-2xl font-bold font-display text-primary">Settings</h1>
      </div>

      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Dark Mode</Label>
                <p className="text-xs text-muted-foreground">Easier on the eyes for night reading</p>
              </div>
              <Switch defaultChecked onCheckedChange={handleThemeChange} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Type className="w-5 h-5 text-primary" />
              Typography
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Arabic Font Size</Label>
                <span className="text-xs text-muted-foreground">24px</span>
              </div>
              <Slider defaultValue={[24]} max={40} min={16} step={1} />
              <p className="font-arabic text-right text-2xl mt-4 bg-muted/30 p-4 rounded-lg">
                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
               <div className="flex justify-between">
                <Label>Translation Font Size</Label>
                <span className="text-xs text-muted-foreground">16px</span>
              </div>
              <Slider defaultValue={[16]} max={24} min={12} step={1} />
              <p className="text-base mt-4 bg-muted/30 p-4 rounded-lg">
                In the name of Allah, the Entirely Merciful, the Especially Merciful.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
