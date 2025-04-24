
// src/routes/userRoutes.ts
import { Router } from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/authMiddleware";
const router = Router();

/**
 * GET /api/users/
 * 🔐 Admins only — list all users
 */
router.get("/", authMiddleware, requireRole("admin"), getUsers);

/**
 * GET /api/users/:id
 * 🔐 Authenticated users can view their own profile
 * 🛡️ Admins can view any user
 */
router.get("/:id", authMiddleware, getUserById);

/**
 * PUT /api/users/:id
 * 🔐 Authenticated users can update their own profile
 * 🛡️ Admins can update any profile
 */
router.put("/:id", authMiddleware, updateUser);

/**
 * DELETE /api/users/:id
 * 🔐 Admins only — delete any user
 */
router.delete("/:id", authMiddleware, requireRole("admin"), deleteUser);

export default router;
