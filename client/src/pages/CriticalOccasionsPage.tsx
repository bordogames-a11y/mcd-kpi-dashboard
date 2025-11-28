import { Sidebar } from "@/components/layout/Sidebar";
import { CriticalOccasions } from "@/components/dashboard/CriticalOccasions";
import bgImage from "@assets/generated_images/modern_clean_corporate_restaurant_dashboard_background_texture.png";

export default function CriticalOccasionsPage() {
  return (
    <div className="min-h-screen bg-background flex font-sans">
      <Sidebar />
      
      <main className="flex-1 md:ml-64 relative">
        <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
          <img src={bgImage} className="w-full h-full object-cover opacity-20" alt="" />
        </div>

        <div className="relative z-10 p-8 space-y-8">
          <header>
            <h2 className="text-3xl font-heading font-bold text-foreground tracking-tight">
              SKT KRİTİK OLANLAR
            </h2>
            <p className="text-muted-foreground mt-1">
              Acil durumlar ve önemli olayları kaydedin ve yönetin.
            </p>
          </header>

          <div className="max-w-2xl">
            <CriticalOccasions />
          </div>
        </div>
      </main>
    </div>
  );
}
