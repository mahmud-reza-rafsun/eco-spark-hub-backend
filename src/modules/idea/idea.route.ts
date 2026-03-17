import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../../generated/prisma";
import { IdeaController } from "./idea.controller";

const route = Router();
route.post("/create-idea", checkAuth(Role.ADMIN, Role.MEMBER), IdeaController.createIdea);
route.get("/get-all-idea", checkAuth(Role.ADMIN, Role.MEMBER), IdeaController.getAllIdea);

export const IdeaRoute = route;