import { Router } from "express";
import {
    getMyProfile,
    saveMyProfile,
} from "../controllers/profile.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", requireAuth, getMyProfile);

router.put("/", requireAuth, saveMyProfile);

export default router;