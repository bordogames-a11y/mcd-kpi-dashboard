import type { KPI, InsertKPI, DailyReport, InsertDailyReport, CriticalOccasion, InsertCriticalOccasion } from "@shared/schema";

const API_BASE = "/api";

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// KPI API
export const kpiAPI = {
  getAll: () => fetchJSON<KPI[]>(`${API_BASE}/kpis`),
  
  getOne: (id: number) => fetchJSON<KPI>(`${API_BASE}/kpis/${id}`),
  
  create: (kpi: InsertKPI) =>
    fetchJSON<KPI>(`${API_BASE}/kpis`, {
      method: "POST",
      body: JSON.stringify(kpi),
    }),
  
  update: (id: number, kpi: Partial<InsertKPI>) =>
    fetchJSON<KPI>(`${API_BASE}/kpis/${id}`, {
      method: "PATCH",
      body: JSON.stringify(kpi),
    }),
  
  delete: (id: number) =>
    fetchJSON<void>(`${API_BASE}/kpis/${id}`, {
      method: "DELETE",
    }),
  
  reorder: (kpiIds: number[]) =>
    fetchJSON<{ success: boolean }>(`${API_BASE}/kpis/reorder`, {
      method: "POST",
      body: JSON.stringify({ kpiIds }),
    }),
  
  reset: () =>
    fetchJSON<{ success: boolean }>(`${API_BASE}/kpis/reset`, {
      method: "POST",
    }),
};

// Daily Report API
export const reportAPI = {
  create: (report: InsertDailyReport) =>
    fetchJSON<DailyReport>(`${API_BASE}/reports/daily`, {
      method: "POST",
      body: JSON.stringify(report),
    }),
  
  getAll: (limit?: number) =>
    fetchJSON<DailyReport[]>(`${API_BASE}/reports/daily${limit ? `?limit=${limit}` : ""}`),
};

// Critical Occasions API
export const occasionAPI = {
  getAll: () => fetchJSON<CriticalOccasion[]>(`${API_BASE}/critical-occasions`),
  
  create: (occasion: Partial<InsertCriticalOccasion> & { title: string }) =>
    fetchJSON<CriticalOccasion>(`${API_BASE}/critical-occasions`, {
      method: "POST",
      body: JSON.stringify(occasion),
    }),
  
  delete: (id: number) =>
    fetchJSON<void>(`${API_BASE}/critical-occasions/${id}`, {
      method: "DELETE",
    }),
};
