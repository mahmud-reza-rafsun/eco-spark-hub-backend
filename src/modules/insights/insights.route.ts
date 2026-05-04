import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "@prisma/client";
import { InsightController } from "./insights.controller";

const route = Router();

route.get(
    '/get-all-insight',
    checkAuth(Role.ADMIN),
    InsightController.getAllInsights
);
route.get(
    '/get-single-insight/:id',
    checkAuth(Role.ADMIN),
    InsightController.getSingleInsight
);

route.post(
    '/create-insight',
    checkAuth(Role.ADMIN),
    InsightController.getAllInsights
);

export const insightsRoutes = route;