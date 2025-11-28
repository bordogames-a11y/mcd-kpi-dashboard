import { db } from "./db";
import { kpis } from "@shared/schema";
import type { InsertKPI } from "@shared/schema";

const seedData: InsertKPI[] = [
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

async function seed() {
  console.log("🌱 Seeding database...");
  
  // Check if data already exists
  const existing = await db.select().from(kpis);
  
  if (existing.length > 0) {
    console.log("✅ Database already seeded. Skipping...");
    return;
  }
  
  // Insert seed data
  await db.insert(kpis).values(seedData);
  
  console.log("✅ Database seeded successfully!");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });
