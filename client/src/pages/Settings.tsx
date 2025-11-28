import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import bgImage from "@assets/generated_images/modern_clean_corporate_restaurant_dashboard_background_texture.png";
import { Download, Globe, AlertCircle, FileText, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

export default function Settings() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState("tr");
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentVersion, setCurrentVersion] = useState("1.0.0");
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [changelog, setChangelog] = useState<string | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load current version from localStorage
    const storedVersion = localStorage.getItem("appVersion") || "1.0.0";
    setCurrentVersion(storedVersion);
    
    // Check for updates with the current version
    checkForUpdatesWithVersion(storedVersion);
  }, []);

  const checkForUpdatesWithVersion = async (version: string) => {
    try {
      const response = await fetch("/api/version");
      if (response.ok) {
        const data = await response.json();
        setLatestVersion(data.version);
        setChangelog(data.changelog);
        const isUpdateAvailable = data.version !== version;
        setUpdateAvailable(isUpdateAvailable);
        
        if (!isUpdateAvailable) {
          toast({
            title: "Güncel",
            description: "Yazılım zaten en son sürümde.",
          });
        } else {
          toast({
            title: "Güncelleme Mevcut",
            description: `Yeni sürüm v${data.version} mevcut.`,
          });
        }
      }
    } catch (error) {
      console.error("Failed to check for updates:", error);
      toast({
        title: "Hata",
        description: "Güncelleme kontrolü yapılamadı.",
        variant: "destructive",
      });
    }
  };

  const checkForUpdates = async () => {
    checkForUpdatesWithVersion(currentVersion);
  };

  const handleShowUpdateDialog = () => {
    setShowUpdateDialog(true);
  };

  const handleConfirmUpdate = async () => {
    setShowUpdateDialog(false);
    setIsUpdating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update current version to latest and save to localStorage
      if (latestVersion) {
        setCurrentVersion(latestVersion);
        localStorage.setItem("appVersion", latestVersion);
      }
      
      // Clear cache for fresh load
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      // Perform hard refresh
      window.location.href = window.location.href;
      
      toast({
        title: "Başarılı",
        description: "Yazılım güncellendi. Sayfa yenileniyor...",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Güncelleme yapılamadı.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    toast({
      title: "Başarılı",
      description: `Dil ${value === 'tr' ? 'Türkçe' : 'English'} olarak ayarlandı.`,
    });
  };

  const handleThemeChange = (value: string) => {
    setTheme(value);
    const themeLabel = value === 'dark' ? 'Koyu' : value === 'light' ? 'Açık' : 'Sistem';
    toast({
      title: "Başarılı",
      description: `Tema ${themeLabel} olarak ayarlandı.`,
    });
  };

  return (
    <div className="min-h-screen bg-background flex font-sans">
      <Sidebar />
      
      <main className="flex-1 md:ml-64 relative">
        <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
          <img src={bgImage} className="w-full h-full object-cover opacity-20" alt="" />
        </div>

        <div className="relative z-10 p-8 space-y-8">
          {/* Update Available Notification */}
          {updateAvailable && latestVersion && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-amber-900 dark:text-amber-200">Güncelleme Mevcut (v{latestVersion})</h3>
                <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                  Yeni bir güncelleme mevcut. En iyi performans için lütfen şimdi güncelleyin.
                </p>
              </div>
            </div>
          )}

          <header>
            <h2 className="text-3xl font-heading font-bold text-foreground tracking-tight">
              Ayarlar
            </h2>
            <p className="text-muted-foreground mt-1">
              Sistem ayarlarını ve tercihlerinizi yönetin.
            </p>
          </header>

          <div className="max-w-2xl space-y-6">
            {/* Theme Settings Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="w-5 h-5" />
                  Tema
                </CardTitle>
                <CardDescription>
                  Uygulama temasını seçin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tema Modu</label>
                  {mounted && (
                    <Select value={theme || 'light'} onValueChange={handleThemeChange}>
                      <SelectTrigger data-testid="select-theme">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Açık</SelectItem>
                        <SelectItem value="dark">Koyu</SelectItem>
                        <SelectItem value="system">Sistem Ayarı</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {theme === 'system' 
                    ? 'Tema, işletim sisteminizin ayarlarına göre belirlenecektir.'
                    : theme === 'dark'
                    ? "Arayüz koyu mod'da gösterilecektir."
                    : "Arayüz açık mod'da gösterilecektir."}
                </p>
              </CardContent>
            </Card>

            {/* Software Update Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Yazılım Güncellemesi
                </CardTitle>
                <CardDescription>
                  Uygulamayı en son sürüme güncelleyin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-semibold text-sm">Mevcut Sürüm</p>
                    <p className="text-xs text-muted-foreground">v{currentVersion}</p>
                    {latestVersion && latestVersion !== currentVersion && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        Yeni: v{latestVersion}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleShowUpdateDialog}
                    disabled={isUpdating || !updateAvailable}
                    className="gap-2"
                    data-testid="button-software-update"
                  >
                    <Download className="w-4 h-4" />
                    {isUpdating ? "Güncelleniyor..." : updateAvailable ? "Güncelle" : "Güncel"}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <p className="text-xs text-muted-foreground flex-1">
                    Güncellemeler otomatik olarak kontrol edilir. En son özellikleri ve güvenlik yamaları alın.
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={checkForUpdates}
                    className="gap-1"
                  >
                    Kontrol Et
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Language Settings Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Dil Seçimi
                </CardTitle>
                <CardDescription>
                  Uygulama dilini seçin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dil</label>
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tr">Türkçe</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                  Seçili dil uygulamayı yenilediğinizde etkinleşecektir.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Update Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Güncelleme Notları (v{latestVersion})
            </DialogTitle>
            <DialogDescription>
              Güncellemeyi başlatmadan önce değişiklikleri gözden geçirin
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-muted/50 rounded-lg p-4 max-h-64 overflow-y-auto">
            {changelog ? (
              <p className="text-sm text-foreground whitespace-pre-wrap">{changelog}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Değişim notları mevcut değil</p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowUpdateDialog(false)}
              disabled={isUpdating}
            >
              İptal
            </Button>
            <Button
              onClick={handleConfirmUpdate}
              disabled={isUpdating}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              {isUpdating ? "Güncelleniyor..." : "Şimdi Güncelle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
