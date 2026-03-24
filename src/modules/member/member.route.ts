import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "@prisma/client";
import { MemberController } from "./member.controller";

const route = Router();

route.get("/get-my-pending-ideas", checkAuth(Role.MEMBER), MemberController.getMyPendingIdeas);

export const MemberRoutes = route;