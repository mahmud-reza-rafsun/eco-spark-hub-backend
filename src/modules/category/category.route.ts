import { Router } from "express";
import { categoryController } from "./category.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "@prisma/client";

const route = Router();

route.post("/", checkAuth(Role.ADMIN), categoryController.createCategory);
route.get("/", checkAuth(Role.ADMIN, Role.MEMBER), categoryController.getAllCategory);
route.get("/:id", checkAuth(Role.ADMIN, Role.MEMBER), categoryController.getCategoryById);
route.patch("/:id", checkAuth(Role.ADMIN), categoryController.updateCategory);

export const CategoryRoute = route