import { Router } from "express";
import * as AdminController from "../../Controller/Admin/Admin.controller.js";
import { authenticate } from "../../Middleware/AuthMiddleware.js";
import { authorize } from "../../Middleware/RoleMiddleware.js";

const router = Router();

// Public Admin Route (No auth required)
router.post("/login", AdminController.adminLogin);

// Apply security middleware to ALL admin routes below
router.use(authenticate);
router.use(authorize(["admin"]));

// Dashboard Stats
router.get("/stats", AdminController.getDashboardStats);

// Activity Graph
router.get("/activity", AdminController.getDashboardActivity);

// User Management
router.get("/users", AdminController.getAllUsers);
router.patch("/users/:id/status", AdminController.updateUserStatus);
router.delete("/users/:id", AdminController.deleteUser);

// Company Management
router.get("/companies", AdminController.getAllCompanies);
router.patch("/companies/:id/approve", AdminController.approveCompany);
router.patch("/companies/:id/reject", AdminController.rejectCompany);

// Job Management
router.get("/jobs", AdminController.getAllJobs);
router.patch("/jobs/:id/status", AdminController.updateJobStatus);
router.delete("/jobs/:id", AdminController.deleteJob);

// Content Moderation
router.get("/moderation/posts", AdminController.getModerationPosts);
router.patch("/moderation/posts/:id", AdminController.moderatePost);

// Admin Profile
router.get("/profile", AdminController.getAdminProfile);
router.patch("/profile", AdminController.updateAdminProfile);

// Admin Notifications
router.get("/notifications", AdminController.getAdminNotifications);
router.patch("/notifications/:id", AdminController.markAdminNotificationRead);
router.delete("/notifications/:id", AdminController.deleteAdminNotification);

// System Settings
router.get("/settings", AdminController.getSystemSettings);
router.patch("/settings", AdminController.updateSystemSettings);

export default router;
