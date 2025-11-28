import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { LogOut, CheckCircle, XCircle, Shield } from "lucide-react";
import type { AdminDevice } from "@shared/schema";

export default function ApprovalPanel() {
  const [pendingDevices, setPendingDevices] = useState<AdminDevice[]>([]);
  const [authorizedDevices, setAuthorizedDevices] = useState<AdminDevice[]>([]);
  const [isLoadingPending, setIsLoadingPending] = useState(true);
  const [isLoadingAuthorized, setIsLoadingAuthorized] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check if admin is logged in
    const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
    if (!isLoggedIn) {
      setLocation("/admin/login");
      return;
    }
    fetchPendingDevices();
    fetchAuthorizedDevices();
  }, [setLocation]);

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

  const handleApproveDevice = async (deviceId: number) => {
    try {
      const response = await fetch(`/api/admin/approve-device/${deviceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!response.ok) throw new Error("Cihaz onaylanamadı");
      
      toast({
        title: "Başarılı",
        description: "Cihaz onaylandı. Kullanıcı veritabanına erişebilir.",
      });
      fetchPendingDevices();
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

  const handleLogout = async () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminId");
    localStorage.removeItem("deviceFingerprint");
    localStorage.removeItem("deviceId");
    toast({
      title: "Çıkış Yapıldı",
      description: "Admin hesabından çıkış yapıldı.",
    });
    setTimeout(() => {
      setLocation("/admin");
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Onay Paneli</h1>
            <p className="text-muted-foreground mt-2">Veritabanı erişimi için cihazları onaylayın veya reddedin</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="gap-2"
            data-testid="button-approval-logout"
          >
            <LogOut className="w-4 h-4" />
            Çıkış Yap
          </Button>
        </div>

        {/* Pending Devices Section */}
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Onay Bekleyen Cihazlar</h2>
            <div className="space-y-4">
              {isLoadingPending ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground text-center">Yükleniyor...</p>
                  </CardContent>
                </Card>
              ) : pendingDevices.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground text-center">Onay bekleyen cihaz yok</p>
                  </CardContent>
                </Card>
              ) : (
                pendingDevices.map((device) => (
                  <Card key={device.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{device.deviceName}</CardTitle>
                          <CardDescription>
                            Fingerprint: {device.deviceFingerprint.substring(0, 20)}...
                          </CardDescription>
                        </div>
                        <div className="text-xs text-muted-foreground">
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
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Yetkili Giriş Yönetimi
            </h2>
            <Card>
              <CardHeader>
                <CardDescription>
                  Yetkili erişimi olan cihazları yönetin
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAuthorized ? (
                  <p className="text-muted-foreground text-center py-4">Yükleniyor...</p>
                ) : authorizedDevices.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Onaylı cihaz yok</p>
                ) : (
                  <div className="space-y-3">
                    {authorizedDevices.map((device) => (
                      <div
                        key={device.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-sm">{device.deviceName}</p>
                          <p className="text-xs text-muted-foreground">
                            Oluşturulma: {new Date(device.createdAt).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">
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
        </div>
      </div>
    </div>
  );
}
