import status from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/app-error";
import { IRequestUser } from "../auth/auth.interface";
import { ICreateCategoryPayload, IUpdateCategoryPayload } from "./category.interface";

const createCategory = async (payload: ICreateCategoryPayload, user: IRequestUser) => {
    const isUserExist = await prisma.user.findUnique({
        where: { id: user.id }
    });
    if (!isUserExist) {
        throw new AppError(status.UNAUTHORIZED, "User not found!!!");
    }
    const result = await prisma.category.create({
        data: {
            name: payload.name,
            slug: payload.slug,
        }
    });
    return result;
}

const getAllCategory = async () => {
    const result = await prisma.category.findMany();
    return result;
}

const getCategoryById = async (id: string) => {
    const result = await prisma.category.findUnique({
        where: { id }
    });
    return result;
}

const updateCategory = async (id: string, payload: IUpdateCategoryPayload) => {
    const result = await prisma.category.update({
        where: { id },
        data: payload
    });
    return result;
}

export const categoryService = {
    createCategory,
    getAllCategory,
    getCategoryById,
    updateCategory
}