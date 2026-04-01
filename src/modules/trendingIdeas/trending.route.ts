import { Router } from "express";
import { TrendingController } from "./trending.controller";

const routes = Router();

routes.get('/trending-idea', TrendingController.getTrendingIdeas);

export const trendingRoute = routes