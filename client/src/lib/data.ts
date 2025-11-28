import type { InsertKPI } from "@shared/schema";

export { kpiCategories } from "@shared/schema";
export type { KPI as KPIData } from "@shared/schema";

// Initial seed data for the database
export const rawData: InsertKPI[] = [
  // Operasyon
  { category: 'Operasyon', name: "Günlük Sipariş Sayısı", target: 500, actual: 460, period: "Günlük", position: 0 },
  { category: 'Operasyon', name: "Drive-Thru Ortalama Hizmet Süresi", unit: "sn", target: 120, actual: 135, period: "Günlük", position: 1 },
  { category: 'Operasyon', name: "Drive-Thru Sipariş Doğruluğu", unit: "%", target: 98, actual: 95, period: "Haftalık", position: 2 },
  { category: 'Operasyon', name: "Restoran Temizlik Skoru", unit: "%", target: 95, actual: 90, period: "Aylık", position: 3 },
  { category: 'Operasyon', name: "Hazırlama Süresi", unit: "sn", target: 90, actual: 110, period: "Günlük", position: 4 },

  // Mutfak
  { category: 'Mutfak', name: "Mutfak Hata Oranı", unit: "%", target: 1, actual: 1, period: "Günlük", position: 5 },
  { category: 'Mutfak', name: "Stokta Kalma Oranı", unit: "%", target: 98, actual: 96, period: "Aylık", position: 6 },
  { category: 'Mutfak', name: "Fire Oranı", unit: "%", target: 2, actual: 3, period: "Aylık", position: 7 },
  { category: 'Mutfak', name: "Hazırlanan Ürün Sayısı", target: 1500, actual: 1300, period: "Günlük", position: 8 },
  { category: 'Mutfak', name: "Gıda Güvenliği Skoru", unit: "%", target: 95, actual: 92, period: "Haftalık", position: 9 },

  // Müşteri
  { category: 'Müşteri Deneyimi', name: "Müşteri Memnuniyeti", unit: "%", target: 90, actual: 88, period: "Aylık", position: 10 },
  { category: 'Müşteri Deneyimi', name: "Şikayet Sayısı", target: 5, actual: 7, period: "Günlük", position: 11 },
  { category: 'Müşteri Deneyimi', name: "Servis Hızı", unit: "sn", target: 120, actual: 135, period: "Günlük", position: 12 },
  { category: 'Müşteri Deneyimi', name: "Sipariş Hatası Sayısı", target: 2, actual: 4, period: "Günlük", position: 13 },
  { category: 'Müşteri Deneyimi', name: "Paket Servis Geri Bildirim Skoru", target: 4, actual: 4, period: "Haftalık", position: 14 },

  // Personel
  { category: 'Personel', name: "Vardiya Uygunluğu", unit: "%", target: 95, actual: 92, period: "Aylık", position: 15 },
  { category: 'Personel', name: "Personel Devamsızlığı", unit: "%", target: 2, actual: 3, period: "Aylık", position: 16 },
  { category: 'Personel', name: "Eğitim Tamamlama Oranı", unit: "%", target: 100, actual: 80, period: "Aylık", position: 17 },
  { category: 'Personel', name: "İşe Alım Hızı", unit: "gün", target: 7, actual: 10, period: "Haftalık", position: 18 },
  { category: 'Personel', name: "Personel Memnuniyeti", unit: "%", target: 85, actual: 82, period: "Aylık", position: 19 },
];

export function calculateStatus(target: number, actual: number) {
  // If no target is set, return neutral status
  if (target === 0) return 'neutral';
  
  const deviation = actual - target;
  // Logic from python script:
  // >= 0 -> Green
  // -10 to 0 -> Yellow
  // < -10 -> Red
  
  if (deviation >= 0) return 'success';
  if (deviation >= -10) return 'warning';
  return 'danger';
}

export function formatValue(value: number, unit?: string | null) {
  if (unit === '%') return `%${value}`;
  if (unit === 'sn') return `${value} sn`;
  if (unit === 'gün') return `${value} gün`;
  if (unit === 'TL') return `₺${value.toLocaleString('tr-TR')}`;
  if (unit === 'EURO') return `€${value.toLocaleString('tr-TR')}`;
  if (unit === 'DOLLAR') return `$${value.toLocaleString('tr-TR')}`;
  if (unit === 'POUND') return `£${value.toLocaleString('tr-TR')}`;
  return value.toLocaleString('tr-TR');
}
