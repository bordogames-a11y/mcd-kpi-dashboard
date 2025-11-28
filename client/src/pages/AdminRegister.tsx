import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { UserPlus, ArrowLeft } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminRegister() {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminId.trim() || !password.trim() || !confirmPassword.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun.",
        variant: "destructive",
      });
      return;
    }

    if (adminId.length < 3) {
      toast({
        title: "Hata",
        description: "Admin ID en az 3 karakter olmalıdır.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Hata",
        description: "Şifre en az 6 karakter olmalıdır.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Hata",
        description: "Şifreler eşleşmiyor.",
        variant: "destructive",
      });
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Kayıt başarısız");
      }

      toast({
        title: "Başarılı",
        description: "Admin hesabı oluşturuldu. Giriş yapabilirsiniz.",
      });
      setLocation("/admin/login");
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Kayıt yapılamadı.",
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
            <UserPlus className="w-5 h-5 text-primary" />
            <CardTitle>Admin Kaydı</CardTitle>
          </div>
          <CardDescription>Yeni bir admin hesabı oluşturun</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin ID</label>
              <Input
                placeholder="Admin ID"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                disabled={isLoading}
                data-testid="input-register-admin-id"
              />
              <p className="text-xs text-muted-foreground">En az 3 karakter</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Şifre</label>
              <Input
                type="password"
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                data-testid="input-register-password"
              />
              <p className="text-xs text-muted-foreground">En az 6 karakter</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Şifre Onayı</label>
              <Input
                type="password"
                placeholder="Şifre Onayı"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                data-testid="input-register-confirm-password"
              />
              <p className="text-xs text-muted-foreground">Şifrenizi tekrar girin</p>
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              data-testid="button-admin-register"
            >
              {isLoading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t space-y-3">
            <p className="text-sm text-muted-foreground">Zaten bir hesabınız var mı?</p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setLocation("/admin/login")}
              data-testid="button-go-login"
            >
              Giriş Yap
            </Button>
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

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kayıt Onayı</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-4">
            <p className="text-sm">Aşağıdaki bilgilerle kayıt yapmak istediğinizi onaylayın:</p>
            <div className="bg-muted p-3 rounded-md space-y-2">
              <div><span className="font-medium">Admin ID:</span> {adminId}</div>
              <div><span className="font-medium">Şifre:</span> {"•".repeat(password.length)}</div>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel disabled={isLoading}>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isLoading} data-testid="button-confirm-register">
              {isLoading ? "Kayıt yapılıyor..." : "Kayıt Yap"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
