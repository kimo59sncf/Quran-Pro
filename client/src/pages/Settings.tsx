import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Monitor, Type, Trash2, HardDrive, AlertCircle } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";
import { useDownloads, useDeleteAllDownloads } from "@/hooks/use-downloads";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { data: downloads } = useDownloads();
  const deleteAllDownloads = useDeleteAllDownloads();

  const isDarkMode = theme === "dark";

  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
    toast({
      title: "Thème Mis à Jour",
      description: `Basculé en mode ${checked ? "sombre" : "clair"}.`,
    });
  };

  const handleClearCache = () => {
    deleteAllDownloads.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: "Cache Vidé",
          description: "Tous les téléchargements ont été supprimés avec succès.",
        });
      },
      onError: () => {
        toast({
          title: "Erreur",
          description: "Impossible de vider le cache.",
          variant: "destructive",
        });
      },
    });
  };

  const downloadCount = downloads?.length || 0;
  const completedDownloads = downloads?.filter(d => d.status === "completed").length || 0;

  return (
    <div className="min-h-screen bg-background pb-32">
       <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border p-4">
        <h1 className="text-2xl font-bold font-display text-primary">Paramètres</h1>
      </div>

      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary" />
              Apparence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Mode Sombre</Label>
                <p className="text-xs text-muted-foreground">Plus facile pour les yeux lors de la lecture nocturne</p>
              </div>
              <Switch checked={isDarkMode} onCheckedChange={handleThemeChange} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Type className="w-5 h-5 text-primary" />
              Typographie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Taille de Police Arabe</Label>
                <span className="text-xs text-muted-foreground">24px</span>
              </div>
              <Slider defaultValue={[24]} max={40} min={16} step={1} />
              <p className="font-arabic text-right text-2xl mt-4 bg-muted/30 p-4 rounded-lg">
                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
               <div className="flex justify-between">
                <Label>Taille de Police Traduction</Label>
                <span className="text-xs text-muted-foreground">16px</span>
              </div>
              <Slider defaultValue={[16]} max={24} min={12} step={1} />
              <p className="text-base mt-4 bg-muted/30 p-4 rounded-lg">
                Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-primary" />
              Stockage et Cache
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base">Téléchargements</Label>
                  <p className="text-xs text-muted-foreground">
                    {completedDownloads} sourate{completedDownloads > 1 ? 's' : ''} téléchargée{completedDownloads > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{downloadCount}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="w-full gap-2"
                    disabled={downloadCount === 0}
                  >
                    <Trash2 className="w-4 h-4" />
                    Vider le Cache
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-destructive" />
                      Confirmer la Suppression
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action supprimera tous les téléchargements ({downloadCount} élément{downloadCount > 1 ? 's' : ''}).
                      Vous devrez télécharger à nouveau les sourates pour les écouter hors ligne.
                      Cette action est irréversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearCache} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Vider le Cache
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <p className="text-xs text-muted-foreground text-center">
                Vider le cache libère de l'espace de stockage en supprimant les fichiers audio téléchargés.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
