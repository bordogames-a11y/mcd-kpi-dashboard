import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Shield, ArrowLeft, Copy, Check } from "lucide-react";
import { generateDeviceFingerprint, getDeviceName } from "@/lib/deviceFingerprint";

export default function AdminAddDevice() {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<{ fingerprint: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminId.trim() || !password.trim()) {
      toast({
        title: "Hata",
        description: "Admin ID ve şifre gereklidir.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const fingerprint = generateDeviceFingerprint();
      const deviceName = getDeviceName();

      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          adminId, 
          password, 
          deviceFingerprint: fingerprint,
          deviceName 
        }),
      });

      if (!response.ok) {
        throw new Error("Giriş başarısız");
      }

      const data = await response.json();
      
      if (!data.device.isApproved) {
        setDeviceInfo({ fingerprint, name: deviceName });
        toast({
          title: "Başarılı",
          description: "Cihaz kaydedildi. Lütfen yöneticiden onay bekleyin.",
        });
      } else {
        localStorage.setItem("adminLoggedIn", "true");
        localStorage.setItem("adminId", adminId);
        localStorage.setItem("deviceFingerprint", fingerprint);
        localStorage.setItem("deviceId", data.device.id);
        toast({
          title: "Başarılı",
          description: "Cihaz onaylandı. Admin paneline yönlendiriliyorsunuz.",
        });
        setLocation("/admin/panel");
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Admin ID veya şifre yanlış, veya cihaz kaydedilemedi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyFingerprint = () => {
    if (deviceInfo) {
      navigator.clipboard.writeText(deviceInfo.fingerprint);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-500" />
            <CardTitle>Güvenli Cihaz Ekle</CardTitle>
          </div>
          <CardDescription>Bu cihazı yetkilendirilmiş cihaz olarak kaydedin</CardDescription>
        </CardHeader>
        <CardContent>
          {!deviceInfo ? (
            <form onSubmit={handleAddDevice} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin ID</label>
                <Input
                  placeholder="Admin ID"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  disabled={isLoading}
                  data-testid="input-device-admin-id"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Şifre</label>
                <Input
                  type="password"
                  placeholder="Şifre"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  data-testid="input-device-password"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
                data-testid="button-add-device-submit"
              >
                {isLoading ? "Cihaz kaydediliyor..." : "Cihazı Kaydet"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-800 dark:text-green-200">
                  ✓ Cihaz kaydedildi. Yöneticiden onay beklemektedir.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cihaz Bilgisi</label>
                <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
                  <p className="text-muted-foreground">Adı: <span className="font-semibold text-foreground">{deviceInfo.name}</span></p>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground truncate">ID: <span className="font-mono text-xs">{deviceInfo.fingerprint}</span></span>
                    <button
                      type="button"
                      onClick={handleCopyFingerprint}
                      className="ml-2 p-1 hover:bg-secondary rounded transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
                <p className="text-blue-800 dark:text-blue-200">
                  Cihaz kaydınız yöneticiye gönderildi. Onay alınca otomatik olarak panele erişebileceksiniz.
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t">
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setLocation("/admin")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Admin Portalına Dön
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
