import status from "http-status"
import { prisma } from "../../lib/prisma"
import { AppError } from "../../shared/errors/app-error"
import { IRequestUser } from "../auth/auth.interface"
import { ICreateCommentPayload, IUpdateComment } from "./comment.interface"

const createComment = async (payload: ICreateCommentPayload, user: IRequestUser, ideaId: string) => {
    const isUserLoggedIn = await prisma.user.findUnique({
        where: {
            id: user.id
        }
    })
    if (!isUserLoggedIn) {
        throw new AppError(status.UNAUTHORIZED, "Please login and try again")
    }
    const isOwnPost = await prisma.idea.findUnique({
        where: {
            id: ideaId
        },
        select: {
            authorId: true
        }
    })
    if (!isOwnPost) {
        throw new AppError(status.NOT_FOUND, "The post does not exist");
    }
    if (!payload.parentId && isOwnPost?.authorId === user.id) {
        throw new AppError(status.FORBIDDEN, "You can't comment on your own idea, but you can reply to others.");
    }
    const result = await prisma.comment.create({
        data: {
            ...payload,
            userId: user.id,
            ideaId: ideaId,
            parentId: payload.parentId || null
        }
    })

    return result
}

const getCommentsByIdeaId = async (ideaId: string) => {
    const result = await prisma.comment.findMany({
        where: {
            ideaId: ideaId,
            parentId: null
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                    email: true
                }
            },
            replies: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true
                        }
                    },
                    replies: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    image: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'asc'
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return result;
};

const updateComment = async (payload: IUpdateComment, id: string, user: IRequestUser) => {
    const existingComment = await prisma.comment.findUnique({
        where: { id: id },
        select: { userId: true }
    })
    if (!existingComment) {
        throw new AppError(status.NOT_FOUND, "Comment not found!");
    }
    if (existingComment.userId !== user.id) {
        throw new AppError(status.FORBIDDEN, "You are not authorized to update this comment!");
    }
    const result = await prisma.comment.update({
        where: { id: id },
        data: {
            ...payload,
        }
    });
    return result
}

const deleteComment = async (id: string, user: IRequestUser) => {
    const existingComment = await prisma.comment.findUnique({
        where: { id: id },
        select: { userId: true }
    });

    if (!existingComment) {
        throw new AppError(status.NOT_FOUND, "Comment not found!");
    }

    const isAdmin = user.role === 'ADMIN';
    const isOwner = existingComment.userId === user.id;

    if (!isAdmin && !isOwner) {
        throw new AppError(
            status.FORBIDDEN,
            "You can only delete your own comments. Admins can delete any comment."
        );
    }

    const result = await prisma.comment.delete({
        where: { id: id }
    });

    return result;
};

export const CommentService = {
    createComment,
    getCommentsByIdeaId,
    updateComment,
    deleteComment
}