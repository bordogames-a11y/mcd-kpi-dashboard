import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, UserPlus, Shield, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPortal() {
  const [, setLocation] = useLocation();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(localStorage.getItem("adminLoggedIn") === "true");
  const adminId = localStorage.getItem("adminId");
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Shield className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Giriş Portalı</h1>
          <p className="text-slate-400">Sistem erişimi için aşağıdan seçim yapın</p>
        </div>

        <div className="space-y-4">
          {/* Yetkili Login Card */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/yetkili/login")}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <div>
                  <CardTitle>Yetkili Giriş</CardTitle>
                  <CardDescription>Onay paneli erişimi</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full gap-2"
                data-testid="button-yetkili-giris"
              >
                <Shield className="w-4 h-4" />
                Giriş Yap
              </Button>
            </CardContent>
          </Card>

          {/* Admin Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Admin Login Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/admin/login")}>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-5 h-5 text-blue-500" />
                  <CardTitle>Yönetici Giriş</CardTitle>
                </div>
                <CardDescription>
                  Mevcut yönetici hesabı ile giriş yapın
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" data-testid="button-portal-login">
                  Giriş Yap
                </Button>
              </CardContent>
            </Card>

            {/* Admin Registration Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/admin/register")}>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <UserPlus className="w-5 h-5 text-green-500" />
                  <CardTitle>Yönetici Kayıt</CardTitle>
                </div>
                <CardDescription>
                  Yeni bir yönetici hesabı oluşturun
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" data-testid="button-portal-register">
                  Kayıt Ol
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
