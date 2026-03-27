import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "@prisma/client";
import { CommentController } from "./comments.controller";

const route = Router();

route.get("/get-comments/:id", CommentController.getCommentsByIdeaId);
route.post("/create-comment/:id", checkAuth(Role.ADMIN, Role.MEMBER), CommentController.createComment)
route.patch("/update-comment/:id", checkAuth(Role.ADMIN, Role.MEMBER), CommentController.updateComment)
route.delete("/delete-comment/:id", checkAuth(Role.ADMIN, Role.MEMBER), CommentController.deleteComment)

export const CommentRoute = route;