import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../../generated/prisma";
import { VoteController } from "./vote.controller";

const route = Router();

route.post("/toggle-vote", checkAuth(Role.ADMIN, Role.MEMBER), VoteController.toggleVote)

export const VoteRoute = route;