import { Router } from "express";
import {
    listCategories,
    listSelectedTasks,
    listTasks,
    updateSelectedTasks,
} from "../controllers/task.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", listTasks);
router.get("/categories", listCategories);
router.get(
    "/selected",
    requireAuth,
    listSelectedTasks
);

router.put(
    "/selected",
    requireAuth,
    updateSelectedTasks
);

export default router;