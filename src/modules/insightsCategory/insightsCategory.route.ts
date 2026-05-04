import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "@prisma/client";
import { insightCategoryController } from "./insightsCategory.controller";


const route = Router();

route.get("/get-all-insights-category", checkAuth(Role.ADMIN), insightCategoryController.getInsightCategory);
route.post("/create-insights-category", checkAuth(Role.ADMIN), insightCategoryController.createInsightCategory);

export const insightCategoryRoute = route;