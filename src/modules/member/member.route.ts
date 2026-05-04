import { Router } from "express";
import { Role } from "@prisma/client";
import { checkAuth } from "../../middlewares/checkAuth.js";
import { MemberController } from "./member.controller.js";

const route = Router();

route.get("/get-my-pending-ideas", checkAuth(Role.MEMBER), MemberController.getMyPendingIdeas);
route.get("/get-my-purchase-ideas", checkAuth(Role.MEMBER), MemberController.getMyPurchaseIdea);
route.get("/get-member-stat", checkAuth(Role.ADMIN, Role.MEMBER), MemberController.getMemberStat);
route.delete("/delete-my-pending-idea/:id", checkAuth(Role.ADMIN, Role.MEMBER), MemberController.deleteMyPendingIdea);

export const MemberRoutes = route;