/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/app-error";
import { ICreateIdeaPayload } from "./idea.interface";

const createIdea = async (payload: ICreateIdeaPayload, id: string) => {
    const { title, problem, solution, description, price, images, categoryId } = payload;

    const isUserExist = await prisma.user.findUnique({
        where: {
            id: id,
            isDeleted: false
        }
    });

    if (!isUserExist) {
        throw new AppError(status.UNAUTHORIZED, "User not found!!!");
    }

    const isCategoryExist = await prisma.category.findUnique({
        where: {
            id: categoryId
        }
    });

    if (!isCategoryExist) {
        throw new AppError(status.NOT_FOUND, "Category not found!!!");
    }

    const result = await prisma.idea.create({
        data: {
            title,
            problem,
            solution,
            description,
            price: Number(price),
            images: Array.isArray(images) ? images : [images],
            authorId: isUserExist.id,
            categoryId: isCategoryExist.id
        },
        include: {
            author: {
                select: {
                    name: true,
                    email: true
                }
            },
            category: {
                select: {
                    name: true
                }
            }
        }
    });

    return result;
};

const getAllIdea = async (params: { searchTerm?: string; categoryId?: string }) => {
    const { searchTerm, categoryId } = params;
    const whereConditions: any = {
        ...(categoryId && { categoryId }),

        ...(searchTerm && {
            OR: [
                {
                    title: {
                        contains: searchTerm,
                        mode: 'insensitive',
                    },
                },
                {
                    category: {
                        name: {
                            contains: searchTerm,
                            mode: 'insensitive',
                        },
                    },
                },
            ],
        }),
    };

    const result = await prisma.idea.findMany({
        where: whereConditions,
        include: {
            author: {
                select: {
                    name: true,
                    email: true
                }
            },
            category: {
                select: {
                    name: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    return result;
}

export const IdeaService = {
    createIdea,
    getAllIdea
};