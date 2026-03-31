import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "@prisma/client";
import { IdeaController } from "./idea.controller";

const route = Router();
route.post("/create-idea", checkAuth(Role.ADMIN, Role.MEMBER), IdeaController.createIdea);
route.get("/get-all-idea", IdeaController.getAllIdea);
route.get("/get-pending-idea", checkAuth(Role.ADMIN, Role.MEMBER), IdeaController.getPendingIdeas);
route.get("/get-my-idea", checkAuth(Role.ADMIN, Role.MEMBER), IdeaController.getMyIdeas);
route.get("/get-single-idea/:id", IdeaController.getIdeaById);
route.patch("/:id", checkAuth(Role.ADMIN, Role.MEMBER), IdeaController.updateIdea);
route.patch("/approve-idea/:id", checkAuth(Role.ADMIN), IdeaController.approveAndRejectIdea);

export const IdeaRoute = route;