import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertKPISchema, insertDailyReportSchema, insertCriticalOccasionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // KPI Routes
  app.get("/api/kpis", async (req, res) => {
    try {
      const kpis = await storage.getAllKPIs();
      res.json(kpis);
    } catch (error) {
      console.error("Error fetching KPIs:", error);
      res.status(500).json({ error: "Failed to fetch KPIs" });
    }
  });

  app.get("/api/kpis/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const kpi = await storage.getKPI(id);
      if (!kpi) {
        return res.status(404).json({ error: "KPI not found" });
      }
      res.json(kpi);
    } catch (error) {
      console.error("Error fetching KPI:", error);
      res.status(500).json({ error: "Failed to fetch KPI" });
    }
  });

  app.post("/api/kpis", async (req, res) => {
    try {
      const validatedData = insertKPISchema.parse(req.body);
      const kpi = await storage.createKPI(validatedData);
      res.status(201).json(kpi);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating KPI:", error);
      res.status(500).json({ error: "Failed to create KPI" });
    }
  });

  app.patch("/api/kpis/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const kpi = await storage.updateKPI(id, req.body);
      if (!kpi) {
        return res.status(404).json({ error: "KPI not found" });
      }
      res.json(kpi);
    } catch (error) {
      console.error("Error updating KPI:", error);
      res.status(500).json({ error: "Failed to update KPI" });
    }
  });

  app.delete("/api/kpis/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteKPI(id);
      if (!success) {
        return res.status(404).json({ error: "KPI not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting KPI:", error);
      res.status(500).json({ error: "Failed to delete KPI" });
    }
  });

  app.post("/api/kpis/reorder", async (req, res) => {
    try {
      const { kpiIds } = req.body as { kpiIds: number[] };
      if (!Array.isArray(kpiIds)) {
        return res.status(400).json({ error: "kpiIds must be an array" });
      }
      await storage.reorderKPIs(kpiIds);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error reordering KPIs:", error);
      res.status(500).json({ error: "Failed to reorder KPIs" });
    }
  });

  app.post("/api/kpis/reset", async (req, res) => {
    try {
      await storage.resetActualValues();
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error resetting KPI values:", error);
      res.status(500).json({ error: "Failed to reset KPI values" });
    }
  });

  // Daily Report Routes
  app.post("/api/reports/daily", async (req, res) => {
    try {
      const validatedData = insertDailyReportSchema.parse(req.body);
      const report = await storage.createDailyReport(validatedData);
      res.status(201).json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating daily report:", error);
      res.status(500).json({ error: "Failed to create daily report" });
    }
  });

  app.get("/api/reports/daily", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 30;
      const reports = await storage.getDailyReports(limit);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching daily reports:", error);
      res.status(500).json({ error: "Failed to fetch daily reports" });
    }
  });

  app.delete("/api/reports/daily/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDailyReport(id);
      if (!success) {
        return res.status(404).json({ error: "Daily report not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting daily report:", error);
      res.status(500).json({ error: "Failed to delete daily report" });
    }
  });

  // Critical Occasions Routes
  app.get("/api/critical-occasions", async (req, res) => {
    try {
      const occasions = await storage.getAllCriticalOccasions();
      res.json(occasions);
    } catch (error) {
      console.error("Error fetching critical occasions:", error);
      res.status(500).json({ error: "Failed to fetch critical occasions" });
    }
  });

  app.post("/api/critical-occasions", async (req, res) => {
    try {
      const validatedData = insertCriticalOccasionSchema.parse(req.body);
      const occasion = await storage.createCriticalOccasion(validatedData);
      res.status(201).json(occasion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating critical occasion:", error);
      res.status(500).json({ error: "Failed to create critical occasion" });
    }
  });

  app.delete("/api/critical-occasions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCriticalOccasion(id);
      if (!success) {
        return res.status(404).json({ error: "Critical occasion not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting critical occasion:", error);
      res.status(500).json({ error: "Failed to delete critical occasion" });
    }
  });

  // Admin Routes
  app.post("/api/admin/register", async (req, res) => {
    try {
      const { adminId, password } = req.body;
      
      if (!adminId || !password) {
        return res.status(400).json({ error: "Admin ID ve şifre gereklidir." });
      }

      const existingAdmin = await storage.getAdminByAdminId(adminId);
      if (existingAdmin) {
        return res.status(400).json({ error: "Bu Admin ID zaten kullanılıyor." });
      }

      const admin = await storage.createAdmin({ adminId, password });
      res.status(201).json({ success: true, admin: { id: admin.id, adminId: admin.adminId } });
    } catch (error) {
      console.error("Error registering admin:", error);
      res.status(500).json({ error: "Admin kaydı yapılamadı." });
    }
  });

  app.post("/api/admin/login", async (req, res) => {
    try {
      const { adminId, password, deviceFingerprint, deviceName } = req.body;
      
      if (!adminId || !password || !deviceFingerprint) {
        return res.status(400).json({ error: "Admin ID ve şifre gereklidir." });
      }

      const admin = await storage.getAdminByAdminId(adminId);
      if (!admin || admin.password !== password) {
        return res.status(401).json({ error: "Admin ID veya şifre yanlış." });
      }

      const device = await storage.getOrCreateAdminDevice(admin.id, deviceFingerprint, deviceName || "Unknown Device");
      
      res.json({ 
        success: true, 
        admin: { id: admin.id, adminId: admin.adminId, yetkiliApproved: admin.yetkiliApproved }, 
        device: { id: device.id, isApproved: device.isApproved, deviceName: device.deviceName }
      });
    } catch (error) {
      console.error("Error logging in admin:", error);
      res.status(500).json({ error: "Giriş yapılamadı." });
    }
  });

  app.post("/api/admin/approve-device", async (req, res) => {
    try {
      const { deviceId } = req.body;
      
      if (!deviceId) {
        return res.status(400).json({ error: "Device ID gereklidir." });
      }

      const device = await storage.approveAdminDevice(deviceId);
      if (!device) {
        return res.status(404).json({ error: "Cihaz bulunamadı." });
      }

      res.json({ success: true, device: { id: device.id, isApproved: device.isApproved } });
    } catch (error) {
      console.error("Error approving device:", error);
      res.status(500).json({ error: "Cihaz onayla yapılamadı." });
    }
  });

  app.get("/api/admin/reports", async (req, res) => {
    try {
      const reports = await storage.getDailyReports(1000);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ error: "Raporlar yüklenemedi." });
    }
  });

  app.get("/api/admin/all-admins", async (req, res) => {
    try {
      const adminslist = await storage.getAllAdmins();
      res.json(adminslist);
    } catch (error) {
      console.error("Error fetching admins:", error);
      res.status(500).json({ error: "Yöneticiler yüklenemedi." });
    }
  });

  app.patch("/api/admin/update-yetkili/:id", async (req, res) => {
    try {
      const adminId = parseInt(req.params.id);
      const { yetkiliApproved } = req.body;

      if (typeof yetkiliApproved !== "boolean") {
        return res.status(400).json({ error: "yetkiliApproved alanı boolean olmalıdır." });
      }

      const updated = await storage.updateAdminYetkiliStatus(adminId, yetkiliApproved);
      if (!updated) {
        return res.status(404).json({ error: "Yönetici bulunamadı." });
      }

      res.json({ success: true, admin: updated });
    } catch (error) {
      console.error("Error updating admin yetkili status:", error);
      res.status(500).json({ error: "Yönetici güncellenemedi." });
    }
  });

  app.get("/api/admin/all-devices", async (req, res) => {
    try {
      const devices = await storage.getAllDevices();
      res.json(devices);
    } catch (error) {
      console.error("Error fetching devices:", error);
      res.status(500).json({ error: "Cihazlar yüklenemedi." });
    }
  });

  app.get("/api/admin/pending-devices", async (req, res) => {
    try {
      const devices = await storage.getAllDevices();
      const pendingDevices = devices.filter(d => !d.isApproved);
      res.json(pendingDevices);
    } catch (error) {
      console.error("Error fetching pending devices:", error);
      res.status(500).json({ error: "Cihazlar yüklenemedi." });
    }
  });

  app.post("/api/admin/approve-device/:id", async (req, res) => {
    try {
      const deviceId = parseInt(req.params.id);
      const device = await storage.approveAdminDevice(deviceId);
      if (!device) {
        return res.status(404).json({ error: "Cihaz bulunamadı." });
      }
      res.json({ success: true, device });
    } catch (error) {
      console.error("Error approving device:", error);
      res.status(500).json({ error: "Cihaz onayla yapılamadı." });
    }
  });

  app.post("/api/admin/reject-device/:id", async (req, res) => {
    try {
      const deviceId = parseInt(req.params.id);
      // You can implement device deletion or marking as rejected here
      // For now, we'll just mark it as not approved by not changing it
      res.json({ success: true, message: "Cihaz reddedildi." });
    } catch (error) {
      console.error("Error rejecting device:", error);
      res.status(500).json({ error: "Cihaz reddedilemedi." });
    }
  });

  app.patch("/api/admin/update-device-authorization/:id", async (req, res) => {
    try {
      const deviceId = parseInt(req.params.id);
      const { isAuthorized } = req.body;

      if (typeof isAuthorized !== "boolean") {
        return res.status(400).json({ error: "isAuthorized alanı boolean olmalıdır." });
      }

      const updated = await storage.updateDeviceAuthorization(deviceId, isAuthorized);
      if (!updated) {
        return res.status(404).json({ error: "Cihaz bulunamadı." });
      }

      res.json({ success: true, device: updated });
    } catch (error) {
      console.error("Error updating device authorization:", error);
      res.status(500).json({ error: "Cihaz güncellenemedi." });
    }
  });

  // Version routes
  app.get("/api/version", async (req, res) => {
    try {
      const version = await storage.getLatestVersion();
      res.json({ 
        version: version?.version || "1.0.0",
        changelog: version?.changelog || null
      });
    } catch (error) {
      console.error("Error fetching version:", error);
      res.status(500).json({ error: "Sürüm alınamadı" });
    }
  });

  app.post("/api/admin/versions", async (req, res) => {
    try {
      const { version, changelog } = req.body;
      if (!version || typeof version !== "string") {
        return res.status(400).json({ error: "Geçerli sürüm gerekli" });
      }
      
      const created = await storage.createVersion(version, changelog);
      res.json({ success: true, version: created });
    } catch (error) {
      console.error("Error creating version:", error);
      res.status(500).json({ error: "Sürüm oluşturulamadı" });
    }
  });

  app.get("/api/admin/versions", async (req, res) => {
    try {
      const versions = await storage.getAllVersions();
      res.json(versions);
    } catch (error) {
      console.error("Error fetching versions:", error);
      res.status(500).json({ error: "Sürümler yüklenemedi" });
    }
  });

  app.post("/api/admin/versions/:id/publish", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const published = await storage.publishVersion(id);
      if (!published) {
        return res.status(404).json({ error: "Sürüm bulunamadı" });
      }
      res.json({ success: true, version: published });
    } catch (error) {
      console.error("Error publishing version:", error);
      res.status(500).json({ error: "Sürüm yayınlanamadı" });
    }
  });

  app.delete("/api/admin/versions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteVersion(id);
      if (!deleted) {
        return res.status(404).json({ error: "Sürüm bulunamadı" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting version:", error);
      res.status(500).json({ error: "Sürüm silinemedi" });
    }
  });

  app.post("/api/admin/update-version", async (req, res) => {
    try {
      const { version, changelog } = req.body;
      if (!version || typeof version !== "string") {
        return res.status(400).json({ error: "Geçerli sürüm gerekli" });
      }
      
      const updated = await storage.updateVersion(version, changelog);
      res.json({ success: true, version: updated.version, changelog: updated.changelog });
    } catch (error) {
      console.error("Error updating version:", error);
      res.status(500).json({ error: "Sürüm güncellenemedi" });
    }
  });

  return httpServer;
}
