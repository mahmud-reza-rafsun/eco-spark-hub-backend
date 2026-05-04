import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/app-error";
import status from "http-status";
import { IRequestUser } from "../auth/auth.interface";
import { ICreateInsightCategoryPayload } from "../../interface/insight.category.interface";

const createInsightCategory = async (user: IRequestUser, payload: ICreateInsightCategoryPayload,) => {
    const isUserExist = await prisma.user.findUnique({
        where: { id: user.id }
    });
    if (!isUserExist) {
        throw new AppError(status.UNAUTHORIZED, "User not found!!!");
    }
    const result = await prisma.insightCategory.create({
        data: {
            name: payload.name,
            slug: payload.slug,
        }
    });
    return result;
}

const getInsightCategory = async () => {
    const result = await prisma.insightCategory.findMany();
    return result;
};

export const insightCategory = {
    createInsightCategory,
    getInsightCategory
}