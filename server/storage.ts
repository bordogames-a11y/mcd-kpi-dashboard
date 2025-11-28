import { type User, type InsertUser, type KPI, type InsertKPI, type DailyReport, type InsertDailyReport, type CriticalOccasion, type InsertCriticalOccasion, type Admin, type InsertAdmin, type AdminDevice, type InsertAdminDevice, type AppVersion } from "@shared/schema";
import { users, kpis, dailyReports, criticalOccasions, admins, adminDevices, appVersion } from "@shared/schema";
import { db } from "./db";
import { eq, asc, and, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // KPI methods
  getAllKPIs(): Promise<KPI[]>;
  getKPI(id: number): Promise<KPI | undefined>;
  createKPI(kpi: InsertKPI): Promise<KPI>;
  updateKPI(id: number, kpi: Partial<InsertKPI>): Promise<KPI | undefined>;
  deleteKPI(id: number): Promise<boolean>;
  reorderKPIs(kpiIds: number[]): Promise<void>;
  resetActualValues(): Promise<void>;
  
  // Daily report methods
  createDailyReport(report: InsertDailyReport): Promise<DailyReport>;
  getDailyReports(limit?: number): Promise<DailyReport[]>;
  deleteDailyReport(id: number): Promise<boolean>;
  
  // Critical occasions methods
  getAllCriticalOccasions(): Promise<CriticalOccasion[]>;
  createCriticalOccasion(occasion: InsertCriticalOccasion): Promise<CriticalOccasion>;
  deleteCriticalOccasion(id: number): Promise<boolean>;
  
  // Admin methods
  getAdminByAdminId(adminId: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  
  // Admin device methods
  getOrCreateAdminDevice(adminId: number, deviceFingerprint: string, deviceName: string): Promise<AdminDevice>;
  getAdminDevice(adminId: number, deviceFingerprint: string): Promise<AdminDevice | undefined>;
  approveAdminDevice(deviceId: number): Promise<AdminDevice | undefined>;
  getApprovedDevicesForAdmin(adminId: number): Promise<AdminDevice[]>;
  updateDeviceLastUsed(deviceId: number): Promise<void>;
  
  // Version methods
  getLatestVersion(): Promise<AppVersion | undefined>;
  getAllVersions(): Promise<AppVersion[]>;
  createVersion(version: string, changelog?: string): Promise<AppVersion>;
  publishVersion(id: number): Promise<AppVersion | undefined>;
  deleteVersion(id: number): Promise<boolean>;
  updateVersion(version: string, changelog?: string): Promise<AppVersion>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // KPI methods
  async getAllKPIs(): Promise<KPI[]> {
    return db.select().from(kpis).orderBy(asc(kpis.position));
  }

  async getKPI(id: number): Promise<KPI | undefined> {
    const [kpi] = await db.select().from(kpis).where(eq(kpis.id, id));
    return kpi || undefined;
  }

  async createKPI(kpi: InsertKPI): Promise<KPI> {
    // Get the highest position and add 1
    const allKpis = await db.select().from(kpis);
    const maxPosition = Math.max(...allKpis.map(k => k.position), -1);
    
    const [newKpi] = await db
      .insert(kpis)
      .values({ 
        name: kpi.name,
        category: kpi.category,
        target: kpi.target,
        actual: kpi.actual ?? 0,
        period: kpi.period,
        unit: kpi.unit,
        position: maxPosition + 1
      })
      .returning();
    return newKpi;
  }

  async updateKPI(id: number, kpi: Partial<InsertKPI>): Promise<KPI | undefined> {
    const updateData: Record<string, any> = { updatedAt: new Date() };
    
    if (kpi.name !== undefined) updateData.name = kpi.name;
    if (kpi.category !== undefined) updateData.category = kpi.category;
    if (kpi.target !== undefined) updateData.target = kpi.target;
    if (kpi.actual !== undefined) updateData.actual = kpi.actual;
    if (kpi.period !== undefined) updateData.period = kpi.period;
    if (kpi.unit !== undefined) updateData.unit = kpi.unit;
    if (kpi.position !== undefined) updateData.position = kpi.position;
    
    const [updated] = await db
      .update(kpis)
      .set(updateData)
      .where(eq(kpis.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteKPI(id: number): Promise<boolean> {
    const result = await db.delete(kpis).where(eq(kpis.id, id)).returning();
    return result.length > 0;
  }

  async reorderKPIs(kpiIds: number[]): Promise<void> {
    // Update positions for each KPI
    for (let i = 0; i < kpiIds.length; i++) {
      await db
        .update(kpis)
        .set({ position: i })
        .where(eq(kpis.id, kpiIds[i]));
    }
  }

  async resetActualValues(): Promise<void> {
    await db.update(kpis).set({ actual: 0, target: 0, updatedAt: new Date() });
  }

  // Daily report methods
  async createDailyReport(report: InsertDailyReport): Promise<DailyReport> {
    const [newReport] = await db
      .insert(dailyReports)
      .values(report)
      .returning();
    return newReport;
  }

  async getDailyReports(limit: number = 30): Promise<DailyReport[]> {
    return db
      .select()
      .from(dailyReports)
      .orderBy(asc(dailyReports.reportDate))
      .limit(limit);
  }

  async deleteDailyReport(id: number): Promise<boolean> {
    const result = await db.delete(dailyReports).where(eq(dailyReports.id, id)).returning();
    return result.length > 0;
  }

  // Critical occasions methods
  async getAllCriticalOccasions(): Promise<CriticalOccasion[]> {
    return db.select().from(criticalOccasions).orderBy(asc(criticalOccasions.createdAt));
  }

  async createCriticalOccasion(occasion: InsertCriticalOccasion): Promise<CriticalOccasion> {
    const [newOccasion] = await db
      .insert(criticalOccasions)
      .values(occasion)
      .returning();
    return newOccasion;
  }

  async deleteCriticalOccasion(id: number): Promise<boolean> {
    const result = await db.delete(criticalOccasions).where(eq(criticalOccasions.id, id)).returning();
    return result.length > 0;
  }

  // Admin methods
  async getAdminByAdminId(adminId: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.adminId, adminId));
    return admin || undefined;
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const [newAdmin] = await db
      .insert(admins)
      .values(admin)
      .returning();
    return newAdmin;
  }

  async getAllAdmins(): Promise<Admin[]> {
    return db.select().from(admins).orderBy(asc(admins.createdAt));
  }

  async updateAdminYetkiliStatus(adminId: number, yetkiliApproved: boolean): Promise<Admin | undefined> {
    const [updated] = await db
      .update(admins)
      .set({ yetkiliApproved })
      .where(eq(admins.id, adminId))
      .returning();
    return updated || undefined;
  }

  // Admin device methods
  async getOrCreateAdminDevice(adminId: number, deviceFingerprint: string, deviceName: string): Promise<AdminDevice> {
    const existing = await this.getAdminDevice(adminId, deviceFingerprint);
    if (existing) {
      return existing;
    }
    
    const [newDevice] = await db
      .insert(adminDevices)
      .values({ adminId, deviceFingerprint, deviceName, isApproved: false })
      .returning();
    return newDevice;
  }

  async getAdminDevice(adminId: number, deviceFingerprint: string): Promise<AdminDevice | undefined> {
    const [device] = await db
      .select()
      .from(adminDevices)
      .where(and(eq(adminDevices.adminId, adminId), eq(adminDevices.deviceFingerprint, deviceFingerprint)));
    return device || undefined;
  }

  async approveAdminDevice(deviceId: number): Promise<AdminDevice | undefined> {
    const [device] = await db
      .update(adminDevices)
      .set({ isApproved: true })
      .where(eq(adminDevices.id, deviceId))
      .returning();
    return device || undefined;
  }

  async getApprovedDevicesForAdmin(adminId: number): Promise<AdminDevice[]> {
    return db
      .select()
      .from(adminDevices)
      .where(and(eq(adminDevices.adminId, adminId), eq(adminDevices.isApproved, true)));
  }

  async updateDeviceLastUsed(deviceId: number): Promise<void> {
    await db
      .update(adminDevices)
      .set({ lastUsed: new Date() })
      .where(eq(adminDevices.id, deviceId));
  }

  async getAllApprovedDevices(): Promise<AdminDevice[]> {
    return db
      .select()
      .from(adminDevices)
      .where(eq(adminDevices.isApproved, true))
      .orderBy(asc(adminDevices.createdAt));
  }

  async getAllDevices(): Promise<AdminDevice[]> {
    return db
      .select()
      .from(adminDevices)
      .orderBy(asc(adminDevices.createdAt));
  }

  async updateDeviceAuthorization(deviceId: number, isAuthorized: boolean): Promise<AdminDevice | undefined> {
    const [updated] = await db
      .update(adminDevices)
      .set({ isAuthorized })
      .where(eq(adminDevices.id, deviceId))
      .returning();
    return updated || undefined;
  }

  async getLatestVersion(): Promise<AppVersion | undefined> {
    const [version] = await db
      .select()
      .from(appVersion)
      .where(eq(appVersion.status, "published"))
      .orderBy(desc(appVersion.id));
    return version || undefined;
  }

  async getAllVersions(): Promise<AppVersion[]> {
    return db.select().from(appVersion).orderBy(desc(appVersion.createdAt));
  }

  async createVersion(version: string, changelog?: string): Promise<AppVersion> {
    const [created] = await db
      .insert(appVersion)
      .values({ version, changelog, status: "draft" })
      .returning();
    return created;
  }

  async publishVersion(id: number): Promise<AppVersion | undefined> {
    const [updated] = await db
      .update(appVersion)
      .set({ status: "published", updatedAt: new Date() })
      .where(eq(appVersion.id, id))
      .returning();
    return updated;
  }

  async deleteVersion(id: number): Promise<boolean> {
    const result = await db.delete(appVersion).where(eq(appVersion.id, id));
    return result.rowCount > 0;
  }

  async updateVersion(version: string, changelog?: string): Promise<AppVersion> {
    const [updated] = await db
      .update(appVersion)
      .set({ version, changelog, updatedAt: new Date() })
      .where(eq(appVersion.id, 1))
      .returning();
    
    if (updated) return updated;
    
    const [created] = await db
      .insert(appVersion)
      .values({ version, changelog, id: 1 })
      .returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
