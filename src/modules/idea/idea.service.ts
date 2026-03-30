/* eslint-disable @typescript-eslint/no-explicit-any */
import status from 'http-status';
import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/app-error";
import { ICreateIdeaPayload, IUpdateIdeaPayload } from "./idea.interface";
import { IRequestUser } from "../auth/auth.interface";
import { IdeaStatus, Role, UserStatus } from "@prisma/client";

const createIdea = async (payload: ICreateIdeaPayload, id: string) => {
    const { title, problem, solution, description, price, images, categoryId } = payload;

    const isUserExist = await prisma.user.findUnique({
        where: {
            id: id,
            isDeleted: false,
        }
    });

    if (!isUserExist) {
        throw new AppError(status.NOT_FOUND, "User not found!!!");
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
            categoryId: isCategoryExist.id,
            status: IdeaStatus.PENDING
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
    userId?: string;
    sortBy?: string;
    page?: string;
    limit?: string;
}) => {
    const { searchTerm, categoryId, userId, sortBy, page = '1', limit = '6' } = params;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const whereConditions: any = {
        isDeleted: false,
        status: IdeaStatus.APPROVED,
        ...(categoryId && { categoryId }),
        ...(searchTerm && {
            OR: [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { category: { name: { contains: searchTerm, mode: 'insensitive' } } },
            ],
        }),
    };

    let orderBy: any = { createdAt: 'desc' };

    if (sortBy === 'oldest') {
        orderBy = { createdAt: 'asc' };
    } else if (sortBy === 'alphabetical') {
        orderBy = { title: 'asc' };
    } else if (sortBy === 'popular') {
        orderBy = { votes: { _count: 'desc' } };
    }

    const result = await prisma.idea.findMany({
        where: whereConditions,
        skip: skip,
        take: limitNum,
        include: {
            comments: {
                where: { parentId: null },
                include: {
                    user: { select: { name: true, image: true, email: true } },
                    replies: { include: { user: { select: { name: true, email: true, image: true } } } }
                },
                orderBy: { createdAt: 'desc' }
            },
            votes: true,
            category: { select: { name: true, slug: true } },
            author: { select: { name: true, email: true } },
            _count: { select: { votes: true, comments: true } }
        },
        orderBy,
    });

    const total = await prisma.idea.count({
        where: whereConditions
    });

    const transformedData = result.map((idea) => {
        const upvotes = idea.votes.filter(v => v.type === 'UPVOTE').length;
        const downvotes = idea.votes.filter(v => v.type === 'DOWNVOTE').length;
        const userVote = idea.votes.find(v => v.userId === userId)?.type || null;

        return {
            ...idea,
            upvotes,
            downvotes,
            userVote,
            votes: undefined
        };
    });

    return {
        data: transformedData,
        meta: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
        },
    };
};


const getIdeaById = async (id: string) => {
    const result = await prisma.idea.findUnique({
        where: {
            id: id,
            isDeleted: false
        },
        include: {
            author: {
                select: {
                    name: true,
                    email: true,
                    image: true
                }
            },
            comments: {
                where: {
                    parentId: null
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            image: true,
                            email: true
                        }
                    },
                    replies: {
                        include: {
                            user: true,
                            replies: {
                                include: {
                                    user: true,
                                    replies: { include: { user: true } }
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            },
            votes: {
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            },
            _count: {
                select: {
                    votes: true
                }
            },
        }
    });
    return result;
}

const updateIdea = async (user: IRequestUser, id: string, payload: IUpdateIdeaPayload) => {
    const idea = await prisma.idea.findUnique({
        where: {
            id: id,
            isDeleted: false
        },
        select: {
            id: true,
            status: true,
            authorId: true
        }
    });

    if (!idea) {
        throw new AppError(status.NOT_FOUND, "Idea Not Found");
    }
    const isOwner = idea.authorId === user.id;
    const isAdmin = user.role === Role.ADMIN;

    if (!isOwner && !isAdmin) {
        throw new AppError(status.FORBIDDEN, "You are not allowed to update this idea.");
    }

    const extractData = (payload as any).payload ? (payload as any).payload : payload;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, authorId, createdAt, updatedAt, ...finalData } = extractData;

    return await prisma.idea.update({
        where: { id: id },
        data: finalData,
    });
}

const approveOrRejectIdea = async (user: IRequestUser, id: string, payload: { status: string; feedback?: string }) => {
    const isUserAdmin = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true }
    });

    if (isUserAdmin?.role !== Role.ADMIN) {
        throw new AppError(status.UNAUTHORIZED, "Unauthorized Access!!!");
    }

    const updateData: any = {
        status: payload.status,
    };

    if (payload.status === IdeaStatus.REJECTED && payload.feedback) {
        updateData.adminFeedback = payload.feedback;
    } else {
        updateData.adminFeedback = null;
    }

    const result = await prisma.idea.update({
        where: { id: id, },
        data: updateData,
        select: {
            title: true,
            images: true,
            description: true,
            status: true,
            adminFeedback: true
        }
    });

    return result;
};

const getMyIdea = async (id: string, userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId, isDeleted: false }
    });

    if (!user) {
        throw new AppError(status.NOT_FOUND, "User not found!");
    }

    if (user.status === UserStatus.BLOCKED) {
        throw new AppError(status.FORBIDDEN, "Your account is blocked!");
    }

    const result = await prisma.idea.findMany({
        where: {
            authorId: userId,
            isDeleted: false
        },
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            comments: {
                where: {
                    parentId: null
                },
                include: {
                    user: {
                        select: { name: true, image: true, email: true }
                    },
                    replies: {
                        include: {
                            user: {
                                select: { name: true, image: true, email: true }
                            },
                            replies: {
                                include: {
                                    user: {
                                        select: { name: true, image: true, email: true }
                                    },
                                    replies: {
                                        include: {
                                            user: {
                                                select: { name: true, image: true, email: true }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            },
            category: true,
            author: {
                select: { name: true, email: true, role: true }
            }
        }
    });

    return result;
};

const deleteIdea = async (id: string, userId: string) => {
    const existingIdea = await prisma.idea.findUnique({
        where: { id: id }
    });

    if (!existingIdea) {
        throw new AppError(status.NOT_FOUND, "Idea not found!");
    }
    if (existingIdea.status !== IdeaStatus.PENDING) {
        throw new AppError(status.BAD_REQUEST, "Only pending ideas can be deleted!");
    }
    if (existingIdea.authorId !== userId) {
        throw new AppError(status.FORBIDDEN, "You are not authorized to delete this idea!");
    }
    return await prisma.idea.update({
        where: { id: id },
        data: { isDeleted: true }
    });
};

const getPendingIdeas = async () => {
    const result = await prisma.idea.findMany({
        where: {
            status: { in: [IdeaStatus.PENDING, IdeaStatus.REJECTED] },
            isDeleted: false
        },
        orderBy: {
            createdAt: 'desc'
        },
        select: {
            id: true,
            title: true,
            images: true,
            price: true,
            status: true,
            problem: true,
            solution: true,
            description: true,
            author: {
                select: {
                    name: true,
                    email: true,
                    image: true
                }
            },
            category: {
                select: {
                    name: true,
                    slug: true
                }
            }
        }
    })
    return result;
}


export const IdeaService = {
    createIdea,
    getAllIdea,
    getIdeaById,
    updateIdea,
    approveOrRejectIdea,
    getMyIdea,
    deleteIdea,
    getPendingIdeas
};