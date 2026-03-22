import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "@prisma/client";
import { IdeaController } from "./idea.controller";

const route = Router();
route.post("/create-idea", checkAuth(Role.ADMIN, Role.MEMBER), IdeaController.createIdea);
route.get("/get-all-idea", IdeaController.getAllIdea);
route.get("/get-pending-idea", checkAuth(Role.ADMIN, Role.MEMBER), IdeaController.getPendingIdeas);
route.get("/get-my-idea", checkAuth(Role.ADMIN, Role.MEMBER), IdeaController.getMyIdeas);
route.get("/:id", checkAuth(Role.ADMIN, Role.MEMBER), IdeaController.getIdeaById);
route.patch("/:id", checkAuth(Role.ADMIN, Role.MEMBER), IdeaController.updateIdea);
route.patch("/approve-idea/:id", checkAuth(Role.ADMIN), IdeaController.approveAndRejectIdea);
route.delete("/delete-idea/:id", checkAuth(Role.ADMIN, Role.MEMBER), IdeaController.deleteIdea);

export const IdeaRoute = route;