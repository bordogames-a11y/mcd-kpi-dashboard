import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { KPICard } from "@/components/dashboard/KPICard";
import { KPITable } from "@/components/dashboard/KPITable";
import { KPIChart } from "@/components/dashboard/KPIChart";
import { useKPIs } from "@/context/KPIContext";
import { useLocation } from "wouter";
import bgImage from "@assets/generated_images/modern_clean_corporate_restaurant_dashboard_background_texture.png";
import { Button } from "@/components/ui/button";
import { Plus, Send, Save } from "lucide-react";
import { EditKPIDialog } from "@/components/dashboard/EditKPIDialog";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [location] = useLocation();
  const { kpis, resetDailyValues } = useKPIs();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isReportReady, setIsReportReady] = useState(false);
  const [isReportSent, setIsReportSent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const shouldReset = localStorage.getItem("shouldResetKPIs");
    if (shouldReset === "true") {
      resetDailyValues();
      localStorage.removeItem("shouldResetKPIs");
    }
  }, [resetDailyValues]);
  
  // Simple routing mapping
  // / -> All (Genel Bakış)
  // /operasyon -> Operasyon
  // /mutfak -> Mutfak
  // ...
  
  const getCategoryFromPath = (path: string) => {
    if (path === '/operasyon') return 'Operasyon';
    if (path === '/personel') return 'Personel';
    return null; // All
  };

  const currentCategory = getCategoryFromPath(location);
  
  const filteredData = currentCategory 
    ? kpis.filter(d => d.category === currentCategory)
    : kpis;

  // Group for "Genel Bakış" - show top items from each category if "All" is selected
  // For "Genel Bakış", let's just show the first 8 to fill 2 rows of cards if available, or just all of them.
  const overviewData = !currentCategory 
    ? kpis.filter((_, i) => i % 5 === 0 || i % 5 === 1) // Still sampling for variety in "Overview" cards
    : filteredData;

  const handleSendReport = () => {
    setIsReportReady(true);
  };

  const handleSaveReport = async () => {
    if (isReportSent) {
      toast({
        title: "Uyarı",
        description: "Bu rapor zaten gönderildi.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const validKpis = kpis.filter(kpi => kpi.target !== 0);
      const totalKpis = validKpis.length;
      const successfulKpis = validKpis.filter(d => (d.actual - d.target) >= 0).length;
      const successRate = totalKpis > 0 ? Math.round((successfulKpis / totalKpis) * 100) : 0;

      const kpiDetails = kpis.map(kpi => ({
        id: kpi.id,
        name: kpi.name,
        category: kpi.category,
        target: kpi.target,
        actual: kpi.actual,
        unit: kpi.unit,
        status: kpi.target === 0 ? "neutral" : (kpi.actual - kpi.target) >= 0 ? "success" : "failed",
        percentage: kpi.target > 0 ? Math.round((kpi.actual / kpi.target) * 100) : 0,
      }));

      const response = await fetch("/api/reports/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportDate: new Date().toISOString(),
          snapshot: {
            kpis: kpiDetails,
            sentBy: "Admin",
            sentAt: new Date().toISOString(),
          },
          totalKpis,
          successfulKpis,
          successRate,
        }),
      });

      if (!response.ok) throw new Error("Rapor kaydedilemedi");

      setIsReportSent(true);
      setIsReportReady(false);
      toast({
        title: "Başarılı",
        description: "Rapor Gönderildi.",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Rapor kaydedilirken hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex font-sans">
      <Sidebar />
      
      <main className="flex-1 md:ml-64 relative">
        {/* Decorative Background */}
        <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
           <img src={bgImage} className="w-full h-full object-cover opacity-20" alt="" />
        </div>

        <div className="relative z-10 p-8 space-y-8">
          
          {/* Header */}
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-heading font-bold text-foreground tracking-tight">
                {currentCategory ? currentCategory : "Genel Bakış"}
              </h2>
              <p className="text-muted-foreground mt-1">
                {currentCategory ? `${currentCategory} departmanı performans raporları ve hedefleri.` : "Tüm departmanların performans özeti."}
              </p>
            </div>
            <div className="flex items-center gap-4">
               <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-card px-4 py-2 rounded-full border shadow-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
              </div>
              {!isReportReady && !isReportSent && (
                <Button onClick={handleSendReport} variant="outline" className="gap-2 shadow-lg" data-testid="button-send-report">
                  <Send className="w-4 h-4" />
                  Rapor Gönder
                </Button>
              )}
              <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2 shadow-lg">
                <Plus className="w-4 h-4" />
                Yeni KPI Ekle
              </Button>
            </div>
          </header>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {overviewData.slice(0, 4).map((kpi) => (
              <KPICard key={kpi.id} kpi={kpi} />
            ))}
          </div>

          {/* Chart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2">
               <KPIChart data={currentCategory ? filteredData : overviewData.slice(0, 5)} />
             </div>
             <div className="lg:col-span-1">
                <div className="h-full bg-primary/5 rounded-xl border border-primary/10 p-6 flex flex-col justify-center items-center text-center backdrop-blur-sm">
                    <h4 className="text-lg font-heading font-bold text-primary mb-2">Hedef Durumu</h4>
                    <div className="text-5xl font-bold mb-2 tracking-tighter">
                      {(() => {
                        const validKPIs = filteredData.filter(d => d.target !== 0);
                        const successfulKPIs = validKPIs.filter(d => (d.actual - d.target) >= 0).length;
                        return validKPIs.length > 0
                          ? Math.round((successfulKPIs / validKPIs.length) * 100)
                          : 0;
                      })()}%
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">KPI Başarı Oranı</p>
                    
                    <div className="mt-6 grid grid-cols-2 gap-4 w-full">
                       <div className="bg-background/50 p-3 rounded-lg border text-center">
                         <div className="text-xl font-bold text-green-600">{(() => {
                          const validKPIs = filteredData.filter(d => d.target !== 0);
                          return validKPIs.filter(d => (d.actual - d.target) >= 0).length;
                        })()}</div>
                         <div className="text-xs text-muted-foreground">Başarılı</div>
                       </div>
                       <div className="bg-background/50 p-3 rounded-lg border text-center">
                         <div className="text-xl font-bold text-red-600">{(() => {
                          const validKPIs = filteredData.filter(d => d.target !== 0);
                          return validKPIs.filter(d => (d.actual - d.target) < -10).length;
                        })()}</div>
                         <div className="text-xs text-muted-foreground">Kritik</div>
                       </div>
                    </div>
                </div>
             </div>
          </div>

          {/* Main Content Area */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-heading font-semibold">Detaylı Rapor</h3>
            </div>
            
            <KPITable data={filteredData} />

            {isReportReady && !isReportSent && (
              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button 
                  onClick={() => setIsReportReady(false)} 
                  variant="outline"
                  data-testid="button-cancel-report"
                >
                  İptal
                </Button>
                <Button 
                  onClick={handleSaveReport} 
                  disabled={isSaving}
                  className="gap-2"
                  data-testid="button-save-report"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              </div>
            )}

            {isReportSent && (
              <div className="flex justify-end pt-6 border-t">
                <div className="text-sm text-green-600 bg-green-50 px-4 py-2 rounded-md dark:bg-green-900/20">
                  ✓ Rapor başarıyla gönderildi
                </div>
              </div>
            )}
          </div>

        </div>
      </main>

      <EditKPIDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        defaultCategory={currentCategory || undefined}
      />
    </div>
  );
}
