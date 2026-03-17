import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../../generated/prisma";
import { categoryController } from "./category.controller";

const route = Router();

route.post("/", checkAuth(Role.ADMIN), categoryController.createCategory);
route.get("/", checkAuth(Role.ADMIN), categoryController.getAllCategory);
route.get("/:id", checkAuth(Role.ADMIN), categoryController.getCategoryById);
route.patch("/:id", checkAuth(Role.ADMIN), categoryController.updateCategory);

export const CategoryRoute = route