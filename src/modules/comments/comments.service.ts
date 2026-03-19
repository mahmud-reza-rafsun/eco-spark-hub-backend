import status from "http-status"
import { prisma } from "../../lib/prisma"
import { AppError } from "../../shared/errors/app-error"
import { IRequestUser } from "../auth/auth.interface"
import { ICreateCommentPayload } from "./comment.interface"

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

export const CommentService = {
    createComment
}