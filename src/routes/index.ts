import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route";
import { IdeaRoute } from "../modules/idea/idea.route";
import { CategoryRoute } from "../modules/category/category.route";
import { VoteRoute } from "../modules/vote/vote.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/idea", IdeaRoute)
router.use("/category", CategoryRoute)
router.use("/vote", VoteRoute)

export const apiRoutes = router;
