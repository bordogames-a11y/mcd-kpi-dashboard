import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Download } from "lucide-react";
import type { DailyReport } from "@shared/schema";

export default function AdminPanel() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check if admin is logged in
    const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
    if (!isLoggedIn) {
      setLocation("/admin/login");
      return;
    }
    fetchReports();
  }, [setLocation]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/reports");
      if (!response.ok) throw new Error("Raporlar yüklenemedi");
      const data = await response.json();
      setReports(data);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Raporlar yüklenirken hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminId");
    localStorage.removeItem("deviceFingerprint");
    localStorage.removeItem("deviceId");
    toast({
      title: "Çıkış Yapıldı",
      description: "Admin hesabından çıkış yapıldı.",
    });
    // Use setTimeout to ensure localStorage is cleared before navigation
    setTimeout(() => {
      setLocation("/admin");
    }, 100);
  };

  const handleExportReport = (report: DailyReport) => {
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `report-${new Date(report.reportDate).toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Yönetici Paneli</h1>
            <p className="text-muted-foreground mt-2">Tüm yüklenen raporları görüntüleyin ve yönetin</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="gap-2"
            data-testid="button-admin-logout"
          >
            <LogOut className="w-4 h-4" />
            Çıkış Yap
          </Button>
        </div>

        {/* Reports Section */}
        <Card>
          <CardHeader>
            <CardTitle>Günlük Raporlar</CardTitle>
            <CardDescription>
              Toplam {reports.length} rapor
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Raporlar yükleniyor...</p>
            ) : reports.length === 0 ? (
              <p className="text-muted-foreground">Henüz rapor eklenmedi.</p>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 border rounded-lg space-y-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {new Date(report.reportDate).toLocaleString("tr-TR")}
                        </h3>
                        <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Toplam KPI</p>
                            <p className="font-semibold">{report.totalKpis}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Başarılı KPI</p>
                            <p className="font-semibold text-green-600">{report.successfulKpis}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Başarı Oranı</p>
                            <p className="font-semibold text-blue-600">{report.successRate}%</p>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleExportReport(report)}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        data-testid={`button-export-report-${report.id}`}
                      >
                        <Download className="w-4 h-4" />
                        İndir
                      </Button>
                    </div>
                    <details className="text-sm">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        Detayları Göster
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-64">
                        {JSON.stringify(report.snapshot, null, 2)}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
