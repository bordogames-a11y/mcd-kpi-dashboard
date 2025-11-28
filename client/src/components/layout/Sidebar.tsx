import { cn } from "@/lib/utils";
import { LayoutDashboard, UtensilsCrossed, ChefHat, Users, Settings, LogOut, Menu, Shield } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

import { AlertTriangle } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Genel Bakış", href: "/dashboard" },
  { icon: UtensilsCrossed, label: "Operasyon", href: "/operasyon" },
  { icon: Users, label: "Personel", href: "/personel" },
  { icon: AlertTriangle, label: "Kritik Olanlar", href: "/critical-occasions" },
  { icon: Settings, label: "Ayarlar", href: "/settings" },
  { icon: Shield, label: "Yönetici Panel", href: "/admin" },
];

export function Sidebar() {
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const isAdminLoggedIn = localStorage.getItem("adminLoggedIn") === "true";

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminId");
    localStorage.removeItem("deviceFingerprint");
    localStorage.removeItem("deviceId");
    toast({
      title: "Çıkış Yapıldı",
      description: "Admin hesabından çıkış yapıldı.",
    });
    setIsOpen(false);
    setLocation("/");
  };

  // Filter nav items to hide Yönetici Panel when logged in
  const filteredNavItems = isAdminLoggedIn
    ? navItems.filter(item => item.label !== "Yönetici Panel")
    : navItems;

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
          M
        </div>
        <div>
          <h1 className="font-heading font-bold text-xl tracking-tight">McDashboard</h1>
          <p className="text-xs text-muted-foreground">Kurumsal Raporlama</p>
        </div>
      </div>

      <div className="flex-1 py-4 px-3 space-y-1">
        {filteredNavItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
              location === item.href
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
            onClick={() => setIsOpen(false)}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-md text-sm font-medium text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          data-testid="button-sidebar-logout"
        >
          <LogOut className="w-5 h-5" />
          Çıkış Yap
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 bg-sidebar border-r border-sidebar-border text-sidebar-foreground">
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="md:hidden fixed top-4 left-4 z-50">
          <Button variant="outline" size="icon">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
          <NavContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
