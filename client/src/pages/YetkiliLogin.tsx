import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Lock, ArrowLeft } from "lucide-react";
import { generateDeviceFingerprint, getDeviceName } from "@/lib/deviceFingerprint";

export default function YetkiliLogin() {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId.trim() || !password.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun.",
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
        body: JSON.stringify({ adminId, password, deviceFingerprint: fingerprint, deviceName }),
      });

      if (!response.ok) {
        throw new Error("Giriş başarısız");
      }

      const data = await response.json();

      if (!data.admin.yetkiliApproved) {
        toast({
          title: "Yetkili Onay Beklemede",
          description: "Bu hesap henüz yetkili olarak onaylanmamış. Lütfen yöneticiden onay bekleyin.",
          variant: "destructive",
        });
        return;
      }

      if (!data.device.isApproved) {
        toast({
          title: "Yeni Cihaz Eklendi",
          description: "Bu cihaz sisteme eklenmiştir. Giriş yapmak için yöneticiden onay beklemeniz gerekmektedir.",
          variant: "destructive",
        });
        return;
      }

      localStorage.setItem("adminLoggedIn", "true");
      localStorage.setItem("adminId", adminId);
      localStorage.setItem("deviceFingerprint", fingerprint);
      localStorage.setItem("deviceId", data.device.id);
      toast({
        title: "Başarılı",
        description: "Yetkili paneline yönlendiriliyorsunuz.",
      });
      setLocation("/yetkili/dashboard");
    } catch (error) {
      toast({
        title: "Hata",
        description: "Admin ID veya şifre yanlış.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            <CardTitle>Yetkili Girişi</CardTitle>
          </div>
          <CardDescription>Onay paneline erişim için giriş yapın</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin ID</label>
              <Input
                placeholder="Admin ID"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                disabled={isLoading}
                data-testid="input-yetkili-id"
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
                data-testid="input-yetkili-password"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              data-testid="button-yetkili-login"
            >
              {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t space-y-3">
            <p className="text-sm text-muted-foreground">Admin hesabınız yok mu?</p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setLocation("/admin/register")}
              data-testid="button-yetkili-register"
            >
              Kayıt Ol
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Yönetici Portalına Dön
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
