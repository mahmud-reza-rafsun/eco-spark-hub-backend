/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/app-error";
import { ICreateIdeaPayload, IUpdateIdeaPayload } from "./idea.interface";
import { IRequestUser } from "../auth/auth.interface";
import { Role } from "../../generated/prisma";

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
            images: images,
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

const getAllIdea = async (params: {
    searchTerm?: string;
    categoryId?: string;
    page?: string;
    limit?: string;
}) => {
    const { searchTerm, categoryId, page = '1', limit = '10' } = params;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

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
        skip,
        take: limitNum,
        include: {
            author: {
                select: {
                    name: true,
                    email: true,
                },
            },
            category: {
                select: {
                    name: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    const total = await prisma.idea.count({
        where: whereConditions,
    });

    return {
        meta: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
        },
        data: result,
    };
};

const getIdeaById = async (id: string) => {
    const result = await prisma.idea.findUnique({
        where: {
            id: id,
        }
    });
    return result;
}

const updateIdea = async (user: IRequestUser, id: string, payload: IUpdateIdeaPayload) => {
    const isUserExist = await prisma.user.findUnique({
        where: {
            id: user.id
        }
    });
    if (!isUserExist) {
        throw new AppError(status.NOT_FOUND, "User Not Found");
    }
    if (isUserExist.role !== (Role.MEMBER && Role.ADMIN)) {
        throw new AppError(status.UNAUTHORIZED, "UnAuthroized Access!!!")
    }
    const result = await prisma.idea.update({
        where: {
            id: id
        },
        data: {
            title: payload.title,
            problem: payload.problem,
            solution: payload.solution,
            description: payload.description,
            price: payload.price,
            images: payload.images
        }
    });

    return result;
}

export const IdeaService = {
    createIdea,
    getAllIdea,
    getIdeaById,
    updateIdea
};