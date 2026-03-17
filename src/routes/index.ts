import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route";
import { IdeaRoute } from "../modules/idea/idea.route";
import { CategoryRoute } from "../modules/category/category.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/idea", IdeaRoute)
router.use("/category", CategoryRoute)

export const apiRoutes = router;
