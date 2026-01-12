import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Monitor, Type, Trash2, HardDrive, AlertCircle, CheckCircle2, X, Music } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";
import { useDownloads, useDeleteAllDownloads, useDeleteDownload } from "@/hooks/use-downloads";
import { useSurahs } from "@/hooks/use-quran";
import { useReciters } from "@/hooks/use-reciters";
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
import { cn } from "@/lib/utils";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { data: downloads } = useDownloads();
  const { data: surahs } = useSurahs();
  const { data: reciters } = useReciters();
  const deleteAllDownloads = useDeleteAllDownloads();
  const deleteOneDownload = useDeleteDownload();

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

  const handleDeleteOneDownload = (id: number, surahName: string) => {
    deleteOneDownload.mutate(id, {
      onSuccess: () => {
        toast({
          title: "Téléchargement Supprimé",
          description: `${surahName} a été retiré de vos téléchargements.`,
        });
      },
      onError: () => {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer ce téléchargement.",
          variant: "destructive",
        });
      },
    });
  };

  const getSurahName = (surahNumber: number) => {
    return surahs?.find(s => s.number === surahNumber)?.name || `Sourate ${surahNumber}`;
  };

  const getReciterName = (reciterId: string) => {
    return reciters?.find(r => String(r.id) === reciterId)?.name || "Inconnu";
  };

  console.log('=== Settings Page Downloads Debug ===');
  console.log('All downloads:', downloads);
  console.log('Downloads length:', downloads?.length);
  const downloadCount = downloads?.length || 0;
  const completedDownloads = downloads?.filter(d => d.status === "completed").length || 0;
  console.log('Completed downloads count:', completedDownloads);
  console.log('====================================');

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

              {/* Liste des téléchargements */}
              {downloads && downloads.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Téléchargements sauvegardés</Label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {downloads.map((download) => (
                      <div 
                        key={download.id}
                        className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            download.status === "completed" 
                              ? "bg-green-500/10 text-green-500" 
                              : "bg-blue-500/10 text-blue-500"
                          )}>
                            {download.status === "completed" ? (
                              <CheckCircle2 className="w-4 h-4 fill-current" />
                            ) : (
                              <Music className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{getSurahName(download.surahNumber)}</p>
                            <p className="text-xs text-muted-foreground">
                              {getReciterName(download.reciterId)}
                            </p>
                          </div>
                        </div>
                        <button
                          className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive transition-colors"
                          onClick={() => handleDeleteOneDownload(download.id, getSurahName(download.surahNumber))}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    className="w-full gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 border border-destructive-border"
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
