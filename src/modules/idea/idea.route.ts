import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../../generated/prisma";
import { IdeaController } from "./idea.controller";

const route = Router();
route.post("/create-idea", checkAuth(Role.ADMIN, Role.MEMBER), IdeaController.createIdea);
route.get("/get-all-idea", checkAuth(Role.ADMIN, Role.MEMBER), IdeaController.getAllIdea);
route.get("/:id", checkAuth(Role.ADMIN, Role.MEMBER), IdeaController.getIdeaById);
route.patch("/:id", checkAuth(Role.ADMIN, Role.MEMBER), IdeaController.updateIdea);
route.patch("/approve-idea/:id", checkAuth(Role.ADMIN), IdeaController.approveAndRejectIdea);

export const IdeaRoute = route;