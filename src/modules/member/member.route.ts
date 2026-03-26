import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "@prisma/client";
import { MemberController } from "./member.controller";

const route = Router();

route.get("/get-my-pending-ideas", checkAuth(Role.MEMBER), MemberController.getMyPendingIdeas);
route.get("/get-my-purchase-ideas", checkAuth(Role.MEMBER), MemberController.getMyPurchaseIdea);
route.get("/get-member-stat", checkAuth(Role.ADMIN, Role.MEMBER), MemberController.getMemberStat);

export const MemberRoutes = route;