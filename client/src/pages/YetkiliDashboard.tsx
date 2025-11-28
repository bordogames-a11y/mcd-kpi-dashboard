import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { LogOut, TrendingUp, CheckCircle, XCircle, Shield, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { KPI, DailyReport, AdminDevice } from "@shared/schema";
import { KPICard } from "@/components/dashboard/KPICard";

export default function YetkiliDashboard() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [pendingDevices, setPendingDevices] = useState<AdminDevice[]>([]);
  const [authorizedDevices, setAuthorizedDevices] = useState<AdminDevice[]>([]);
  const [isLoadingKpis, setIsLoadingKpis] = useState(true);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [isLoadingPending, setIsLoadingPending] = useState(true);
  const [isLoadingAuthorized, setIsLoadingAuthorized] = useState(true);
  const [newVersion, setNewVersion] = useState("");
  const [newChangelog, setNewChangelog] = useState("");
  const [versions, setVersions] = useState<any[]>([]);
  const [isUpdatingVersion, setIsUpdatingVersion] = useState(false);
  const [isLoadingVersions, setIsLoadingVersions] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const fetchKPIs = async () => {
    try {
      setIsLoadingKpis(true);
      const response = await fetch("/api/kpis");
      if (!response.ok) throw new Error("KPI'lar yüklenemedi");
      const data = await response.json();
      setKpis(data);
    } catch (error) {
      toast({
        title: "Hata",
        description: "KPI'lar yüklenirken hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingKpis(false);
    }
  };

  const fetchReports = async () => {
    try {
      setIsLoadingReports(true);
      const response = await fetch("/api/reports/daily?limit=30");
      if (!response.ok) throw new Error("Raporlar yüklenemedi");
      const data = await response.json();
      setReports(data.reverse()); // Show newest first
    } catch (error) {
      toast({
        title: "Hata",
        description: "Raporlar yüklenirken hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingReports(false);
    }
  };

  const fetchPendingDevices = async () => {
    try {
      setIsLoadingPending(true);
      const response = await fetch("/api/admin/pending-devices");
      if (!response.ok) throw new Error("Cihazlar yüklenemedi");
      const data = await response.json();
      setPendingDevices(data);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Cihazlar yüklenirken hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPending(false);
    }
  };

  const fetchAuthorizedDevices = async () => {
    try {
      setIsLoadingAuthorized(true);
      const response = await fetch("/api/admin/all-devices");
      if (!response.ok) throw new Error("Cihazlar yüklenemedi");
      const data = await response.json();
      setAuthorizedDevices(data);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Cihazlar yüklenirken hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAuthorized(false);
    }
  };

  useEffect(() => {
    // Check if admin is logged in
    const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
    if (!isLoggedIn) {
      setLocation("/yetkili/login");
      return;
    }
    fetchKPIs();
    fetchReports();
    fetchPendingDevices();
    fetchAuthorizedDevices();
    fetchVersions();
  }, [setLocation]);

  const fetchVersions = async () => {
    try {
      setIsLoadingVersions(true);
      const response = await fetch("/api/admin/versions");
      if (!response.ok) throw new Error("Sürümler yüklenemedi");
      const data = await response.json();
      setVersions(data);
    } catch (error) {
      console.error("Failed to fetch versions:", error);
    } finally {
      setIsLoadingVersions(false);
    }
  };

  const handleApproveDevice = async (deviceId: number) => {
    try {
      const response = await fetch(`/api/admin/approve-device/${deviceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!response.ok) throw new Error("Cihaz onaylanamadı");
      
      toast({
        title: "Başarılı",
        description: "Cihaz onaylandı.",
      });
      fetchPendingDevices();
      fetchAuthorizedDevices();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Cihaz onaylanırken hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleRejectDevice = async (deviceId: number) => {
    try {
      const response = await fetch(`/api/admin/reject-device/${deviceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!response.ok) throw new Error("Cihaz reddedilemedi");
      
      toast({
        title: "Başarılı",
        description: "Cihaz reddedildi.",
      });
      fetchPendingDevices();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Cihaz reddedilirken hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleAuthorizationToggle = async (deviceId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/update-device-authorization/${deviceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAuthorized: !currentStatus }),
      });

      if (!response.ok) throw new Error("Güncelleme başarısız");

      const result = await response.json();
      setAuthorizedDevices(authorizedDevices.map(device => device.id === deviceId ? result.device : device));
      toast({
        title: "Başarılı",
        description: !currentStatus ? "Yetkili erişimi onaylandı." : "Yetkili erişimi iptal edildi.",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Güncelleme yapılamadı.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReport = async (reportId: number) => {
    try {
      const response = await fetch(`/api/reports/daily/${reportId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Rapor silinemedi");

      toast({
        title: "Başarılı",
        description: "Rapor silindi.",
      });
      fetchReports();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Rapor silinirken hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleCreateTestReport = async () => {
    try {
      const totalKpis = kpis.length;
      const successfulKpis = Math.floor(totalKpis * 0.8);
      const successRate = totalKpis > 0 ? Math.round((successfulKpis / totalKpis) * 100) : 0;

      const response = await fetch("/api/reports/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportDate: new Date().toISOString(),
          snapshot: {},
          totalKpis,
          successfulKpis,
          successRate,
        }),
      });

      if (!response.ok) throw new Error("Rapor oluşturulamadı");

      toast({
        title: "Başarılı",
        description: "Test raporu oluşturuldu.",
      });
      fetchReports();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Rapor oluşturulurken hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminId");
    localStorage.removeItem("deviceFingerprint");
    localStorage.removeItem("deviceId");
    setLocation("/yetkili/login");
  };

  const operasyonKPIs = kpis.filter((kpi) => kpi.category === "Operasyon");
  const personelKPIs = kpis.filter((kpi) => kpi.category === "Personel");

  const handleCreateVersion = async () => {
    if (!newVersion.trim()) {
      toast({
        title: "Hata",
        description: "Sürüm boş olamaz.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingVersion(true);
    try {
      const response = await fetch("/api/admin/versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version: newVersion, changelog: newChangelog || undefined }),
      });

      if (!response.ok) throw new Error("Sürüm oluşturulamadı");

      toast({
        title: "Başarılı",
        description: `Sürüm v${newVersion} taslak olarak oluşturuldu.`,
      });
      setNewVersion("");
      setNewChangelog("");
      fetchVersions();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Sürüm oluşturulurken hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingVersion(false);
    }
  };

  const handlePublishVersion = async (versionId: number) => {
    try {
      const response = await fetch(`/api/admin/versions/${versionId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Sürüm yayınlanamadı");

      const publishedData = await response.json();
      
      // Save published version to localStorage for settings page
      localStorage.setItem("appVersion", publishedData.version.version);

      toast({
        title: "Başarılı",
        description: "Sürüm yayınlandı ve kullanıcılara sunuldu.",
      });
      fetchVersions();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Sürüm yayınlanırken hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteVersion = async (versionId: number) => {
    try {
      const response = await fetch(`/api/admin/versions/${versionId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Sürüm silinemedi");

      toast({
        title: "Başarılı",
        description: "Sürüm silindi.",
      });
      fetchVersions();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Sürüm silinirken hata oluştu.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Yetkili Paneli</h1>
            <p className="text-slate-400 mt-2">Pano ve Rapor Özeti</p>
          </div>
          <Button variant="outline" onClick={handleLogout} data-testid="button-yetkili-logout">
            <LogOut className="w-4 h-4 mr-2" />
            Çıkış Yap
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full max-w-4xl grid-cols-4 mb-8">
            <TabsTrigger value="dashboard" data-testid="tab-yetkili-dashboard">
              Pano
            </TabsTrigger>
            <TabsTrigger value="reports" data-testid="tab-yetkili-reports">
              Raporlar
            </TabsTrigger>
            <TabsTrigger value="approvals" data-testid="tab-yetkili-approvals">
              Onaylar
            </TabsTrigger>
            <TabsTrigger value="updates" data-testid="tab-yetkili-updates">
              Güncellemeler
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Operasyon Section */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Operasyon KPI'ları</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoadingKpis ? (
                  <div className="text-slate-400">Yükleniyor...</div>
                ) : operasyonKPIs.length === 0 ? (
                  <div className="text-slate-400">KPI bulunmamaktadır.</div>
                ) : (
                  operasyonKPIs.map((kpi) => (
                    <KPICard
                      key={kpi.id}
                      kpi={kpi}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Personel Section */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Personel KPI'ları</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoadingKpis ? (
                  <div className="text-slate-400">Yükleniyor...</div>
                ) : personelKPIs.length === 0 ? (
                  <div className="text-slate-400">KPI bulunmamaktadır.</div>
                ) : (
                  personelKPIs.map((kpi) => (
                    <KPICard
                      key={kpi.id}
                      kpi={kpi}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Monthly KPI Summary */}
            {(() => {
              const monthlyKpis = kpis.filter(kpi => kpi.period === "Aylık");
              return monthlyKpis.length > 0 ? (
                <div className="space-y-4 mt-8">
                  <h2 className="text-xl font-bold text-white">Aylık KPI'lar Özeti</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {monthlyKpis.map((kpi) => {
                      const percentage = kpi.target > 0 ? Math.round((kpi.actual / kpi.target) * 100) : 0;
                      const isSuccess = kpi.target > 0 && percentage >= 100;
                      return (
                        <div key={kpi.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-white">{kpi.name}</h4>
                              <p className="text-sm text-slate-400">{kpi.category}</p>
                            </div>
                            <span className={`text-2xl font-bold ${isSuccess ? 'text-green-400' : 'text-orange-400'}`}>
                              {percentage}%
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Gerçek: {kpi.actual} {kpi.unit || ''}</span>
                              <span className="text-slate-400">Hedef: {kpi.target} {kpi.unit || ''}</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${isSuccess ? 'bg-green-500' : 'bg-orange-500'}`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null;
            })()}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent>
                {isLoadingReports ? (
                  <div className="text-slate-400">Raporlar yükleniyor...</div>
                ) : reports.length === 0 ? (
                  <div className="text-slate-400">Rapor bulunmamaktadır.</div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {reports.map((report) => (
                      <Card key={report.id} className="bg-slate-700 border-slate-600">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                              <div data-testid={`text-report-date-${report.id}`}>
                                <p className="text-sm text-slate-400">Tarih</p>
                                <p className="text-white font-medium">
                                  {new Date(report.reportDate).toLocaleDateString("tr-TR")}
                                </p>
                              </div>
                              <div data-testid={`text-report-total-${report.id}`}>
                                <p className="text-sm text-slate-400">Toplam KPI</p>
                                <p className="text-white font-medium">{report.totalKpis}</p>
                              </div>
                              <div data-testid={`text-report-successful-${report.id}`}>
                                <p className="text-sm text-slate-400">Başarılı</p>
                                <p className="text-green-400 font-medium">{report.successfulKpis}</p>
                              </div>
                              <div data-testid={`text-report-rate-${report.id}`}>
                                <p className="text-sm text-slate-400">Başarı Oranı</p>
                                <p className="text-white font-medium">{report.successRate}%</p>
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteReport(report.id)}
                              data-testid={`button-delete-report-${report.id}`}
                              className="ml-4"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          {typeof report.snapshot === 'object' && report.snapshot && 'kpis' in report.snapshot && (
                            <details className="mt-4 pt-4 border-t border-slate-600">
                              <summary className="text-sm text-slate-300 cursor-pointer hover:text-white">
                                📊 Detaylı Bilgileri Göster
                              </summary>
                              <div className="mt-4 space-y-3 text-sm">
                                {(report.snapshot as any).sentBy && (
                                  <div className="text-slate-400">
                                    <span className="text-slate-300 font-medium">Gönderen:</span> {(report.snapshot as any).sentBy}
                                  </div>
                                )}
                                <div className="space-y-2">
                                  <p className="text-slate-300 font-medium">KPI Detayları:</p>
                                  <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                                    {((report.snapshot as any).kpis || []).map((kpi: any, idx: number) => (
                                      <div key={idx} className="bg-slate-600/50 p-3 rounded border border-slate-500 text-slate-300">
                                        <div className="flex justify-between items-start">
                                          <div className="flex-1">
                                            <p className="font-medium text-white">{kpi.name}</p>
                                            <p className="text-xs text-slate-400">{kpi.category}</p>
                                          </div>
                                          <div className="text-right">
                                            <p className={`font-bold text-lg ${kpi.status === 'success' ? 'text-green-400' : kpi.status === 'failed' ? 'text-red-400' : 'text-slate-400'}`}>
                                              {kpi.percentage}%
                                            </p>
                                            <p className="text-xs text-slate-400">{kpi.actual}{kpi.unit ? '/' + kpi.unit : ''}</p>
                                          </div>
                                        </div>
                                        <div className="flex justify-between text-xs mt-1">
                                          <span>Hedef: {kpi.target}</span>
                                          <span>Gerçek: {kpi.actual}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </details>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Updates Tab */}
          <TabsContent value="updates" className="space-y-6">
            {/* Create New Version */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Yeni Sürüm Oluştur</CardTitle>
                <CardDescription className="text-slate-400">Güncelleme taslağı oluşturun, ardından yayınlayın</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Sürüm Numarası</label>
                  <Input
                    placeholder="Örn: 1.0.1"
                    value={newVersion}
                    onChange={(e) => setNewVersion(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleCreateVersion()}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Değişim Notları (İsteğe Bağlı)</label>
                  <textarea
                    placeholder="Örn: - KPI kartlarında iyileştirmeler&#10;- Rapor sistemi optimize edildi&#10;- Bug düzeltmeler"
                    value={newChangelog}
                    onChange={(e) => setNewChangelog(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-slate-600 bg-slate-700 text-white text-sm resize-none"
                    rows={4}
                  />
                </div>
                <Button
                  onClick={handleCreateVersion}
                  disabled={isUpdatingVersion}
                  className="w-full"
                  data-testid="button-create-version"
                >
                  {isUpdatingVersion ? "Oluşturuluyor..." : "Taslak Oluştur"}
                </Button>
              </CardContent>
            </Card>

            {/* Versions List */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Sürüm Yönetimi</h3>
              {isLoadingVersions ? (
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <p className="text-slate-400 text-center">Yükleniyor...</p>
                  </CardContent>
                </Card>
              ) : versions.length === 0 ? (
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <p className="text-slate-400 text-center">Henüz sürüm oluşturulmadı</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {versions.map((version: any) => (
                    <Card key={version.id} className="bg-slate-800 border-slate-700">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg font-semibold text-white">v{version.version}</h4>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                version.status === "published"
                                  ? "bg-green-500/20 text-green-300"
                                  : "bg-yellow-500/20 text-yellow-300"
                              }`}>
                                {version.status === "published" ? "Yayınlandı" : "Taslak"}
                              </span>
                            </div>
                            {version.changelog && (
                              <p className="text-sm text-slate-400 whitespace-pre-wrap mb-2">{version.changelog}</p>
                            )}
                            <p className="text-xs text-slate-500">
                              {new Date(version.createdAt).toLocaleDateString("tr-TR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            {version.status === "draft" && (
                              <Button
                                onClick={() => handlePublishVersion(version.id)}
                                className="bg-green-600 hover:bg-green-700"
                                size="sm"
                                data-testid={`button-publish-version-${version.id}`}
                              >
                                Yayınla
                              </Button>
                            )}
                            <Button
                              onClick={() => handleDeleteVersion(version.id)}
                              variant="destructive"
                              size="sm"
                              data-testid={`button-delete-version-${version.id}`}
                            >
                              Sil
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Approvals Tab */}
          <TabsContent value="approvals" className="space-y-6">
            {/* Pending Devices Section */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Onay Bekleyen Cihazlar</h2>
              <div className="space-y-4">
                {isLoadingPending ? (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-6">
                      <p className="text-slate-400 text-center">Yükleniyor...</p>
                    </CardContent>
                  </Card>
                ) : pendingDevices.length === 0 ? (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-6">
                      <p className="text-slate-400 text-center">Onay bekleyen cihaz yok</p>
                    </CardContent>
                  </Card>
                ) : (
                  pendingDevices.map((device) => (
                    <Card key={device.id} className="bg-slate-800 border-slate-700">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-white">{device.deviceName}</CardTitle>
                            <CardDescription>
                              Fingerprint: {device.deviceFingerprint.substring(0, 20)}...
                            </CardDescription>
                          </div>
                          <div className="text-xs text-slate-400">
                            {new Date(device.createdAt).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-4">
                          <Button
                            onClick={() => handleApproveDevice(device.id)}
                            className="gap-2"
                            data-testid={`button-approve-device-${device.id}`}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Onayla
                          </Button>
                          <Button
                            onClick={() => handleRejectDevice(device.id)}
                            variant="destructive"
                            className="gap-2"
                            data-testid={`button-reject-device-${device.id}`}
                          >
                            <XCircle className="w-4 h-4" />
                            Reddet
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Authorized Devices Section */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Yetkili Giriş Yönetimi
              </h2>
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardDescription>Yetkili erişimi olan cihazları yönetin</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingAuthorized ? (
                    <p className="text-slate-400 text-center py-4">Yükleniyor...</p>
                  ) : authorizedDevices.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">Onaylı cihaz yok</p>
                  ) : (
                    <div className="space-y-3">
                      {authorizedDevices.map((device) => (
                        <div
                          key={device.id}
                          className="flex items-center justify-between p-4 border border-slate-700 rounded-lg hover:bg-slate-700/50 transition-colors"
                        >
                          <div>
                            <p className="font-semibold text-sm text-white">{device.deviceName}</p>
                            <p className="text-xs text-slate-400">
                              Oluşturulma: {new Date(device.createdAt).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-slate-300">
                              {device.isAuthorized ? "Onaylı" : "Onaysız"}
                            </span>
                            <Switch
                              checked={device.isAuthorized}
                              onCheckedChange={() => handleAuthorizationToggle(device.id, device.isAuthorized)}
                              data-testid={`switch-device-auth-${device.id}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
