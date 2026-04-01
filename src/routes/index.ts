import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route";
import { IdeaRoute } from "../modules/idea/idea.route";
import { CategoryRoute } from "../modules/category/category.route";
import { VoteRoute } from "../modules/vote/vote.route";
import { CommentRoute } from "../modules/comments/comments.route";
import { PaymentRoutes } from "../modules/purchase/purchase.route";
import { AdminRoutes } from "../modules/admin/admin.route";
import { MemberRoutes } from "../modules/member/member.route";
import { trendingRoute } from "../modules/trendingIdeas/trending.route";

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

export const apiRoutes = router;
