import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../../generated/prisma";
import { CommentController } from "./comments.controller";

const route = Router();

route.post("/create-comment/:id", checkAuth(Role.ADMIN, Role.MEMBER), CommentController.createComment)

export const CommentRoute = route;