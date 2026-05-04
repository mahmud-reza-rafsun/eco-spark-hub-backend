import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route.js";
import { IdeaRoute } from "../modules/idea/idea.route.js";
import { CategoryRoute } from "../modules/category/category.route.js";
import { VoteRoute } from "../modules/vote/vote.route.js";
import { CommentRoute } from "../modules/comments/comments.route.js";
import { PaymentRoutes } from "../modules/purchase/purchase.route.js";
import { AdminRoutes } from "../modules/admin/admin.route.js";
import { MemberRoutes } from "../modules/member/member.route.js";
import { trendingRoute } from "../modules/trendingIdeas/trending.route.js";
import { insightsRoutes } from "../modules/insights/insights.route.js";
import { insightCategoryRoute } from "../modules/insightsCategory/insightsCategory.route.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/idea", IdeaRoute)
router.use("/category", CategoryRoute)
router.use("/vote", VoteRoute);
router.use("/comment", CommentRoute)
router.use("/payment", PaymentRoutes)
router.use("/admin", AdminRoutes)
router.use("/member", MemberRoutes)
router.use("/trending", trendingRoute)
router.use("/insights", insightsRoutes)
router.use("/insights-category", insightCategoryRoute)

export const apiRoutes = router;
