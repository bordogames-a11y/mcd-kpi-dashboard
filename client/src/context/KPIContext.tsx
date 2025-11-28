import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { kpiAPI, reportAPI } from '@/lib/api';
import type { KPI, InsertKPI } from '@shared/schema';

interface KPIContextType {
  kpis: KPI[];
  isLoading: boolean;
  addKPI: (kpi: InsertKPI) => Promise<void>;
  updateKPI: (id: number, kpi: Partial<InsertKPI>) => Promise<void>;
  deleteKPI: (id: number) => Promise<void>;
  moveKPI: (id: number, direction: 'up' | 'down') => Promise<void>;
  resetDailyValues: () => Promise<void>;
  refetch: () => Promise<void>;
}

const KPIContext = createContext<KPIContextType | undefined>(undefined);

export function KPIProvider({ children }: { children: ReactNode }) {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchKPIs = async () => {
    try {
      const data = await kpiAPI.getAll();
      setKpis(data);
    } catch (error) {
      console.error('Failed to fetch KPIs:', error);
      toast({
        title: "Hata",
        description: "KPI'lar yüklenemedi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIs();
  }, []);

  const addKPI = async (newKPI: InsertKPI) => {
    try {
      const createdKPI = await kpiAPI.create(newKPI);
      setKpis((prev) => [...prev, createdKPI]);
      toast({
        title: "KPI Eklendi",
        description: `${newKPI.name} başarıyla eklendi.`,
      });
    } catch (error) {
      console.error('Failed to create KPI:', error);
      toast({
        title: "Hata",
        description: "KPI eklenemedi.",
        variant: "destructive",
      });
    }
  };

  const updateKPI = async (id: number, updatedFields: Partial<InsertKPI>) => {
    try {
      const updated = await kpiAPI.update(id, updatedFields);
      setKpis((prev) =>
        prev.map((kpi) => (kpi.id === id ? updated : kpi))
      );
    } catch (error) {
      console.error('Failed to update KPI:', error);
      toast({
        title: "Hata",
        description: "KPI güncellenemedi.",
        variant: "destructive",
      });
    }
  };

  const deleteKPI = async (id: number) => {
    try {
      await kpiAPI.delete(id);
      setKpis((prev) => prev.filter((kpi) => kpi.id !== id));
      toast({
        title: "KPI Silindi",
        description: "KPI başarıyla kaldırıldı.",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Failed to delete KPI:', error);
      toast({
        title: "Hata",
        description: "KPI silinemedi.",
        variant: "destructive",
      });
    }
  };

  const moveKPI = async (id: number, direction: 'up' | 'down') => {
    const index = kpis.findIndex((k) => k.id === id);
    if (index === -1) return;

    const newKpis = [...kpis];
    if (direction === 'up') {
      if (index === 0) return;
      [newKpis[index - 1], newKpis[index]] = [newKpis[index], newKpis[index - 1]];
    } else {
      if (index === kpis.length - 1) return;
      [newKpis[index + 1], newKpis[index]] = [newKpis[index], newKpis[index + 1]];
    }

    // Optimistic update
    setKpis(newKpis);

    try {
      const kpiIds = newKpis.map(k => k.id);
      await kpiAPI.reorder(kpiIds);
    } catch (error) {
      console.error('Failed to reorder KPIs:', error);
      // Revert on error
      setKpis(kpis);
      toast({
        title: "Hata",
        description: "Sıralama güncellenemedi.",
        variant: "destructive",
      });
    }
  };

  const resetDailyValues = async () => {
    try {
      // Reset target and actual values
      await kpiAPI.reset();
      
      // Refetch to get updated data
      await fetchKPIs();
    } catch (error) {
      console.error('Failed to reset daily values:', error);
      toast({
        title: "Hata",
        description: "Veriler sıfırlanırken hata oluştu.",
        variant: "destructive",
      });
    }
  };

  return (
    <KPIContext.Provider value={{ kpis, isLoading, addKPI, updateKPI, deleteKPI, moveKPI, resetDailyValues, refetch: fetchKPIs }}>
      {children}
    </KPIContext.Provider>
  );
}

export function useKPIs() {
  const context = useContext(KPIContext);
  if (context === undefined) {
    throw new Error('useKPIs must be used within a KPIProvider');
  }
  return context;
}
